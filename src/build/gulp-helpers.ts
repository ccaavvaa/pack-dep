// eslint-disable-next-line import/no-extraneous-dependencies
import * as gulp from 'gulp';
import fancyLog = require('fancy-log');

export type GulpTaskParameter = (error?: any) => void;
export function setTaskMeta(fn: gulp.TaskFunction, description?: string, displayName?: string): void {
    fn.description = description;
    fn.displayName = displayName || description;
}
export const trim = (s: string) => s ? s.trim() : undefined;
export function logExecOutput(err: Error, stdout: string, stderr: string) {
    stdout = trim(stdout);
    stderr = trim(stderr);
    let f: (msg: string) => void;
    let messages: string[] = [];
    if (err) {
        messages.push(err.message);
        f = fancyLog.error;
    } else {
        f = fancyLog.info;
    }
    if (stdout) {
        messages.push(stdout);
    }
    if (stderr) {
        messages.push(stderr);
    }
    f(messages.join('\n'));
};
