import { GulpTaskParameter, logExecOutput } from './gulp-helpers';
import { exec } from 'child_process';

const testCmd = 'npm test';
export function test(done: GulpTaskParameter) {
    exec(testCmd, (err, stdout, stderr) => {
        logExecOutput(err, stdout, stderr);
        done(err);
    });
}
