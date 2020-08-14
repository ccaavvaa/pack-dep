/* eslint-disable @typescript-eslint/indent */
export interface IDepNode {
    nodes: IDepNode[];
}

enum Mark {
    unmarked = 0,
    temporary = 1,
    permanent = 2,
}
export class TopologicalSorter {
    private static readonly notDAG = 'Graph is not a Direct acyclic graph';
    private result: IDepNode[];

    private stack: IDepNode[];

    private markers: Map<IDepNode, Mark>;

    public execute(nodes: IDepNode[]): IDepNode[] {
        this.markers = new Map<IDepNode, Mark>(
            nodes.map((n) => [n, Mark.unmarked] as [IDepNode, Mark]));
        this.result = [];
        this.stack = [];
        for (const node of nodes) {
            const state = this.markers.get(node);
            if (state === Mark.unmarked) {
                this.visit(node);
            }
        }
        return this.result;
    }

    private visit(node: IDepNode): void {
        this.stack.push(node);
        const nodeState = this.markers.get(node);
        switch (nodeState) {
            case Mark.permanent:
                return;
            case Mark.temporary:
                throw new Error(TopologicalSorter.notDAG);
            case Mark.unmarked: {
                this.markers.set(node, Mark.temporary);
                node.nodes.forEach((n) => this.visit(n));
                this.markers.set(node, Mark.permanent);
                this.result.push(node);
                break;
            }

            default:
                throw new Error('invalid state');
        }
        this.stack.pop();
    }
}
