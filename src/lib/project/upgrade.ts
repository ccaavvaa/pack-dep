/* eslint-disable no-console */
import { PackageDeps } from '../deps/package-deps';
import { PackageTools } from '../deps/package';
import { SemVer } from 'semver';
import * as fs from '../tools/promisified-fs';
import { Git, Yarn, Npm } from '../actions/actions';
import { spinner } from '../tools/spinner';
import { getManifest, changePackageVersion, saveManifest } from '../tools/package-manifest';
import { Stats } from 'fs';

export type UpgradeType = 'major' | 'minor' | 'patch';
export interface PackageUpgradeIntention {
    name: string;
    type: UpgradeType;
}
export type PackageUpgradeIntentions = PackageUpgradeIntention[];
export type UpgradeStatus = 'planned' | 'folder-updated' | 'published';
export interface PackageUpgrade extends PackageUpgradeIntention {
    folder: string;
    repository: string;
    oldVersion: string;
    changes: string[];
    status: UpgradeStatus;
}
interface UpgradePlanData {
    upgrades: PackageUpgrade[];
    repositoryUrl?: string;
}
export class UpgradePlan {
    private data: UpgradePlanData;
    public constructor(data?: UpgradePlanData) {
        this.data = data || { upgrades: [] };
    }
    public static async load(fileName: string): Promise<UpgradePlan> {
        const upgradePlanData = await fs.readJson<UpgradePlanData>(fileName);
        return new UpgradePlan(upgradePlanData);
    }
    public get repositoryUrl() {
        return this.data.repositoryUrl;
    }
    public set repositoryUrl(value: string) {
        this.data.repositoryUrl = value;
    }
    public get upgrades() {
        return this.data.upgrades;
    }
    public set upgrades(value: PackageUpgrade[]) {
        this.data.upgrades = value;
    }
    public async save(fileName: string) {
        const content = JSON.stringify(this.data, null, 2);
        await fs.writeFile(fileName, content);
    }
}
export class UpgradeIntention {
    public intentions: PackageUpgradeIntentions;
    public constructor() {
        this.intentions = [];
    }

    public addIntentions(intentions: PackageUpgradeIntention[]) {
        for (const i of intentions) {
            this.add(i.name, i.type);
        }
    }
    public add(name: string, type?: UpgradeType) {
        let intention = this.getIntention(name);
        if (!intention) {
            intention = { name, type: type || 'minor' };
            this.intentions.push(intention);
        } else if (type) {
            intention.type = type;
        }
    }
    public getIntention(name: string) {
        return this.intentions.find(i => i.name === name);
    }
}

export class Upgrade {
    public readonly deps: PackageDeps;
    public readonly project: UpgradeIntention;
    public constructor(deps: PackageDeps) {
        this.deps = deps;
        this.project = new UpgradeIntention();
    }

    public static async getPlan(inputFile: string, intentions: string, outputFile: string): Promise<void> {
        const deps = await PackageDeps.fromFile(inputFile);
        const upgrade = new Upgrade(deps);
        const mappings: { [index: string]: UpgradeType } = {
            m: 'minor',
            minor: 'minor',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            M: 'major',
            major: 'major',
            p: 'patch',
            patch: 'patch',
        };
        upgrade.project.addIntentions(
            intentions
                .split(/[,;]/)
                .map((s) => {
                    const [name, t] = s.split(':', 2);
                    const type = mappings[t];
                    return { name, type };
                })
        );

        upgrade.fillDependents();
        const plan = await upgrade.createPlan('http://verdaccio');
        await plan.save(outputFile);
    }
    public static async execute(depsFileName: string, planFileName: string): Promise<void> {
        const deps = await PackageDeps.fromFile(depsFileName);
        const upgrade = new Upgrade(deps);
        const plan = await UpgradePlan.load(planFileName);
        await upgrade.executeEtape(plan);
        await plan.save(planFileName);
    }
    public static getNewVersion(oldVersion: string, type: UpgradeType) {
        type = type || 'patch';
        const semVer = new SemVer(oldVersion);
        const newVersion = semVer.inc(type);
        return newVersion.toString();
    }
    public fillDependents() {
        for (const intention of this.project.intentions) {
            const p = this.deps.deps.find((i) => PackageTools.getName(i) === intention.name);
            const allDependents = p.allDependents;
            if (allDependents) {
                for (const d of allDependents) {
                    const depName = PackageTools.extractName(d);
                    this.project.add(depName);
                }
            }
        }
        const sortedList = this.deps.topologicalSortedDeps.map((i) => PackageTools.getName(i));
        this.project.intentions.sort(
            (i1, i2) => sortedList.indexOf(i1.name) - sortedList.indexOf(i2.name)
        );
    }
    public async createPlan(npmRepository: string): Promise<UpgradePlan> {
        const packageUpgrades: PackageUpgrade[] = [];
        for (const intention of this.project.intentions) {
            const p = this.deps.deps.find((i) => PackageTools.getName(i) === intention.name);
            const repository = await this.deps.getRepositoryUrl(p);
            const oldVersion = p.version;
            const newVersion = Upgrade.getNewVersion(oldVersion, intention.type);
            const folder = await this.deps.getWorkingFolder(p);
            const changedDependencies = p.dependencies && p.dependencies.length ?
                p.dependencies.map((d) => PackageTools.extractName(d)) : [];
            const changes = changedDependencies.length ?
                packageUpgrades
                    .filter((c) => changedDependencies.indexOf(c.name) >= 0)
                    .map((c) => c.name)
                : [];
            const packageUpgrade: PackageUpgrade = {
                ...intention,
                oldVersion,
                folder,
                repository,
                changes,
                status: 'planned',
            };
            packageUpgrades.push(packageUpgrade);
        }
        const planData: UpgradePlanData = {
            upgrades: packageUpgrades,
        };
        const plan = new UpgradePlan();
        plan.upgrades = packageUpgrades;
        if (npmRepository) {
            plan.repositoryUrl = npmRepository;
        }
        return plan;
    };

    public async executeEtape(plan: UpgradePlan) {
        const currentPackageUpgrade = plan.upgrades.find((pu) => pu.status !== 'published');
        if (currentPackageUpgrade) {
            await this.executePackage(currentPackageUpgrade, plan);
        } else {
            console.log('Nothing to upgrade');
        }
    }
    public async executePackage(pu: PackageUpgrade, plan: UpgradePlan) {
        if (pu.status === 'planned') {
            await this.executeUpdateFolder(pu, plan);
        } else if (pu.status === 'folder-updated') {
            await this.executePublish(pu, plan);
        } else if (pu.status === 'published') {
            console.log(`Nothing to do for ${pu.name}`);
        } else {
            throw new Error(`Invalid status ${pu.status}`);
        }
    }
    public async executePublish(pu: PackageUpgrade, plan: UpgradePlan) {
        const packageFolder = pu.folder;
        await this.gitIsClean(packageFolder);
        const packageJson = await spinner(`Load manifest file for ${pu.name}`, async () => {
            const manifest = await getManifest(packageFolder);
            if (!manifest || !manifest.packageJson) {
                throw new Error('Invalid package folder');
            }
            return manifest.packageJson;
        });
        if (plan.repositoryUrl) {
            await spinner(`Set npm repository ${plan.repositoryUrl}`, async () => {
                packageJson.publishConfig = {
                    registry: plan.repositoryUrl,
                };
            });
        } else if (!packageJson.publishConfig || !packageJson.publishConfig.registry) {
            throw new Error('Npm repository is not defined');
        }
        const newVersion = Upgrade.getNewVersion(pu.oldVersion, pu.type);
        await spinner('Change version', async () => {
            packageJson.version = newVersion;
        });
        await spinner('Save changes', async () => {
            await saveManifest(packageJson, packageFolder);
        });
        await spinner(`Publish ${pu.name}`, async () => {
            const npm = new Npm(packageFolder);
            await npm.publish();
        });
        await spinner('Commit changes', async () => {
            await Git.commit(packageFolder, 'publish', 'package.json');
        });
        const tag = `v${newVersion}`;
        await spinner(`Add Tag ${tag}`, async () => {
            await Git.addTag(packageFolder, tag);
        });
        await spinner(`Push ${tag}`, async () => {
            await Git.push(packageFolder);
        });
        pu.status = 'published';
        await spinner('OK');
    }
    public async executeUpdateFolder(pu: PackageUpgrade, plan: UpgradePlan) {
        const packageFolder = pu.folder;
        let stat: Stats;
        try {
            stat = await fs.stat(packageFolder);
        } catch (e) {
            stat = null;
        }
        if (stat && !stat.isDirectory) {
            throw new Error(`Invalid directory ${packageFolder}`);
        }
        if (!stat) {
            console.log(`Folder ${packageFolder} not found.`);
            await spinner(`Clone ${pu.repository}`, async () => {
                await Git.clone(pu.repository, packageFolder);
            });
        } else {
            console.log(`Folder ${packageFolder} exists.`);
            await spinner(`Pull ${pu.repository}`, async () => {
                await Git.pull(pu.folder);
            });
            await this.gitIsClean(packageFolder);
        }
        if (pu.changes && pu.changes.length) {
            const packageJson = await spinner(`Load manifest file for ${pu.name}`, async () => {
                const manifest = await getManifest(packageFolder);
                if (!manifest || !manifest.packageJson) {
                    throw new Error('Invalid package folder');
                }
                return manifest.packageJson;
            });
            for (const changeName of pu.changes) {
                const change = plan.upgrades.find((u) => u.name === changeName);
                const newVersion = Upgrade.getNewVersion(change.oldVersion, change.type);
                const v = `^${newVersion}`;
                await spinner(`Change ${change.name} version to ${v}`, async () => {
                    changePackageVersion(packageJson, change.name, v);
                });
            }
            await spinner(`Save manifest file for ${pu.name}`, async () => {
                await saveManifest(packageJson, packageFolder);
            });
        }
        await spinner('Yarn install', async () => {
            const y = new Yarn(packageFolder);
            await y.install();
        });
        await spinner('Commit changes', async () => {
            let updatedPackages = pu.changes.join(',');
            if (updatedPackages) {
                updatedPackages = ' '.concat(updatedPackages);
            }
            await Git.commit(packageFolder, `update packages${updatedPackages}`, [
                'package.json',
                'yarn.lock',
            ]);
        });
        await this.gitIsClean(packageFolder);
        pu.status = 'folder-updated';
        await spinner('OK');
    }
    private async gitIsClean(localPath: string) {
        await spinner('Check git repository', async () => {
            const status = await Git.status(localPath);
            if (!status.isClean()) {
                throw new Error(`local git repository is not clean: ${localPath}`);
            }
        });
    }
}
