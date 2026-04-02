import type {Node} from "./Types.tsx"

export function getNodeById(nodes: Node[], id: string): Node{
    return nodes.find((n) => n.id === id)!;
}