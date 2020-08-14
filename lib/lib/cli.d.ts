export interface ProgramOptions {
    name: string;
    version: string;
}
export declare function getProgram(options: ProgramOptions): import("commander").Command;
