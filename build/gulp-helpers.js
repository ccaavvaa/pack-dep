"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logExecOutput = exports.trim = exports.setTaskMeta = void 0;
const fancyLog = require("fancy-log");
function setTaskMeta(fn, description, displayName) {
    fn.description = description;
    fn.displayName = displayName || description;
}
exports.setTaskMeta = setTaskMeta;
exports.trim = (s) => s ? s.trim() : undefined;
function logExecOutput(err, stdout, stderr) {
    stdout = exports.trim(stdout);
    stderr = exports.trim(stderr);
    let f;
    let messages = [];
    if (err) {
        messages.push(err.message);
        f = fancyLog.error;
    }
    else {
        f = fancyLog.info;
    }
    if (stdout) {
        messages.push(stdout);
    }
    if (stderr) {
        messages.push(stderr);
    }
    f(messages.join('\n'));
}
exports.logExecOutput = logExecOutput;
;
//# sourceMappingURL=gulp-helpers.js.map