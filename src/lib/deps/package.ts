import * as semver from 'semver';
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

export class PackageTools {
    public static extractName(nameAndVersion: string) {
        const versionIndex = nameAndVersion.indexOf('@', 1);
        return versionIndex >= 1 ? nameAndVersion.substr(0, versionIndex) : nameAndVersion;
    }
    public static isRoot(p: Package) {
        return !p.dependents || p.dependents.length === 0;
    }
    public static getFullName(p: Package) {
        let result = [PackageTools.getName(p)];
        if (p.version) {
            result.push(p.version);
        }
        return result.join('@');
    }
    public static getName(p: Package) {
        return p.namespace ? `${p.namespace}/${p.name}` : p.name;
    }

    public static compareByName(p1: Package, p2: Package): number {
        const name1 = PackageTools.getName(p1);
        const name2 = PackageTools.getName(p2);
        let result = name1.localeCompare(name2);
        if (!result) {
            const v1 = p1.version || '0.0.0';
            const v2 = p2.version || '0.0.0';
            result = semver.compare(v1, v2);
        }
        return result;
    }
    public static getPackageNameAndVersion(packageName: string) {
        const versionIndex = packageName.indexOf('@', 1);
        let name: string;
        let version: string;
        if (versionIndex >= 1) {
            name = packageName.substr(0, versionIndex);
            version = packageName.substr(versionIndex + 1);
        } else {
            name = packageName;
        }
        let namespace;
        if (packageName.startsWith('@')) {
            const elements = name.split('/', 2);
            namespace = elements[0];
            name = elements[1];
        }
        const result: PackageNameAndVersion = { name };
        if (namespace) {
            result.namespace = namespace;
        }
        if (version) {
            result.version = version;
        }
        return result;
    }
}
