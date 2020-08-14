/// <reference types="node" />
import * as fs from 'fs';
export declare const writeFile: typeof fs.writeFile.__promisify__;
export declare const stat: typeof fs.stat.__promisify__;
export declare const readFile: typeof fs.readFile.__promisify__;
export declare function readText(fileName: string): Promise<string>;
export declare function readJson<T>(fileName: string): Promise<T>;
