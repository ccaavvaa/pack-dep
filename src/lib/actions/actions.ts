import simpleGit, { SimpleGit } from 'simple-git';
import execa = require('execa');
import * as path from 'path';

export class Git {
    public static async clone(remoteUrl: string, localPath: string) {
        const git = simpleGit();
        if (remoteUrl.startsWith('git+')) {
            remoteUrl = remoteUrl.substr(4);
        }
        const cloneResult = await git.clone(remoteUrl, localPath);
        return cloneResult;
    }
    public static async pull(localPath: string) {
        const git = simpleGit(localPath);
        const cloneResult = await git.pull();
        return cloneResult;
    }
    public static async push(localPath: string) {
        const git = simpleGit(localPath);
        await git.push();
        await git.pushTags();
    }
    public static async commit(localPath: string, message: string, files?: string | string[]) {
        const git = simpleGit(localPath);
        return await git.commit(message, files);
    }
    public static async addTag(localPath: string, tag: string) {
        const git = simpleGit(localPath);
        return await git.addTag(tag);
    }
    public static async status(localPath: string){
        const git = simpleGit(localPath);
        return await git.status();
    }
}

export class Yarn {
    public readonly packageFolder: string;
    public constructor(packageFolder: string) {
        this.packageFolder = path.resolve(packageFolder);
    }
    public async install() {
        const { stderr, stdout } = await execa('yarn', ['install', '-s'], { cwd: this.packageFolder });
    }

    public async publish(newVersion: string) {
        const { stderr, stdout } =
            await execa('yarn', ['publish', '--new-version', newVersion], { cwd: this.packageFolder });
        return;
    }
}
export class Npm {
    public readonly packageFolder: string;
    public constructor(packageFolder: string) {
        this.packageFolder = path.resolve(packageFolder);
    }
    public async publish() {
        await execa('npm', ['publish', '--access', 'public'], { cwd: this.packageFolder });
        return;
    }
}
