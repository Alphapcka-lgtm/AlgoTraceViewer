
export type Edge = { fromId: number; toId: number; id: number };

export function Edges({ edges, getNode }: any) {
    return edges.map((e: Edge) => {
        const from = getNode(e.fromId);
        const to = getNode(e.toId);

        return (
            <line
                key={e.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="black"
                strokeWidth={1}
            />
        );
    });
}

export function PreviewEdge({ interaction, getNode }: any) {
    if (interaction.type !== "drawing-edge" || !interaction.to) return null;

    const from = getNode(interaction.fromId);

    return (
        <line
            key={-1}
            x1={from.x}
            y1={from.y}
            x2={interaction.to.x}
            y2={interaction.to.y}
            stroke="black"
            strokeWidth={1}
            strokeDasharray="4"
        />
    );
}