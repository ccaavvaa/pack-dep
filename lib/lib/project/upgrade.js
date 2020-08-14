"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upgrade = exports.UpgradeIntention = exports.UpgradePlan = void 0;
/* eslint-disable no-console */
const package_deps_1 = require("../deps/package-deps");
const package_1 = require("../deps/package");
const semver_1 = require("semver");
const fs = require("../tools/promisified-fs");
const actions_1 = require("../actions/actions");
const spinner_1 = require("../tools/spinner");
const package_manifest_1 = require("../tools/package-manifest");
class UpgradePlan {
    constructor(data) {
        this.data = data || { upgrades: [] };
    }
    static async load(fileName) {
        const upgradePlanData = await fs.readJson(fileName);
        return new UpgradePlan(upgradePlanData);
    }
    get repositoryUrl() {
        return this.data.repositoryUrl;
    }
    set repositoryUrl(value) {
        this.data.repositoryUrl = value;
    }
    get upgrades() {
        return this.data.upgrades;
    }
    set upgrades(value) {
        this.data.upgrades = value;
    }
    async save(fileName) {
        const content = JSON.stringify(this.data, null, 2);
        await fs.writeFile(fileName, content);
    }
}
exports.UpgradePlan = UpgradePlan;
class UpgradeIntention {
    constructor() {
        this.intentions = [];
    }
    addIntentions(intentions) {
        for (const i of intentions) {
            this.add(i.name, i.type);
        }
    }
    add(name, type) {
        let intention = this.getIntention(name);
        if (!intention) {
            intention = { name };
            this.intentions.push(intention);
        }
        if (type) {
            intention.type = type;
        }
    }
    getIntention(name) {
        return this.intentions.find(i => i.name === name);
    }
}
exports.UpgradeIntention = UpgradeIntention;
class Upgrade {
    constructor(deps) {
        this.deps = deps;
        this.project = new UpgradeIntention();
    }
    static async getPlan(inputFile, intentions, outputFile) {
        const deps = await package_deps_1.PackageDeps.fromFile(inputFile);
        const upgrade = new Upgrade(deps);
        const mappings = {
            m: 'minor',
            minor: 'minor',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            M: 'major',
            major: 'major',
            p: 'patch',
            patch: 'patch',
        };
        upgrade.project.addIntentions(intentions
            .split(/[,;]/)
            .map((s) => {
            const [name, t] = s.split(':', 2);
            const type = mappings[t];
            return { name, type };
        }));
        upgrade.fillDependents();
        const plan = await upgrade.createPlan('http://verdaccio');
        await plan.save(outputFile);
    }
    static async execute(depsFileName, planFileName) {
        const deps = await package_deps_1.PackageDeps.fromFile(depsFileName);
        const upgrade = new Upgrade(deps);
        const plan = await UpgradePlan.load(planFileName);
        await upgrade.executeEtape(plan);
        await plan.save(planFileName);
    }
    static getNewVersion(oldVersion, type) {
        type = type || 'patch';
        const semVer = new semver_1.SemVer(oldVersion);
        const newVersion = semVer.inc(type);
        return newVersion.toString();
    }
    fillDependents() {
        for (const intention of this.project.intentions) {
            const p = this.deps.deps.find((i) => package_1.PackageTools.getName(i) === intention.name);
            const allDependents = p.allDependents;
            if (allDependents) {
                for (const d of allDependents) {
                    const depName = package_1.PackageTools.extractName(d);
                    this.project.add(depName);
                }
            }
        }
        const sortedList = this.deps.topologicalSortedDeps.map((i) => package_1.PackageTools.getName(i));
        this.project.intentions.sort((i1, i2) => sortedList.indexOf(i1.name) - sortedList.indexOf(i2.name));
    }
    async createPlan(npmRepository) {
        const packageUpgrades = [];
        for (const intention of this.project.intentions) {
            const p = this.deps.deps.find((i) => package_1.PackageTools.getName(i) === intention.name);
            const repository = await this.deps.getRepositoryUrl(p);
            const oldVersion = p.version;
            const newVersion = Upgrade.getNewVersion(oldVersion, intention.type);
            const folder = await this.deps.getWorkingFolder(p);
            const changedDependencies = p.dependencies && p.dependencies.length ?
                p.dependencies.map((d) => package_1.PackageTools.extractName(d)) : [];
            const changes = changedDependencies.length ?
                packageUpgrades
                    .filter((c) => changedDependencies.indexOf(c.name) >= 0)
                    .map((c) => ({ name: c.name, oldVersion: c.oldVersion, newVersion: c.newVersion }))
                : [];
            const packageUpgrade = Object.assign(Object.assign({}, intention), { oldVersion,
                newVersion,
                folder,
                repository,
                changes, status: 'planned' });
            packageUpgrades.push(packageUpgrade);
        }
        const planData = {
            upgrades: packageUpgrades,
        };
        const plan = new UpgradePlan();
        plan.upgrades = packageUpgrades;
        if (npmRepository) {
            plan.repositoryUrl = npmRepository;
        }
        return plan;
    }
    ;
    async executeEtape(plan) {
        const currentPackageUpgrade = plan.upgrades.find((pu) => pu.status !== 'published');
        if (currentPackageUpgrade) {
            await this.executePackage(currentPackageUpgrade, plan.repositoryUrl);
        }
        else {
            console.log('Nothing to upgrade');
        }
    }
    async executePackage(pu, npmRegistry) {
        if (pu.status === 'planned') {
            await this.executeUpdateFolder(pu);
        }
        else if (pu.status === 'folder-updated') {
            await this.executePublish(pu, npmRegistry);
        }
        else if (pu.status === 'published') {
            console.log(`Nothing to do for ${pu.name}`);
        }
        else {
            throw new Error(`Invalid status ${pu.status}`);
        }
    }
    async executePublish(pu, npmRegistry) {
        const packageFolder = pu.folder;
        await this.gitIsClean(packageFolder);
        const packageJson = await spinner_1.spinner(`Load manifest file for ${pu.name}`, async () => {
            const manifest = await package_manifest_1.getManifest(packageFolder);
            if (!manifest || !manifest.packageJson) {
                throw new Error('Invalid package folder');
            }
            return manifest.packageJson;
        });
        if (npmRegistry) {
            await spinner_1.spinner(`Set npm repository ${npmRegistry}`, async () => {
                packageJson.publishConfig = {
                    registry: npmRegistry,
                };
            });
        }
        else if (!packageJson.publishConfig || !packageJson.publishConfig.registry) {
            throw new Error('Npm repository is not defined');
        }
        await spinner_1.spinner('Change version', async () => {
            packageJson.version = pu.newVersion;
        });
        await spinner_1.spinner('Save changes', async () => {
            await package_manifest_1.saveManifest(packageJson, packageFolder);
        });
        await spinner_1.spinner(`Publish ${pu.name}`, async () => {
            const npm = new actions_1.Npm(packageFolder);
            await npm.publish();
        });
        await spinner_1.spinner('Commit changes', async () => {
            await actions_1.Git.commit(packageFolder, 'publish', 'package.json');
        });
        const tag = `v${pu.newVersion}`;
        await spinner_1.spinner(`Add Tag ${tag}`, async () => {
            await actions_1.Git.addTag(packageFolder, tag);
        });
        await spinner_1.spinner(`Push ${tag}`, async () => {
            await actions_1.Git.push(packageFolder);
        });
        pu.status = 'published';
        await spinner_1.spinner('OK');
    }
    async executeUpdateFolder(pu) {
        const packageFolder = pu.folder;
        let stat;
        try {
            stat = await fs.stat(packageFolder);
        }
        catch (e) {
            stat = null;
        }
        if (stat && !stat.isDirectory) {
            throw new Error(`Invalid directory ${packageFolder}`);
        }
        if (!stat) {
            console.log(`Folder ${packageFolder} not found.`);
            await spinner_1.spinner(`Clone ${pu.repository}`, async () => {
                await actions_1.Git.clone(pu.repository, packageFolder);
            });
        }
        else {
            console.log(`Folder ${packageFolder} exists.`);
            await spinner_1.spinner(`Pull ${pu.repository}`, async () => {
                await actions_1.Git.pull(pu.folder);
            });
            await this.gitIsClean(packageFolder);
        }
        if (pu.changes && pu.changes.length) {
            const packageJson = await spinner_1.spinner(`Load manifest file for ${pu.name}`, async () => {
                const manifest = await package_manifest_1.getManifest(packageFolder);
                if (!manifest || !manifest.packageJson) {
                    throw new Error('Invalid package folder');
                }
                return manifest.packageJson;
            });
            for (const change of pu.changes) {
                const v = `^${change.newVersion}`;
                await spinner_1.spinner(`Change ${change.name} version to ${v}`, async () => {
                    package_manifest_1.changePackageVersion(packageJson, change.name, v);
                });
            }
            await spinner_1.spinner(`Save manifest file for ${pu.name}`, async () => {
                await package_manifest_1.saveManifest(packageJson, packageFolder);
            });
        }
        await spinner_1.spinner('Yarn install', async () => {
            const y = new actions_1.Yarn(packageFolder);
            await y.install();
        });
        await spinner_1.spinner('Commit changes', async () => {
            let updatedPackages = pu.changes.map((c) => c.name).join(',');
            if (updatedPackages) {
                updatedPackages = ' '.concat(updatedPackages);
            }
            await actions_1.Git.commit(packageFolder, `update packages${updatedPackages}`, [
                'package.json',
                'yarn.lock',
            ]);
        });
        await this.gitIsClean(packageFolder);
        pu.status = 'folder-updated';
        await spinner_1.spinner('OK');
    }
    async gitIsClean(localPath) {
        await spinner_1.spinner('Check git repository', async () => {
            const status = await actions_1.Git.status(localPath);
            if (!status.isClean()) {
                throw new Error(`local git repository is not clean: ${localPath}`);
            }
        });
    }
}
exports.Upgrade = Upgrade;
//# sourceMappingURL=upgrade.js.map