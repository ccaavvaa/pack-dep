import { PackageDeps } from '../deps/package-deps';
export declare type UpgradeType = 'major' | 'minor' | 'patch';
export interface PackageUpgradeIntention {
    name: string;
    type?: UpgradeType;
}
export declare type PackageUpgradeIntentions = PackageUpgradeIntention[];
export interface PackageChange extends PackageUpgradeIntention {
    oldVersion: string;
    newVersion: string;
}
export declare type UpgradeStatus = 'planned' | 'folder-updated' | 'published';
export interface PackageUpgrade extends PackageChange {
    folder: string;
    repository: string;
    changes: PackageChange[];
    status: UpgradeStatus;
}
interface UpgradePlanData {
    upgrades: PackageUpgrade[];
    repositoryUrl?: string;
}
export declare class UpgradePlan {
    private data;
    constructor(data?: UpgradePlanData);
    static load(fileName: string): Promise<UpgradePlan>;
    get repositoryUrl(): string;
    set repositoryUrl(value: string);
    get upgrades(): PackageUpgrade[];
    set upgrades(value: PackageUpgrade[]);
    save(fileName: string): Promise<void>;
}
export declare class UpgradeIntention {
    intentions: PackageUpgradeIntentions;
    constructor();
    addIntentions(intentions: PackageUpgradeIntention[]): void;
    add(name: string, type?: UpgradeType): void;
    getIntention(name: string): PackageUpgradeIntention;
}
export declare class Upgrade {
    readonly deps: PackageDeps;
    readonly project: UpgradeIntention;
    constructor(deps: PackageDeps);
    static getPlan(inputFile: string, intentions: string, outputFile: string): Promise<void>;
    static execute(depsFileName: string, planFileName: string): Promise<void>;
    static getNewVersion(oldVersion: string, type: UpgradeType): string;
    fillDependents(): void;
    createPlan(npmRepository: string): Promise<UpgradePlan>;
    executeEtape(plan: UpgradePlan): Promise<void>;
    executePackage(pu: PackageUpgrade, npmRegistry: string): Promise<void>;
    executePublish(pu: PackageUpgrade, npmRegistry: string): Promise<void>;
    executeUpdateFolder(pu: PackageUpgrade): Promise<void>;
    private gitIsClean;
}
export {};
