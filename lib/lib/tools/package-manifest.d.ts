import * as readPkgUp from 'read-pkg-up';
export declare type PackageManifest = readPkgUp.PackageJson;
export declare function getManifest(cwd: string): Promise<readPkgUp.ReadResult>;
export declare function changePackageVersion(manifest: PackageManifest, packageName: string, newVersion: string): string;
export declare function saveManifest(manifest: PackageManifest, packagePath: string): Promise<void>;
