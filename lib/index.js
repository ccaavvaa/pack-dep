"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const package_manifest_1 = require("./lib/tools/package-manifest");
const cli_1 = require("./lib/cli");
const path = require("path");
const cwd = path.resolve(__dirname, '..');
package_manifest_1.getManifest(cwd)
    .then((manifest) => {
    const program = cli_1.getProgram({
        name: manifest.packageJson.name,
        version: manifest.packageJson.version,
    });
    return program.parseAsync();
})
    .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(-1);
});
//# sourceMappingURL=index.js.map