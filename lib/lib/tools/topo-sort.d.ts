export interface IDepNode {
    nodes: IDepNode[];
}
export declare class TopologicalSorter {
    private static readonly notDAG;
    private result;
    private stack;
    private markers;
    execute(nodes: IDepNode[]): IDepNode[];
    private visit;
}
