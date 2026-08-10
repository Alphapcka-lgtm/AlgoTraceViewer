export type AlgorithmOverviewBoxProps = {
    algoTyp: "closestPair" | "suffixArray" | "vertexCover" | "ehrlichSwaps";
};
export function AlgorithmOverviewBox(prop:AlgorithmOverviewBoxProps) {
    if(prop.algoTyp === "closestPair") {
        return (
            <section className="algorithm-overview">
                <div className="algorithm-overview__content">
                    <h3>Closest Pair - Plane Sweep/Sweepline</h3>
                    <p>
                        The plane-sweep algorithm finds the closest pair of points by moving a vertical sweep line from left to right and processing one
                        point at a time. S denotes the shortest distance found so far.
                    </p>
                    <p>
                        Previously processed points remain relevant only while they are less than & to the left of the current point. These points form the
                        active set and lie inside the 6-wide active window. The active set is kept ordered by y-coordinate.
                    </p>

                    <p>
                        For the current point, only active points with y-coordinates between current.y - 6 and current.y + 5 need to be checked.
                        Together with the horizontal restriction of the active window, this defines a 5 x 25 candidate window to the left of the current
                        point.
                    </p>

                    <p>
                        Sorting the points by x-coordinate takes O(n log n) time. Using a balanced search tree for the y-ordered active set, inserting or
                        removing a point takes O (log n). Each point is inserted and removed at most once. Moreover, only a constant number of points
                        can lie in the candidate window without being closer than 6, so only a constant number of distance checks is required per point.
                        Therefore, the algorithm has a worst-case running time of O(n log n) and uses O(n) space.
                    </p>
                </div>
            </section>
        );
    }
}