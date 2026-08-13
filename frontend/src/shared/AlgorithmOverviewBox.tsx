import {useState} from "react";
import {ChevronsDownUp, ChevronsUpDown} from "lucide-react";

export type AlgorithmOverviewBoxProps = {
    algoTyp: "closestPair" | "suffixArray" | "vertexCover" | "ehrlichSwaps";
};
export function AlgorithmOverviewBox(props:AlgorithmOverviewBoxProps) {
    const [expanded, setExpanded] = useState(false);
    if(props.algoTyp === "closestPair") {
        return (
            <section className="algorithm-overview">
                <div className={`algorithm-overview__content ${expanded ? "algorithm-overview__content--expanded" : ""}`}>
                    <div className="algorithm-overview__header">
                        <h3>Closest Pair — Sweep Line</h3>
                        <button
                            type="button"
                            onClick={() => setExpanded(value => !value)}
                            className="control-button algorithm-overview__toggle"
                        >
                            {expanded ? <ChevronsDownUp/> : <ChevronsUpDown/>}
                        </button>
                    </div>
                        <p>
                            The sweep-line algorithm finds the closest pair of points by moving a vertical sweep line from
                            left to right and processing one point at a time, called the current point. δ denotes the shortest
                            Euclidean distance found so far.
                        </p>
                        <p>
                            Previously processed points inside the δ-wide active window form what is called the active set,
                            which is kept ordered by y-coordinate. Only active points need to be considered for a closer pair with the current point.
                            Once a point leaves the active window, its horizontal distance from the current point is already at least δ.
                            As the sweep only moves to the right, that point can also be discarded for all future points.
                        </p>
                        <p>
                            For the current point, only active points with y-coordinates between
                            current.y − δ and current.y + δ need to be considered: their distances to the current point are calculated and compared with δ.
                            Together with the horizontal restriction of the active window, this defines a δ × 2δ candidate window
                            to the left of and vertically centered on the current point.
                        </p>
                        <p>
                            The points are first sorted by x-coordinate, which takes O(n log n) time. Using a balanced search tree for the y-ordered active set,
                            inserting or removing a point takes O(log n), and each of the n points is inserted and removed at most once.
                            It can also be shown that at most 10 points can lie within the candidate window for each current point,
                            bounding the number of distance calculations per point by a constant and therefore all distance calculations by O(n).
                            Since O(n log n) dominates O(n), the algorithm has a time complexity of O(n log n) and uses O(n) space.
                        </p>
                </div>
            </section>
        );
    } else if (props.algoTyp === "vertexCover") {

        return (
            <section className="algorithm-overview">
                <div className={`algorithm-overview__content ${expanded ? "algorithm-overview__content--expanded" : ""}`}>
                    <div className="algorithm-overview__header">
                        <h3>Vertex Cover</h3>
                        <button
                            type="button"
                            onClick={() => setExpanded(value => !value)}
                            className="control-button algorithm-overview__toggle"
                        >
                            {expanded ? <ChevronsDownUp/> : <ChevronsUpDown/>}
                        </button>
                    </div>
                    <p>In <em>Introduction to Algorithms</em>, a vertex cover and the associated problem are defined as follows.</p>
                    <div className="algorithm-overview__definition">
                        <p>
                            A <strong>vertex cover</strong> of an undirected graph G = (V, E) is a subset V′ ⊆ V
                            such that if (u, v) is an edge of G, then either u ∈ V′ or v ∈ V′ (or both).
                            The size of a vertex cover is the number of vertices in it.
                        </p>
                        <p>
                            The <strong>vertex-cover problem</strong> is to find a vertex cover of minimum size
                            in a given undirected graph. We call such a vertex cover an <strong>optimal vertex cover</strong>.
                            This problem is the optimization version of an NP-complete decision problem.
                        </p>
                        <p>
                            Even though we don't know how to find an optimal vertex cover in a graph G in polynomial
                            time, we can efficiently find a vertex cover that is near-optimal.
                        </p>
                        <p className="algorithm-overview__source">
                            Source: Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009).
                            <em> Introduction to Algorithms</em> (3rd ed.), p. 1108. MIT Press.
                        </p>
                    </div>
                    <p>
                        The book then presents the random heuristic, which produces a vertex cover at most twice the size
                        of an optimal vertex cover. On this page, this heuristic can be explored along with two additional approaches.
                    </p><h3>Random Heuristic</h3>
                    <p>
                        The random heuristic chooses a random edge from the set of remaining edges and adds both
                        of its nodes to the vertex cover. All edges incident to either of the added nodes are then
                        removed from the set of remaining edges. These steps are repeated until no edges remain.
                    </p>

                    <h3>Max Degree Heuristic</h3>
                    <p>
                        The max degree heuristic maintains an updated map of nodes and their degrees with respect
                        to the set of remaining edges. In each iteration, the node with the highest degree is added
                        to the vertex cover. All edges incident to the added node are then removed from the set of
                        remaining edges, and the map is updated accordingly. These steps are repeated until no
                        edges remain.
                    </p>

                    <h3>Static List Heuristic</h3>
                    <p>
                        The static list heuristic also determines the degree of each node. These degrees are used
                        to create a static list in which the nodes are sorted by degree in descending order.
                        The nodes are processed one after another in this fixed order. When a node is added to the
                        vertex cover, all of its incident edges are removed from the set of remaining edges.
                        The algorithm terminates when no edges remain.
                    </p>
                </div>
            </section>
        );
    }
}