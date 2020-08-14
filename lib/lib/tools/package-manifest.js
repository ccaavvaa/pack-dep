"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveManifest = exports.changePackageVersion = exports.getManifest = void 0;
const readPkgUp = require("read-pkg-up");
const path = require("path");
const promisified_fs_1 = require("../tools/promisified-fs");
async function getManifest(cwd) {
    if (!cwd) {
        throw new Error('Path is empty');
    }
    return readPkgUp({
        cwd,
        normalize: false,
    });
}
exports.getManifest = getManifest;
function changePackageVersion(manifest, packageName, newVersion) {
    for (const d of [manifest.dependencies, manifest.devDependencies]) {
        if (d) {
            const oldVersion = d[packageName];
            if (oldVersion) {
                d[packageName] = newVersion;
            }
            return oldVersion;
        }
    }
    throw new Error(`Package ${packageName} is not used by ${manifest.name}`);
}
exports.changePackageVersion = changePackageVersion;
async function saveManifest(manifest, packagePath) {
    const fileName = path.resolve(packagePath, 'package.json');
    const content = JSON.stringify(manifest, null, 2);
    await promisified_fs_1.writeFile(fileName, content);
}
exports.saveManifest = saveManifest;
//# sourceMappingURL=package-manifest.js.map