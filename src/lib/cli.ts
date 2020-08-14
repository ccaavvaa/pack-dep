import { program, Command } from 'commander';
import { PackageDeps } from './deps/package-deps';
import { Upgrade } from './project/upgrade';
export interface ProgramOptions {
    name: string;
    version: string;
}
export function getProgram(options: ProgramOptions) {
    program
        .name(options.name)
        .version(options.version);
    program
        .command('get-deps <namespaces> <pathToPackage> <outputFile>')
        .description('get packages')
        .action(async (namespaces: string, pathToPackage, outputFile) =>
            await PackageDeps.getDeps(namespaces, pathToPackage as string, outputFile as string));
    program
        .command('create-plan <inputFile> <intentions> <outputFile>')
        .description('create execution plan')
        .action(async (inputFile, intentions, outputFile) => {
            await Upgrade.getPlan(inputFile as string, intentions as string, outputFile as string);
        });
    program
        .command('exec <depsFile> <planFile>')
        .description('create execution plan')
        .action(async (depsFile, planFile) => {
            await Upgrade.execute(depsFile as string, planFile as string);
        });
    return program;
}
