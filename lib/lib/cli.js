"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgram = void 0;
const commander_1 = require("commander");
const package_deps_1 = require("./deps/package-deps");
const upgrade_1 = require("./project/upgrade");
function getProgram(options) {
    commander_1.program
        .name(options.name)
        .version(options.version);
    commander_1.program
        .command('get-deps <namespaces> <pathToPackage> <outputFile>')
        .description('get packages')
        .action(async (namespaces, pathToPackage, outputFile) => await package_deps_1.PackageDeps.getDeps(namespaces, pathToPackage, outputFile));
    commander_1.program
        .command('create-plan <inputFile> <intentions> <outputFile>')
        .description('create execution plan')
        .action(async (inputFile, intentions, outputFile) => {
        await upgrade_1.Upgrade.getPlan(inputFile, intentions, outputFile);
    });
    commander_1.program
        .command('exec <depsFile> <planFile>')
        .description('create execution plan')
        .action(async (depsFile, planFile) => {
        await upgrade_1.Upgrade.execute(depsFile, planFile);
    });
    return commander_1.program;
}
exports.getProgram = getProgram;
//# sourceMappingURL=cli.js.map