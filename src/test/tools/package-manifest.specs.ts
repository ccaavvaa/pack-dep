/* eslint-disable prefer-arrow/prefer-arrow-functions */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'mocha';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, assert } from 'chai';
import '../debug-test';
import * as path from 'path';
import * as packageManifest from '../../lib/tools/package-manifest';

describe('PackageManifest', function () {
    it('get package manifest with cwd', async function () {
        const cwd = path.resolve(__dirname);
        const actual = await packageManifest.getManifest(cwd);

        const packageDir = path.resolve(__dirname, '../../..', 'package.json');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const expectedManifest = require(packageDir);
        expect(actual.packageJson.name).equals(expectedManifest.name);
    });
    it('get package manifest when cwd is empty', async function () {
        try {
            await packageManifest.getManifest(null);
            assert(false, 'getManifest should throw');
        } catch {
            // nothing
        }
    });
});
