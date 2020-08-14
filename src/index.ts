import { getManifest } from './lib/tools/package-manifest';
import { getProgram } from './lib/cli';
import * as path from 'path';

const cwd = path.resolve(__dirname, '..');
getManifest(cwd)
    .then((manifest) => {
        const program = getProgram({
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

