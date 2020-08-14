import execa = require('execa');
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
export async function getNpmRootPackage(path: string): Promise<NpmRootPackage> {
    const {stdout} = await execa('npm', ['list', '--json'], {
        cwd: path,
        shell: false,
    });
    const result = JSON.parse(stdout) as NpmRootPackage;
    return result;
}
