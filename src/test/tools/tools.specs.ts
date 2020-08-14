/* eslint-disable prefer-arrow/prefer-arrow-functions */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'mocha';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';
import '../debug-test';
import { PackageNameAndVersion, PackageTools } from '../../lib/deps/package';

describe('tools', function () {
    it('packageNameAndVersionParser', function () {
        const tests: Array<[string, PackageNameAndVersion]> = [
            ['@cavas/a@1.2.3', { name: 'a', namespace: '@cavas', version: '1.2.3' }],
            ['mm@1.2.3', { name: 'mm', version: '1.2.3' }],
            ['@x/a', { name: 'a', namespace: '@x' }],
        ];

        for (const [v, expected] of tests) {
            const actual = PackageTools.getPackageNameAndVersion(v);
            expect(actual).eql(expected);
        }
    });
});
