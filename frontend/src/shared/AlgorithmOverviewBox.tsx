export type AlgorithmOverviewBoxProps = {
    algoTyp: "closestPair" | "suffixArray" | "vertexCover" | "ehrlichSwaps";
};
export function AlgorithmOverviewBox(prop:AlgorithmOverviewBoxProps) {
    if(prop.algoTyp === "closestPair") {
        return (
            <section className="algorithm-overview">
                <div className="algorithm-overview__content">
                    <h3>Closest Pair — Sweep Line</h3>
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
    }
}