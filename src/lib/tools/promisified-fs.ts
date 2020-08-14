import * as fs from 'fs';
import { promisify } from 'util';
export const writeFile = promisify(fs.writeFile);
export const stat = promisify(fs.stat);
export const readFile = promisify(fs.readFile);
export async function readText(fileName: string): Promise<string>{
    const buf = await readFile(fileName);
    return buf.toString();
}
export async function readJson<T>(fileName: string): Promise<T>{
    const json = await readText(fileName);
    return JSON.parse(json) as T;
}
