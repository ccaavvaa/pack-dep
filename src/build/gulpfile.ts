/* eslint-disable import/no-extraneous-dependencies */
import * as gulp from 'gulp';
import * as compileTasks from './compile';
import * as testTasks from './test';
export const compile = compileTasks.compile;
export const test = testTasks.test;
export const buildCompile = compileTasks.buildCompile;
export default gulp.series(compile, test);
