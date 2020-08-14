/* eslint-disable prefer-arrow/prefer-arrow-functions */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'mocha';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';
import '../debug-test';
import { Package, PackageTools } from '../../lib/deps/package';
describe('PackageTools', function () {
    it('getName', function () {
        const tests: Array<[Package, string]> = [
            [{ name: 'x', namespace: '@a', version: '1.0.0'}, '@a/x'],
            [{ name: 'x', version: '1.0.0'}, 'x'],
        ];
        for (const [pack, expected] of tests) {
            const actual = PackageTools.getName(pack);
            expect(actual).equals(expected);
        }
    });
    it('compareByName', function () {
        const tests: Array<[Package, Package, number]> = [
            [
                { name: 'x', namespace: '@a', version: '1.0.0'},
                { name: 'x', namespace: '@a', version: '1.0.0'},
                0,
            ],
            [
                { name: 'x', version: '1.0.0'},
                { name: 'x', version: '1.0.0'},
                0,
            ],
            [
                { name: 'x', version: '1.0.0'},
                { name: 'x'},
                1,
            ],
            [
                { name: 'x', namespace: '@a', version: '1.0.0'},
                { name: 'x', version: '1.0.0'},
                -1,
            ],
            [
                { name: 'x', namespace: '@a', version: '1.1.0'},
                { name: 'x', namespace: '@a', version: '1.0.0'},
                1,
            ],
        ];
        for (const [p1, p2, expected] of tests) {
            const actual = PackageTools.compareByName(p1, p2);
            expect(actual).equals(expected);
            const inverse = PackageTools.compareByName(p2, p1);
            expect(inverse).equals(-expected);
        }
    });
});
