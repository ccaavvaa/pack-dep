export declare class Git {
    static clone(remoteUrl: string, localPath: string): Promise<string>;
    static pull(localPath: string): Promise<import("simple-git").PullResult>;
    static push(localPath: string): Promise<void>;
    static commit(localPath: string, message: string, files?: string | string[]): Promise<import("simple-git").CommitSummary>;
    static addTag(localPath: string, tag: string): Promise<{
        name: string;
    }>;
    static status(localPath: string): Promise<import("simple-git").StatusResult>;
}
export declare class Yarn {
    readonly packageFolder: string;
    constructor(packageFolder: string);
    install(): Promise<void>;
    publish(newVersion: string): Promise<void>;
}
export declare class Npm {
    readonly packageFolder: string;
    constructor(packageFolder: string);
    publish(): Promise<void>;
}
