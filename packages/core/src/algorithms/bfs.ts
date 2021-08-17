export class Node {
    edges: Node[];
    parent: Node | null;
    searched: boolean;
    value: string;

    constructor(value: string) {
        this.value = value;

        this.edges = [];

        this.searched = false;

        this.parent = null;
    }

    connect(neighbor: Node) {
        this.edges.push(neighbor);
        // both directions
        neighbor.edges.push(this);
    }
}

export class Graph {
    protected nodes: Node[];
    protected graph: Record<string, Node>;
    end: Node | null;
    start: Node | null;

    constructor() {
        this.nodes = [];

        this.graph = {};

        /**
         * @type {Node | null}
         * @public
         */
        this.end = null;

        /**
         * @type {Node | null}
         * @public
         */
        this.start = null;
    }

    reset() {
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].searched = false;
            this.nodes[i].parent = null;
        }
    }

    setStart(value: string) {
        this.start = this.graph[value];
        return this.start;
    }

    setEnd(value: string) {
        this.end = this.graph[value];
        return this.end;
    }

    addNode(n: Node) {
        this.nodes.push(n);
        this.graph[n.value] = n;
    }

    getNode(value: string) {
        return this.graph[value];
    }
}

/**
 * @param {Graph} graph
 */
export const bfs = (
    graph: Graph,
    foundCallback: (current: Node | undefined) => void = () => {}
) => {
    graph.reset();

    const queue: Node[] = [];

    if (!graph.start) throw new Error("Graph is missing start node.");
    if (!graph.end) throw new Error("Graph is msising end node.");
    graph.start.searched = true;
    queue.push(graph.start);

    while (queue.length > 0) {
        const current = queue.shift();
        if (current === graph.end) {
            foundCallback(current);
            break;
        }

        if (current) {
            const edges = current.edges;
            for (let i = 0; i < edges.length; i++) {
                const neighbor = edges[i];
                if (!neighbor.searched) {
                    neighbor.searched = true;
                    neighbor.parent = current;
                    queue.push(neighbor);
                }
            }
        }
    }

    const path: Node[] = [];
    path.push(graph.end);

    let next = graph.end.parent;
    while (next !== null) {
        path.push(next);
        next = next.parent;
    }

    return path;
};
