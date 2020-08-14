// import { YarnList, YarnListPackage, getYarnList } from './yarn';
import { Package, PackageTools } from './package';
import { NpmRootPackage, NpmDependencies, getNpmRootPackage } from './npm';
import * as _ from 'lodash';
import { IDepNode, TopologicalSorter } from '../tools/topo-sort';
import { PackageManifest, getManifest } from '../tools/package-manifest';
import * as path from 'path';
import { writeFile, readJson } from '../tools/promisified-fs';
export interface PackageDepsData {
    deps: Package[];
    rootFolderName: string;
}
export class PackageDeps {
    public get topologicalSortedDeps(): Package[] {
        if (!this._topologicalSortedDeps) {
            this._topologicalSortedDeps = this.topologicalSort();
        }
        return this._topologicalSortedDeps;
    }
    public get namespaces(): string[] {
        const ns = _.uniq(this.deps.map((p) => p.namespace || p.name));
        return ns;
    }
    public readonly manifests: Map<string, PackageManifest>;
    public readonly deps: Package[];
    public rootFolderName: string;
    private _topologicalSortedDeps: Package[];
    private constructor(data: PackageDepsData) {
        this.deps = data.deps;
        this.manifests = new Map<string, PackageManifest>();
        this.rootFolderName = data.rootFolderName;
        this.fillDependents();
    }
    public static async getDeps(namespaces: string, pathToPackage: string, outputFile: string): Promise<void> {
        pathToPackage = path.resolve(pathToPackage);
        const ns = namespaces.split(/[,;]/);
        const packageDeps = await PackageDeps.fromPackage(pathToPackage, ns);
        const s = packageDeps.toString();
        if (outputFile) {
            await writeFile(outputFile, s, { encoding: 'utf8' });
        } else {
            // eslint-disable-next-line no-console
            console.log(s);
        }
    }

    public static fromString(s: string): PackageDeps {
        const v = JSON.parse(s) as PackageDepsData;
        return new PackageDeps(v);
    }
    public static async fromFile(fileName: string): Promise<PackageDeps> {
        const v = await readJson<PackageDepsData>(fileName);
        return new PackageDeps(v);
    }
    // public static fromYarnList(yarnList: YarnList, namespaces: string[], root?: Package): PackageDeps {
    //     const yarnPackages = yarnList.data.trees;
    //     const globalList: Package[] = root ? [root] : [];
    //     this.fromYarnPackages(yarnPackages, namespaces, globalList, root);
    //     const deps = globalList.sort(PackageTools.compareByName);
    //     return new PackageDeps(globalList);
    // }

    public static fromNpmList(
        npmRootPackage: NpmRootPackage, namespaces: string[], rootFolderName: string): PackageDeps {

        const packageName = PackageTools.getPackageNameAndVersion(npmRootPackage.name);
        const root: Package = PackageDeps.acceptPackage(namespaces, packageName.name, packageName.namespace) ?
            {
                ...packageName,
                version: npmRootPackage.version,
            } : null;
        const globalList: Package[] = root ? [root] : [];
        this.fromNpmDeps(npmRootPackage.dependencies, namespaces, globalList, root);
        const deps = globalList.sort(PackageTools.compareByName);
        return new PackageDeps({ deps: globalList, rootFolderName });
    }

    // public static async fromPackageYarn(pathToPackage: string, namespaces: string[]): Promise<PackageDeps> {
    //     const manifest = await getManifest(pathToPackage);
    //     if (!manifest || !manifest.packageJson) {
    //         throw new Error(`Invalid package ${pathToPackage}`);
    //     }
    //     const packageName = getPackageNameAndVersion(manifest.packageJson.name);
    //     const rootPackage: Package = packageName.namespace && namespaces.indexOf(packageName.namespace) >= 0 ?
    //         {
    //             ...packageName,
    //             version: manifest.packageJson.version,
    //         } : null;
    //     const yarnList = await getYarnList(pathToPackage);
    //     return this.fromYarnList(yarnList, namespaces, rootPackage);
    // }
    public static async fromPackage(pathToPackage: string, namespaces: string[]): Promise<PackageDeps> {
        const npmRootPackage = await getNpmRootPackage(pathToPackage);
        const result = this.fromNpmList(npmRootPackage, namespaces, pathToPackage);
        return result;
    }
    // private static fromYarnPackages(
    //     yarnPackages: YarnListPackage[], namespaces: string[], globalList: Package[], root?: Package): Package[] {

    //     const result: Package[] = [];
    //     for (const yp of yarnPackages) {
    //         const nameAndVersion = getPackageNameAndVersion(yp.name);
    //         if (!nameAndVersion.namespace || namespaces.indexOf(nameAndVersion.namespace) < 0) {
    //             continue;
    //         }
    //         const pack: Package = {
    //             name: nameAndVersion.name,
    //             namespace: nameAndVersion.namespace,
    //             version: nameAndVersion.version,
    //         };
    //         let p = globalList.find((i) => i.name === pack.name);
    //         if (p) {
    //             if (p.version !== pack.version) {
    //                 throw new Error(`different versions for package ${pack.name}`);
    //             }
    //         } else {
    //             p = pack;
    //             globalList.push(p);
    //             if (yp.children && yp.children.length) {
    //                 p.deps = this.fromYarnPackages(yp.children, namespaces, globalList);
    //             }
    //         }
    //         result.push(p);
    //     }
    //     if (root) {
    //         root.deps = result;
    //     }
    //     return result;
    // }
    private static acceptPackage(namespaces: string[], pName: string, pNamespace: string): boolean {
        for (const namespace of namespaces) {
            if (namespace.startsWith('@')) {
                if (namespace === pNamespace) {
                    return true;
                }
            } else {
                if (namespace === pName) {
                    return true;
                }
            }
        }
        return false;
    }
    private static fromNpmDeps(
        npmDeps: NpmDependencies, namespaces: string[], globalList: Package[], root?: Package): Package[] {

        if (!npmDeps) {
            return [];
        }
        const result: Package[] = [];
        for (const name of Object.getOwnPropertyNames(npmDeps)) {
            const nameAndVersion = PackageTools.getPackageNameAndVersion(name);
            if (!PackageDeps.acceptPackage(namespaces, nameAndVersion.name, nameAndVersion.namespace)) {
                continue;
            }
            const { version, dependencies } = npmDeps[name];
            const pack: Package = {
                name: nameAndVersion.name,
                namespace: nameAndVersion.namespace,
                version,
            };
            let p = globalList.find((i) => i.name === pack.name);
            if (p) {
                if (p.version !== pack.version) {
                    throw new Error(`different versions for package ${pack.name}`);
                }
            } else {
                p = pack;
                globalList.push(p);
                if (dependencies) {
                    p.dependencies = this.fromNpmDeps(dependencies, namespaces, globalList)
                        .map((i) => PackageTools.getFullName(i));
                }
            }
            result.push(p);
        }
        if (root) {
            root.dependencies = result.map((i) => PackageTools.getFullName(i));
        }
        return result;
    }

    public toString(): string {
        const data: PackageDepsData = {
            deps: this.deps,
            rootFolderName: this.rootFolderName,
        };
        return JSON.stringify(data, null, 2);
    }
    public getGraphWizSource(): string {
        const result = ['digraph G {'];
        for (const p of this.topologicalSortedDeps) {
            const deps = this.getDirectDependents(p);
            if (deps.length) {
                result.push(...deps.map((s) => `"${p.name}" -> "${s.name}"`));
            }
        }
        result.push('}');
        return result.join('\n');
    }
    public async getWorkingFolder(p: Package) {
        this.checkRootFolder();
        if (PackageTools.isRoot(p)) {
            return path.resolve(this.rootFolderName);
        }
        return path.resolve(this.rootFolderName, '..', p.name);
    }
    public async getRepositoryUrl(p: Package) {
        const packageJson = await this.getPackageManifest(p);
        const repository = packageJson.repository;
        if (typeof (repository) === 'object') {
            return repository.url;
        } else {
            return repository;
        }
    }

    private fillDependents() {
        for (const p of this.deps) {
            const dependents = this
                .getDirectDependents(p)
                .map((i) => PackageTools.getFullName(i));
            if (dependents.length) {
                p.dependents = dependents;
            }
            const allDependents = this
                .getAllDependents(p)
                .map((i) => PackageTools.getFullName(i));
            if (allDependents.length) {
                p.allDependents = allDependents;
            }
        }
    }
    private getDirectDependents(p: Package) {
        const fullName = PackageTools.getFullName(p);
        return this.deps
            .filter((i) => i.dependencies && i.dependencies.indexOf(fullName) >= 0);
    }
    private getAllDependents(p: Package) {
        const direct = this.getDirectDependents(p);
        let all = direct;
        for (const i of direct) {
            all = _.union(all, this.getAllDependents(i));
        }
        all = all.sort(PackageTools.compareByName);
        return all;
    }
    private getDepNodes(): IPackageNode[] {
        const result: IPackageNode[] =
            this.deps.map((p) => ({ name: PackageTools.getFullName(p), nodes: [] }));
        for (const n of result) {
            const pack = this.deps.find((p) => PackageTools.getFullName(p) === n.name);
            if (pack.dependencies) {
                n.nodes = pack.dependencies.map((fullName) => result.find((i) => i.name === fullName));
            }
        }
        return result;
    }
    private topologicalSort(): Package[] {
        let nodes = this.getDepNodes();
        const sorter = new TopologicalSorter();
        nodes = sorter.execute(nodes) as IPackageNode[];
        return nodes.map((n) => this.deps.find((p) => PackageTools.getFullName(p) === n.name));
    }
    private async getPackageManifest(p: Package): Promise<PackageManifest> {
        const packageName = PackageTools.getName(p);
        let packageJson = this.manifests.get(packageName);
        if (packageJson) {
            return packageJson;
        }
        this.checkRootFolder();
        let packageFolder = path.resolve(this.rootFolderName);
        if (!PackageTools.isRoot(p)) {
            packageFolder = path.resolve(packageFolder, 'node_modules', packageName);
        }

        let manifest = await getManifest(packageFolder);
        if (!manifest || !manifest.packageJson) {
            throw new Error(`Invalid package folder: ${packageFolder}`);
        }
        packageJson = manifest.packageJson;
        this.manifests.set(packageName, packageJson);
        return packageJson;
    }
    private checkRootFolder() {
        if (!this.rootFolderName) {
            throw new Error('RootPackageFolder is not defined');
        }
    }
}
interface IPackageNode extends IDepNode {
    name: string;
}
