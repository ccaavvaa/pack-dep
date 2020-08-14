"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageDeps = void 0;
// import { YarnList, YarnListPackage, getYarnList } from './yarn';
const package_1 = require("./package");
const npm_1 = require("./npm");
const _ = require("lodash");
const topo_sort_1 = require("../tools/topo-sort");
const package_manifest_1 = require("../tools/package-manifest");
const path = require("path");
const promisified_fs_1 = require("../tools/promisified-fs");
class PackageDeps {
    constructor(data) {
        this.deps = data.deps;
        this.manifests = new Map();
        this.rootFolderName = data.rootFolderName;
        this.fillDependents();
    }
    get topologicalSortedDeps() {
        if (!this._topologicalSortedDeps) {
            this._topologicalSortedDeps = this.topologicalSort();
        }
        return this._topologicalSortedDeps;
    }
    get namespaces() {
        const ns = _.uniq(this.deps.map((p) => p.namespace || p.name));
        return ns;
    }
    static async getDeps(namespaces, pathToPackage, outputFile) {
        pathToPackage = path.resolve(pathToPackage);
        const ns = namespaces.split(/[,;]/);
        const packageDeps = await PackageDeps.fromPackage(pathToPackage, ns);
        const s = packageDeps.toString();
        if (outputFile) {
            await promisified_fs_1.writeFile(outputFile, s, { encoding: 'utf8' });
        }
        else {
            // eslint-disable-next-line no-console
            console.log(s);
        }
    }
    static fromString(s) {
        const v = JSON.parse(s);
        return new PackageDeps(v);
    }
    static async fromFile(fileName) {
        const v = await promisified_fs_1.readJson(fileName);
        return new PackageDeps(v);
    }
    // public static fromYarnList(yarnList: YarnList, namespaces: string[], root?: Package): PackageDeps {
    //     const yarnPackages = yarnList.data.trees;
    //     const globalList: Package[] = root ? [root] : [];
    //     this.fromYarnPackages(yarnPackages, namespaces, globalList, root);
    //     const deps = globalList.sort(PackageTools.compareByName);
    //     return new PackageDeps(globalList);
    // }
    static fromNpmList(npmRootPackage, namespaces, rootFolderName) {
        const packageName = package_1.PackageTools.getPackageNameAndVersion(npmRootPackage.name);
        const root = PackageDeps.acceptPackage(namespaces, packageName.name, packageName.namespace) ? Object.assign(Object.assign({}, packageName), { version: npmRootPackage.version }) : null;
        const globalList = root ? [root] : [];
        this.fromNpmDeps(npmRootPackage.dependencies, namespaces, globalList, root);
        const deps = globalList.sort(package_1.PackageTools.compareByName);
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
    static async fromPackage(pathToPackage, namespaces) {
        const npmRootPackage = await npm_1.getNpmRootPackage(pathToPackage);
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
    static acceptPackage(namespaces, pName, pNamespace) {
        for (const namespace of namespaces) {
            if (namespace.startsWith('@')) {
                if (namespace === pNamespace) {
                    return true;
                }
            }
            else {
                if (namespace === pName) {
                    return true;
                }
            }
        }
        return false;
    }
    static fromNpmDeps(npmDeps, namespaces, globalList, root) {
        if (!npmDeps) {
            return [];
        }
        const result = [];
        for (const name of Object.getOwnPropertyNames(npmDeps)) {
            const nameAndVersion = package_1.PackageTools.getPackageNameAndVersion(name);
            if (!PackageDeps.acceptPackage(namespaces, nameAndVersion.name, nameAndVersion.namespace)) {
                continue;
            }
            const { version, dependencies } = npmDeps[name];
            const pack = {
                name: nameAndVersion.name,
                namespace: nameAndVersion.namespace,
                version,
            };
            let p = globalList.find((i) => i.name === pack.name);
            if (p) {
                if (p.version !== pack.version) {
                    throw new Error(`different versions for package ${pack.name}`);
                }
            }
            else {
                p = pack;
                globalList.push(p);
                if (dependencies) {
                    p.dependencies = this.fromNpmDeps(dependencies, namespaces, globalList)
                        .map((i) => package_1.PackageTools.getFullName(i));
                }
            }
            result.push(p);
        }
        if (root) {
            root.dependencies = result.map((i) => package_1.PackageTools.getFullName(i));
        }
        return result;
    }
    toString() {
        const data = {
            deps: this.deps,
            rootFolderName: this.rootFolderName,
        };
        return JSON.stringify(data, null, 2);
    }
    getGraphWizSource() {
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
    async getWorkingFolder(p) {
        this.checkRootFolder();
        if (package_1.PackageTools.isRoot(p)) {
            return path.resolve(this.rootFolderName);
        }
        return path.resolve(this.rootFolderName, '..', p.name);
    }
    async getRepositoryUrl(p) {
        const packageJson = await this.getPackageManifest(p);
        const repository = packageJson.repository;
        if (typeof (repository) === 'object') {
            return repository.url;
        }
        else {
            return repository;
        }
    }
    fillDependents() {
        for (const p of this.deps) {
            const dependents = this
                .getDirectDependents(p)
                .map((i) => package_1.PackageTools.getFullName(i));
            if (dependents.length) {
                p.dependents = dependents;
            }
            const allDependents = this
                .getAllDependents(p)
                .map((i) => package_1.PackageTools.getFullName(i));
            if (allDependents.length) {
                p.allDependents = allDependents;
            }
        }
    }
    getDirectDependents(p) {
        const fullName = package_1.PackageTools.getFullName(p);
        return this.deps
            .filter((i) => i.dependencies && i.dependencies.indexOf(fullName) >= 0);
    }
    getAllDependents(p) {
        const direct = this.getDirectDependents(p);
        let all = direct;
        for (const i of direct) {
            all = _.union(all, this.getAllDependents(i));
        }
        all = all.sort(package_1.PackageTools.compareByName);
        return all;
    }
    getDepNodes() {
        const result = this.deps.map((p) => ({ name: package_1.PackageTools.getFullName(p), nodes: [] }));
        for (const n of result) {
            const pack = this.deps.find((p) => package_1.PackageTools.getFullName(p) === n.name);
            if (pack.dependencies) {
                n.nodes = pack.dependencies.map((fullName) => result.find((i) => i.name === fullName));
            }
        }
        return result;
    }
    topologicalSort() {
        let nodes = this.getDepNodes();
        const sorter = new topo_sort_1.TopologicalSorter();
        nodes = sorter.execute(nodes);
        return nodes.map((n) => this.deps.find((p) => package_1.PackageTools.getFullName(p) === n.name));
    }
    async getPackageManifest(p) {
        const packageName = package_1.PackageTools.getName(p);
        let packageJson = this.manifests.get(packageName);
        if (packageJson) {
            return packageJson;
        }
        this.checkRootFolder();
        let packageFolder = path.resolve(this.rootFolderName);
        if (!package_1.PackageTools.isRoot(p)) {
            packageFolder = path.resolve(packageFolder, 'node_modules', packageName);
        }
        let manifest = await package_manifest_1.getManifest(packageFolder);
        if (!manifest || !manifest.packageJson) {
            throw new Error(`Invalid package folder: ${packageFolder}`);
        }
        packageJson = manifest.packageJson;
        this.manifests.set(packageName, packageJson);
        return packageJson;
    }
    checkRootFolder() {
        if (!this.rootFolderName) {
            throw new Error('RootPackageFolder is not defined');
        }
    }
}
exports.PackageDeps = PackageDeps;
//# sourceMappingURL=package-deps.js.map