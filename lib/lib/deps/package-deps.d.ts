import { Package } from './package';
import { NpmRootPackage } from './npm';
import { PackageManifest } from '../tools/package-manifest';
export interface PackageDepsData {
    deps: Package[];
    rootFolderName: string;
}
export declare class PackageDeps {
    get topologicalSortedDeps(): Package[];
    get namespaces(): string[];
    readonly manifests: Map<string, PackageManifest>;
    readonly deps: Package[];
    rootFolderName: string;
    private _topologicalSortedDeps;
    private constructor();
    static getDeps(namespaces: string, pathToPackage: string, outputFile: string): Promise<void>;
    static fromString(s: string): PackageDeps;
    static fromFile(fileName: string): Promise<PackageDeps>;
    static fromNpmList(npmRootPackage: NpmRootPackage, namespaces: string[], rootFolderName: string): PackageDeps;
    static fromPackage(pathToPackage: string, namespaces: string[]): Promise<PackageDeps>;
    private static acceptPackage;
    private static fromNpmDeps;
    toString(): string;
    getGraphWizSource(): string;
    getWorkingFolder(p: Package): Promise<string>;
    getRepositoryUrl(p: Package): Promise<string>;
    private fillDependents;
    private getDirectDependents;
    private getAllDependents;
    private getDepNodes;
    private topologicalSort;
    private getPackageManifest;
    private checkRootFolder;
}
