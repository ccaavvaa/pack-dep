export interface Package {
    name: string;
    namespace?: string;
    dependencies?: string[];
    dependents?: string[];
    allDependents?: string[];
    version?: string;
}
export interface PackageNameAndVersion {
    name: string;
    namespace?: string;
    version?: string;
}
export declare class PackageTools {
    static extractName(nameAndVersion: string): string;
    static isRoot(p: Package): boolean;
    static getFullName(p: Package): string;
    static getName(p: Package): string;
    static compareByName(p1: Package, p2: Package): number;
    static getPackageNameAndVersion(packageName: string): PackageNameAndVersion;
}
