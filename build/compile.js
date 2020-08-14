"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCompile = exports.compile = exports.buildLint = exports.lint = exports.buildTsc = exports.tsc = exports.deleteBuildCompileOutput = exports.deleteCompilerOutput = void 0;
/* eslint-disable import/no-extraneous-dependencies */
const child_process_1 = require("child_process");
const del = require("del");
const fancyLog = require("fancy-log");
const gulp = require("gulp");
const gulp_helpers_1 = require("./gulp-helpers");
const tscCmd = 'npm run tsc --';
const compilerOutputGlobs = ['js', 'd.ts', 'map'].map(s => `/**/*.${s}`);
const compilerOutputFolders = [
    './lib',
];
const buildOutputFolders = [
    './build',
];
exports.deleteCompilerOutput = (_done) => removeCompilerOutput(compilerOutputFolders);
gulp_helpers_1.setTaskMeta(exports.deleteCompilerOutput, 'Delete compiler output');
async function deleteBuildCompileOutput(done) {
    return removeCompilerOutput(buildOutputFolders);
}
exports.deleteBuildCompileOutput = deleteBuildCompileOutput;
gulp_helpers_1.setTaskMeta(deleteBuildCompileOutput, 'Delete compiler output');
function tsc(done) {
    tscProject(done);
}
exports.tsc = tsc;
gulp_helpers_1.setTaskMeta(tsc, 'Compile typescript sources');
function buildTsc(done) {
    tscProject(done, './tsconfig-build.json');
}
exports.buildTsc = buildTsc;
gulp_helpers_1.setTaskMeta(buildTsc, 'Compile build sources');
function lint(done) {
    lintProject(done);
}
exports.lint = lint;
gulp_helpers_1.setTaskMeta(lint, 'Linting typescript sources');
function buildLint(done) {
    lintProject(done);
}
exports.buildLint = buildLint;
gulp_helpers_1.setTaskMeta(buildLint, 'Linting typescript sources');
exports.compile = gulp.series(exports.deleteCompilerOutput, lint, tsc);
exports.buildCompile = gulp.series(deleteBuildCompileOutput, buildLint, buildTsc);
function tscProject(done, tsconfigFile) {
    child_process_1.exec(tscCmd + ' --version', (err, stdout, stderr) => {
        gulp_helpers_1.logExecOutput(err, 'Compiling using TypeScript ' + stdout, stderr);
        stdout = gulp_helpers_1.trim(stdout);
        if (err) {
            done(err);
        }
        else {
            const cmdElements = [tscCmd];
            if (tsconfigFile) {
                cmdElements.push(`-p ${tsconfigFile}`);
            }
            // tslint:disable-next-line:no-shadowed-variable
            child_process_1.exec(cmdElements.join(' '), (err1, stdout1, stderr1) => {
                gulp_helpers_1.logExecOutput(err1, stdout1, stderr1);
                done(err);
            });
        }
    });
}
function lintProject(done) {
    child_process_1.exec('npm run lint', (err, stdout, stderr) => {
        gulp_helpers_1.logExecOutput(err, stdout, stderr);
        done(err);
    });
}
async function removeCompilerOutput(folders) {
    folders.forEach(s => fancyLog.info(s));
    const patterns = folders.reduce((p, v) => {
        p.push(...compilerOutputGlobs.map(s => v.concat(s)));
        return p;
    }, []);
    return del(patterns);
}
//# sourceMappingURL=compile.js.map