import { PackageDeps } from '../deps/package-deps';
export declare type UpgradeType = 'major' | 'minor' | 'patch';
export interface PackageUpgradeIntention {
    name: string;
    type: UpgradeType;
}
export declare type PackageUpgradeIntentions = PackageUpgradeIntention[];
export declare type UpgradeStatus = 'planned' | 'folder-updated' | 'published';
export interface PackageUpgrade extends PackageUpgradeIntention {
    folder: string;
    repository: string;
    oldVersion: string;
    changes: string[];
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
    executePackage(pu: PackageUpgrade, plan: UpgradePlan): Promise<void>;
    executePublish(pu: PackageUpgrade, plan: UpgradePlan): Promise<void>;
    executeUpdateFolder(pu: PackageUpgrade, plan: UpgradePlan): Promise<void>;
    private gitIsClean;
}
export {};
