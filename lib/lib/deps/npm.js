"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNpmRootPackage = void 0;
const execa = require("execa");
async function getNpmRootPackage(path) {
    const { stdout } = await execa('npm', ['list', '--json'], {
        cwd: path,
        shell: false,
    });
    const result = JSON.parse(stdout);
    return result;
}
exports.getNpmRootPackage = getNpmRootPackage;
//# sourceMappingURL=npm.js.map