/// <reference types="undertaker" />
import { GulpTaskParameter } from './gulp-helpers';
export declare const deleteCompilerOutput: (_done: GulpTaskParameter) => Promise<string[]>;
export declare function deleteBuildCompileOutput(done: GulpTaskParameter): Promise<string[]>;
export declare function tsc(done: GulpTaskParameter): void;
export declare function buildTsc(done: GulpTaskParameter): void;
export declare function lint(done: GulpTaskParameter): void;
export declare function buildLint(done: GulpTaskParameter): void;
export declare const compile: import("undertaker").TaskFunction;
export declare const buildCompile: import("undertaker").TaskFunction;
