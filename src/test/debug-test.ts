import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'mocha';
const myTestToDebug = fs.existsSync(path.join(__dirname, 'my-debug-test.js')) ?
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('./my-debug-test').testToDebug : 'execute plan';

// to debug all:
// const testToDebug: string = null;
// to test only test 'y' in suite 'x':
// const testToDebug = 'x y';

const testToDebug: string = myTestToDebug;

beforeEach(function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that: any = this;
    if (process.env.DEBUG_TEST === 'true' && testToDebug) {
        const fullTestTitle = getFullTitle(that.currentTest);
        if (fullTestTitle.search(testToDebug) < 0) {
            this.skip();
        }
    }
});

function getFullTitle(test: any): string {
    const titles: string[] = [];
    let current = test;
    while (current) {
        if (current.title) {
            titles.push(current.title);
        }
        current = current.parent;
    }
    return titles.reverse().join(' ');
}
