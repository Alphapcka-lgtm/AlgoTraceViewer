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
                    <div className="algorithm-overview__section">
                        <h4>Problem</h4>
                        <p>
                            Given a set P of points in the two-dimensional plane, the Closest Pair problem asks for
                            two distinct elements of P whose Euclidean distance is minimal.
                        </p>
                    </div>
                    <div className="algorithm-overview__section">
                        <h4>Solution</h4>
                        <p>
                            The <strong>sweep-line algorithm</strong>, also called plane sweep,
                            finds the closest pair of points by moving a vertical sweep line from left to right.
                            One point is processed at a time and is referred to as the current point. <strong>δ</strong> denotes the shortest
                            Euclidean distance found so far.
                        </p>
                        <p>
                            Previously processed points inside the <strong>δ-wide active window</strong> form the <strong>active set</strong>,
                            which is kept ordered by y-coordinate. Only active points need to be considered for a closer pair with the current point.
                            Once a point leaves the active window, its horizontal distance from the current point is already at least δ.
                            As the sweep only moves to the right, that point can also be discarded for all future points.
                        </p>
                        <p>
                            For the current point, only active points with y-coordinates between
                            current.y − δ and current.y + δ need to be considered: the distance from each candidate to the current point is calculated and compared with δ.
                            Together with the horizontal restriction of the active window, this defines a <strong>δ × 2δ candidate window </strong>
                            to the left of and vertically centered on the current point.
                        </p>
                    </div>
                    <div className="algorithm-overview__section">
                        <h4>Complexity</h4>
                        <p>
                            The points are first sorted by x-coordinate, which takes O(n log n) time. Using a balanced search tree for the y-ordered active set,
                            inserting or removing a point takes O(log n), and each of the n points is inserted and removed at most once.
                            It can also be shown that at most 10 points can lie within the candidate window for each current point,
                            bounding the number of distance calculations per point by a constant and therefore all distance calculations by O(n).
                            Since O(n log n) dominates O(n), the algorithm has a time complexity of <strong>O(n log n)</strong> and uses O(n) space.
                        </p>
                    </div>
                    <p></p>
                    <div className="algorithm-overview__sources">
                        <span><strong>Sources: </strong></span>
                        <a href="https://www.sciencedirect.com/science/article/abs/pii/0020019088901500" target="_blank" rel="noreferrer">
                            K. Hinrichs, J. Nievergelt & P. Schorn — Plane-Sweep Solves the Closest Pair Problem Elegantly
                        </a>

                        <span><strong> · </strong></span>
                        <a href="https://www.jn.ethz.ch/education/script/P6_C26.pdf" target="_blank" rel="noreferrer">
                            J. Nievergelt — Lecture Notes on Algorithms: The Closest Pair Problem
                        </a>

                        <span> · </span>
                        <a href="https://arxiv.org/pdf/2601.05681v1" target="_blank" rel="noreferrer">
                            M. Hitz & M. Hitz — On the Closest Pair of Points Problem
                        </a>
                    </div>
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
    } else if (props.algoTyp === "ehrlichSwaps") {
        return (
            <section className="algorithm-overview">
                <div className={`algorithm-overview__content ${expanded ? "algorithm-overview__content--expanded" : ""}`}>
                    <div className="algorithm-overview__header">
                        <h3>Ehrlich Swaps</h3>
                        <button
                            type="button"
                            onClick={() => setExpanded(value => !value)}
                            className="control-button algorithm-overview__toggle"
                        >
                            {expanded ? <ChevronsDownUp/> : <ChevronsUpDown/>}
                        </button>
                    </div>

                    <div className="algorithm-overview__section">
                        <h4>Problem</h4>
                        <p>
                            Given n distinct elements a₀, ..., aₙ₋₁, the goal is to generate all n! possible permutations of these elements.
                        </p>
                    </div>

                    <div className="algorithm-overview__section">
                        <h4>Solution</h4>
                        <p>
                            The <strong>Ehrlich Swaps Algorithm</strong> generates each permutation from its
                            predecessor using a single swap. The Algorithm always swaps the first element a₀ with another element.
                            These swaps are also called <strong>star transpositions</strong>.
                        </p>
                        <p>
                            The method uses two auxiliary arrays, <strong>b</strong> and <strong>c</strong>.
                            Initially, bⱼ = j. For each new permutation, a value <strong>k</strong> is
                            determined and the first element is swapped with the element at position bₖ:
                            a₀ ↔ a<sub>bₖ</sub>.
                        </p>
                        <p>
                            After the swap, the entries b₁, ..., b<sub>k-1</sub> are reversed. The resulting
                            b-array determines the positions used by subsequent swaps.
                        </p>
                        <p>
                            The values of k follow a regular pattern. If the swaps are numbered starting
                            with i = 1, then k is the largest value for which k! divides i.
                            Therefore, k is at least 1 for every swap, becomes 2 at every multiple of 2!,
                            3 at every multiple of 3!, and so on.
                        </p>
                    </div>

                    <div className="algorithm-overview__section">
                        <h4>Visualization</h4>
                        <p>
                            In the original Ehrlich Swaps Algorithm, the auxiliary array <strong>c</strong> is used
                            to determine the next value of k. Since c is only needed to generate the
                            sequence of k-values and is not unique to Ehrlich's method, it is not visualized here.
                        </p>
                        <p>
                            Instead, the visualization assumes a <strong>k-generator</strong> that
                            directly provides the same k-values. This allows the visualization to focus
                            on the operations that change the visible state: selecting bₖ, swapping
                            a₀ ↔ a<sub>bₖ</sub>, and reversing b₁, ..., bₖ₋₁.
                        </p>
                        <p>
                            This abstraction does not change the generated permutations or the swaps
                            performed by Ehrlich's method. It only replaces the internal calculation of
                            k through the c-array with its resulting sequence.
                        </p>
                    </div>

                    <div className="algorithm-overview__sources">
                        <span><strong>Source: </strong></span>
                        <span>Donald E. Knuth — <em>The Art of Computer Programming</em>, Algorithm E (Ehrlich swaps)</span>
                    </div>
                </div>
            </section>
        );
    }
}