"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Npm = exports.Yarn = exports.Git = void 0;
const simple_git_1 = require("simple-git");
const execa = require("execa");
const path = require("path");
class Git {
    static async clone(remoteUrl, localPath) {
        const git = simple_git_1.default();
        if (remoteUrl.startsWith('git+')) {
            remoteUrl = remoteUrl.substr(4);
        }
        const cloneResult = await git.clone(remoteUrl, localPath);
        return cloneResult;
    }
    static async pull(localPath) {
        const git = simple_git_1.default(localPath);
        const cloneResult = await git.pull();
        return cloneResult;
    }
    static async push(localPath) {
        const git = simple_git_1.default(localPath);
        await git.push();
        await git.pushTags();
    }
    static async commit(localPath, message, files) {
        const git = simple_git_1.default(localPath);
        return await git.commit(message, files);
    }
    static async addTag(localPath, tag) {
        const git = simple_git_1.default(localPath);
        return await git.addTag(tag);
    }
    static async status(localPath) {
        const git = simple_git_1.default(localPath);
        return await git.status();
    }
}
exports.Git = Git;
class Yarn {
    constructor(packageFolder) {
        this.packageFolder = path.resolve(packageFolder);
    }
    async install() {
        const { stderr, stdout } = await execa('yarn', ['install', '-s'], { cwd: this.packageFolder });
    }
    async publish(newVersion) {
        const { stderr, stdout } = await execa('yarn', ['publish', '--new-version', newVersion], { cwd: this.packageFolder });
        return;
    }
}
exports.Yarn = Yarn;
class Npm {
    constructor(packageFolder) {
        this.packageFolder = path.resolve(packageFolder);
    }
    async publish() {
        await execa('npm', ['publish', '--access', 'public'], { cwd: this.packageFolder });
        return;
    }
}
exports.Npm = Npm;
//# sourceMappingURL=actions.js.map