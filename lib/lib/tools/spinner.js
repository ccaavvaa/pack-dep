"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinner = void 0;
const ora = require("ora");
async function spinner(startMessage, f) {
    const s = ora(startMessage).start();
    try {
        const result = f ? await f() : null;
        s.succeed();
        return result;
    }
    catch (e) {
        s.fail();
        throw e;
    }
}
exports.spinner = spinner;
//# sourceMappingURL=spinner.js.map