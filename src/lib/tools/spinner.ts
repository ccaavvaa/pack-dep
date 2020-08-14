import * as ora from 'ora';
export async function spinner<T = void>(startMessage: string, f?: () => Promise<T>) {
    const s = ora(startMessage).start();
    try {
        const result = f ? await f() : null;
        s.succeed();
        return result;
    } catch (e) {
        s.fail();
        throw e;
    }
}
