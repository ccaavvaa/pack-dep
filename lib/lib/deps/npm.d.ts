export interface NpmDependencies {
    [name: string]: {
        version: string;
        dependencies?: NpmDependencies;
    };
}
export interface NpmRootPackage {
    name: string;
    version: string;
    dependencies: NpmDependencies;
}
export declare function getNpmRootPackage(path: string): Promise<NpmRootPackage>;
