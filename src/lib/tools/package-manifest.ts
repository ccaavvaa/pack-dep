import * as readPkgUp from 'read-pkg-up';
import * as path from 'path';
import { writeFile } from '../tools/promisified-fs';

export type PackageManifest = readPkgUp.PackageJson;
export async function getManifest(cwd: string) {
    if (!cwd) {
        throw new Error('Path is empty');
    }
    return readPkgUp({
        cwd,
        normalize: false,
    });
}
export function changePackageVersion(manifest: PackageManifest, packageName: string, newVersion: string) {
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
export async function saveManifest(manifest: PackageManifest, packagePath: string) {
    const fileName = path.resolve(packagePath, 'package.json');
    const content = JSON.stringify(manifest, null, 2);
    await writeFile(fileName, content);
}
