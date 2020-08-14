// import execa = require('execa');
// export interface YarnListPackage {
//     name: string;
//     children?: YarnListPackage[];
// }
// export interface YarnListData {
//     trees: YarnListPackage[];
// }
// export interface YarnList {
//     data: YarnListData;
// }
// export async function getYarnList(path: string): Promise<YarnList> {
//     const {stdout} = await execa('yarn', ['list', '--json'], {
//         cwd: path,
//         shell: false,
//     });
//     const result = JSON.parse(stdout) as YarnList;
//     return result;
// }
//# sourceMappingURL=yarn.js.map