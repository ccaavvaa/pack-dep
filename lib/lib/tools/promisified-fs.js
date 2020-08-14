"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJson = exports.readText = exports.readFile = exports.stat = exports.writeFile = void 0;
const fs = require("fs");
const util_1 = require("util");
exports.writeFile = util_1.promisify(fs.writeFile);
exports.stat = util_1.promisify(fs.stat);
exports.readFile = util_1.promisify(fs.readFile);
async function readText(fileName) {
    const buf = await exports.readFile(fileName);
    return buf.toString();
}
exports.readText = readText;
async function readJson(fileName) {
    const json = await readText(fileName);
    return JSON.parse(json);
}
exports.readJson = readJson;
//# sourceMappingURL=promisified-fs.js.map