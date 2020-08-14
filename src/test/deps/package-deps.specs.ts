/* eslint-disable prefer-arrow/prefer-arrow-functions */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'mocha';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, assert } from 'chai';
import '../debug-test';
import { PackageDeps } from '../../lib/deps/package-deps';
import * as path from 'path';
import { NpmRootPackage } from '../../lib/deps/npm';
describe('PackageDeps', function () {
    // it('fromYarnList 1', function () {
    //     const yarnList: YarnList = {
    //         data: {
    //             trees: [
    //                 {
    //                     name: '@x/b@1.0.0',
    //                     children: [
    //                         { name: 'aaa@1.2.3' },
    //                         { name: '@x/a@1.0.0' },
    //                     ],
    //                 },
    //                 {
    //                     name: '@x/a@1.0.0',
    //                 },
    //             ],
    //         },
    //     };
    //     const expected: Package[] = [
    //         {
    //             name: 'a',
    //             namespace: '@x',
    //             version: '1.0.0',
    //         },
    //         {
    //             name: 'b',
    //             namespace: '@x',
    //             deps: [
    //                 {
    //                     name: 'a',
    //                     namespace: '@x',
    //                     version: '1.0.0',
    //                 },
    //             ],
    //             version: '1.0.0',
    //         },
    //     ];

    //     const actual = PackageDeps.fromYarnList(yarnList, ['@x']);
    //     expect(actual.deps).eql(expected);
    // });
    // it('fromYarnList 2', function () {
    //     const yarnList: YarnList = {
    //         data: {
    //             trees: [
    //                 {
    //                     name: '@x/b@1.0.0',
    //                     children: [
    //                         { name: 'aaa@1.2.3' },
    //                         { name: '@x/a@1.0.0' },
    //                     ],
    //                 },
    //                 {
    //                     name: '@x/a@2.0.0',
    //                 },
    //             ],
    //         },
    //     };
    //     expect(() => PackageDeps.fromYarnList(yarnList, ['@x'])).to.throw();
    // });
    it('from package 1', async function () {
        this.timeout(30000);
        const pathToPackage = path.resolve(__dirname, '../../..');
        const deps = await PackageDeps.fromPackage(pathToPackage, ['@phoenix']);
        expect(deps.deps.length === 1 ? true : false).eql(true);
    });
    it('from package 2', async function () {
        const pathToPackage = path.resolve(__dirname, '../../../..');
        try {
            const deps = await PackageDeps.fromPackage(pathToPackage, ['@phoenix']);
            assert(false);
        } catch (ex) {
            //
        }
    });
    it('from package 3', async function () {
        this.timeout(30000);
        const pathToPackage = path.resolve(__dirname, '../../..');
        const deps = await PackageDeps.fromPackage(pathToPackage, ['@vv']);
        expect(deps.deps.length).equals(0);
    });
    it('toString/fromString', function () {
        const npmRootPackage: NpmRootPackage = {
            name: '@x/b',
            version: '1.0.0',
            dependencies: {
                'aaa': { version: '1.2.3' },
                '@x/a': { version: '1.0.0' },
            },
        };
        const d = PackageDeps.fromNpmList(npmRootPackage, ['@x'], 'x');
        const actual = d.toString();
        const e = PackageDeps.fromString(actual);
        expect(e.deps).eql(d.deps);
    });
});
