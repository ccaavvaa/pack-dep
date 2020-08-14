"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageTools = void 0;
const semver = require("semver");
class PackageTools {
    static extractName(nameAndVersion) {
        const versionIndex = nameAndVersion.indexOf('@', 1);
        return versionIndex >= 1 ? nameAndVersion.substr(0, versionIndex) : nameAndVersion;
    }
    static isRoot(p) {
        return !p.dependents || p.dependents.length === 0;
    }
    static getFullName(p) {
        let result = [PackageTools.getName(p)];
        if (p.version) {
            result.push(p.version);
        }
        return result.join('@');
    }
    static getName(p) {
        return p.namespace ? `${p.namespace}/${p.name}` : p.name;
    }
    static compareByName(p1, p2) {
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
    static getPackageNameAndVersion(packageName) {
        const versionIndex = packageName.indexOf('@', 1);
        let name;
        let version;
        if (versionIndex >= 1) {
            name = packageName.substr(0, versionIndex);
            version = packageName.substr(versionIndex + 1);
        }
        else {
            name = packageName;
        }
        let namespace;
        if (packageName.startsWith('@')) {
            const elements = name.split('/', 2);
            namespace = elements[0];
            name = elements[1];
        }
        const result = { name };
        if (namespace) {
            result.namespace = namespace;
        }
        if (version) {
            result.version = version;
        }
        return result;
    }
}
exports.PackageTools = PackageTools;
//# sourceMappingURL=package.js.map