// /* eslint-disable prefer-arrow/prefer-arrow-functions */
// // eslint-disable-next-line import/no-extraneous-dependencies
// import 'mocha';
// // eslint-disable-next-line import/no-extraneous-dependencies
// import { expect, assert } from 'chai';
// import '../debug-test';
// import { PackageDeps } from '../../lib/deps/package-deps';
// import * as path from 'path';
// import { Upgrade, UpgradePlan } from '../../lib/project/upgrade';
// describe('Upgrade', function () {
//     it('create plan', async function () {
//         this.timeout(30000);
//         const rootFolder = path.resolve(__dirname, '../../../../d');
//         const deps = await PackageDeps.fromPackage(rootFolder, ['@cavas']);
//         const upgrade = new Upgrade(deps);
//         upgrade.project.add('@cavas/b', 'minor');
//         upgrade.fillDependents();
//         const plan = await upgrade.createPlan('http://verdaccio');
//         expect(plan.upgrades.length).eql(3);
//         await plan.save(path.resolve(__dirname, 'tmp.json'));
//     });
//     it('load and execute plan', async function () {
//         this.timeout(30000);
//         const rootFolder = path.resolve(__dirname, '../../../../d');
//         const deps = await PackageDeps.fromPackage(rootFolder, ['@cavas']);
//         const upgrade = new Upgrade(deps);
//         const planFileName = path.resolve(__dirname, 'tmp.json');
//         const plan = await UpgradePlan.load(planFileName);
//         await upgrade.executeEtape(plan);
//         await plan.save(planFileName);
//     });
// });
