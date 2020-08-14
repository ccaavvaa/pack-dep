"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopologicalSorter = void 0;
var Mark;
(function (Mark) {
    Mark[Mark["unmarked"] = 0] = "unmarked";
    Mark[Mark["temporary"] = 1] = "temporary";
    Mark[Mark["permanent"] = 2] = "permanent";
})(Mark || (Mark = {}));
class TopologicalSorter {
    execute(nodes) {
        this.markers = new Map(nodes.map((n) => [n, Mark.unmarked]));
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
    visit(node) {
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
exports.TopologicalSorter = TopologicalSorter;
TopologicalSorter.notDAG = 'Graph is not a Direct acyclic graph';
//# sourceMappingURL=topo-sort.js.map