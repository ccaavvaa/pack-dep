"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
const gulp_helpers_1 = require("./gulp-helpers");
const child_process_1 = require("child_process");
const testCmd = 'npm test';
function test(done) {
    child_process_1.exec(testCmd, (err, stdout, stderr) => {
        gulp_helpers_1.logExecOutput(err, stdout, stderr);
        done(err);
    });
}
exports.test = test;
//# sourceMappingURL=test.js.map