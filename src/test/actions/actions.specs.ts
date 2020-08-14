/* eslint-disable prefer-arrow/prefer-arrow-functions */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'mocha';
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, assert } from 'chai';
import '../debug-test';
import * as path from 'path';
import { Git, Yarn } from '../../lib/actions/actions';
import del = require('del');

describe('Git', function () {
    it('clone, pull', async function () {
        this.timeout(30000);
        const remoteUrl = 'https://github.com/ccaavvaa/a.git';
        const localPath = path.resolve(__dirname, '../../../../x');
        const cloneResult = await Git.clone(remoteUrl, localPath);
        const pullResult = await Git.pull(localPath);
        await del(localPath, { force: true });
    });
});
describe('Yarn', function () {
    it('clone, pull', async function () {
        this.timeout(30000);
        const remoteUrl = 'https://salvia.visualstudio.com/DefaultCollection/SPO/_git/mdr-object-store';
        const localPath = path.resolve(__dirname, '../../../../x');
        const cloneResult = await Git.clone(remoteUrl, localPath);
        const y = new Yarn(localPath);
        await y.install();
        await del(localPath, { force: true });
    });
});
