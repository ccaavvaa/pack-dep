import * as gulp from 'gulp';
export declare type GulpTaskParameter = (error?: any) => void;
export declare function setTaskMeta(fn: gulp.TaskFunction, description?: string, displayName?: string): void;
export declare const trim: (s: string) => string;
export declare function logExecOutput(err: Error, stdout: string, stderr: string): void;
