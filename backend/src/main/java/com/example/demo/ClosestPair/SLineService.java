package com.example.demo.ClosestPair;
import dto.AlgorithmStepDTO;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SLineService {
    //https://arxiv-org.translate.goog/html/2601.05681v1?_x_tr_sl=en&_x_tr_tl=de&_x_tr_hl=de&_x_tr_pto=sge#S2
    //https://arxiv.org/pdf/2601.05681v1
    //https://www.sciencedirect.com/science/article/abs/pii/0020019088901500
    //https://pages.di.unipi.it/rossano/blog/2023/sweepline/
    //https://www.geeksforgeeks.org/dsa/closest-pair-of-points-using-sweep-line-algorithm/
    //https://www.jn.ethz.ch/education/script/P6_C26.pdf
    public List<AlgorithmStepDTO> nearestPoints(List<Point> points) {
        List<AlgorithmStepDTO> steps = new ArrayList<>();

        if (points == null || points.size() < 2) throw new IllegalArgumentException("There must be at least two points");

        List<Point> xSorted = new ArrayList<>(points);
        xSorted.sort(Comparator.comparingInt(Point::x).thenComparingInt(Point::y).thenComparing(Point::id));

        //Init the best pair and delta using the first two x-sorted points.
        Point p0 = xSorted.get(0);
        Point p1 = xSorted.get(1);
        double delta = euclideanDistance(p0, p1);
        PointPair currBestPair = new PointPair(p0, p1, delta);

        /*
         * Points currently inside the active x-range [current.x - delta, current.x).
         * The current point is inserted only after its candidates were checked.
         * The set is ordered by y-coordinate for selection of candidate points by their y-distance.
         * The id comparator keeps points with identical coordinates distinct.
        */
        TreeSet<Point> activePoints = new TreeSet<>(
                Comparator.comparingInt(Point::y).thenComparingInt(Point::x).thenComparing(Point::id));

        //Previously visited points that have already left the active x-range.
        //These points cannot form a closer pair with the current or any later point.
        List<Point> processedPoints = new ArrayList<>();
        //For the init snapshot, p1 is the current point and is therefore not yet shown as active (only p0).
        //It is inserted immediately after the snapshot.
        activePoints.add(p0);

        //shortcut for the delta control+cmd+space and then search delta
        String description = "Initialization: The points are sorted by x-coordinate. "
                + "The initial δ is computed from the first two points: dist("
                + p0.label() + ", " + p1.label() + ") = "
                + String.format("%.2f", delta) + ".";

        steps.add(new AlgorithmStepDTO(
                description, p1, delta, delta,
                new ArrayList<>(activePoints),
                xSorted, currBestPair,
                List.of(), new ArrayList<>(processedPoints),
                getFuturePoints(xSorted, 1),
                List.of("init") //List.of("sort", "init-ytable", "init-bestpair", "init-delta", "insert-initial", "init-tail")
        ));

        activePoints.add(p1);

        // Index of the leftmost x-sorted point that is still part of the activePoints.
        // Every point before tail has already been removed.
        int tail = 0;

        for (int i = 2; i < xSorted.size(); i++) {
            Point current = xSorted.get(i);

            /*
             * Delta used in this iteration to:
             * 1. remove points outside the active x-range, and
             * 2. select points inside the candidate y-range.
            */
            double deltaBeforeCandidateCheck = delta;

            //After that, all points satisfy: current.x - point.x < deltaBeforeCandidateCheck.
            RemovalResult removalResult = removePointsOutsideActiveSweepWindow(current, xSorted, activePoints, processedPoints, tail, i, deltaBeforeCandidateCheck);
            tail = removalResult.newTail();
            boolean removedPoints = removalResult.removedAny();

            String activeWindowMsg = "";
            if (removedPoints) {
                String removedLabels = removalResult.removedPoints().stream().map(Point::label).collect(Collectors.joining(", "));
                activeWindowMsg = removedLabels + " left the active window because the x-distance to " +current.label()+" is at least δ.";
            }

            //Candidate checking may find a smaller delta.
            CandidateResult candidateResult = findAndCheckCandidatesInCandidateSweepWindow(current, activePoints, deltaBeforeCandidateCheck, delta, currBestPair);

            double deltaAfterCandidateCheck = candidateResult.bestDistance();
            PointPair bestPairAfterCandidateCheck = candidateResult.bestPair();
            boolean foundNewBest = candidateResult.foundNewBest();

            // Points that have not yet become the current point. Used only for visualization.
            List<Point> futurePoints = getFuturePoints(xSorted, i);

            String newBestMsg = "New closest pair found: "
                    + bestPairAfterCandidateCheck.p0().label() + " ↔ " + bestPairAfterCandidateCheck.p1().label()
                    + " with distance "
                    + String.format("%.2f", deltaAfterCandidateCheck)
                    + ". The new smaller δ is visualized in the next step.";

            String noNewBestMsg = "δ stays unchanged because no candidate pair is closer.";

            boolean hasCandidateComparisons = !candidateResult.candidateComparisons().isEmpty();

            List<String> pseudoCodeLineIds = buildPseudoCodeLineIds(
                    removedPoints,
                    hasCandidateComparisons,
                    foundNewBest);

            String stepDescription = foundNewBest ? newBestMsg : noNewBestMsg;
            if (!activeWindowMsg.isBlank()) stepDescription = activeWindowMsg + " " + stepDescription;

            /*
             * Snapshot before inserting current
             * - activePoints and candidateComparisons refer to deltaBeforeCandidateCheck
             * - bestPair already contain the result of the comparisons
            */
            steps.add(new AlgorithmStepDTO(
                    stepDescription,
                    current,
                    deltaAfterCandidateCheck,
                    deltaBeforeCandidateCheck,
                    new ArrayList<>(activePoints),
                    xSorted,
                    bestPairAfterCandidateCheck,
                    candidateResult.candidateComparisons(),
                    new ArrayList<>(processedPoints),
                    futurePoints,
                    pseudoCodeLineIds
            ));


            /*
             * This step only exists when a smaller delta was found.
             * makes effect of the new delta visible: both sweep windows shrink at the same current point.
             * current is still not part of activePoints.
             */
            if (foundNewBest) {
                /*
                //TODO: wird eh am amfang der nächsten interation gemacht ... überlegen was ich im shrik step zeige
                RemovalResult shrinkRemoval =
                        removePointsOutsideActiveSweepWindow(current, xSorted, activePoints, processed, tail, i, deltaAfterCandidateCheck);
                tail = shrinkRemoval.newTail();
                 */
                steps.add(new AlgorithmStepDTO(
                        "δ decreases from " + String.format("%.2f", deltaBeforeCandidateCheck)
                                + " to " + String.format("%.2f", deltaAfterCandidateCheck)
                                + ". The sweep windows become smaller.",
                        current,
                        deltaAfterCandidateCheck,
                        deltaAfterCandidateCheck,
                        new ArrayList<>(activePoints),
                        xSorted,
                        bestPairAfterCandidateCheck,
                        candidateResult.candidateComparisons(), // Comparisons performed with the previous candidate-search delta.
                        new ArrayList<>(processedPoints),
                        futurePoints,
                        List.of("update-delta", "shrink-windows")//List.of("shrink-windows") //List.of("update-delta", "update-bestpair")
                ));
            }

            delta = deltaAfterCandidateCheck; //The smaller delta now becomes the new "search radius" for later points
            currBestPair = bestPairAfterCandidateCheck;

            //current point only becomes part of the activePoints after all snapshots for this iteration were taken.
            activePoints.add(current);
        }

        // Final snapshot after the sweep has finished.
        String doneMsg = "Done! The sweep is complete. The closest pair is "
                + currBestPair.p0().label() + " ↔ " + currBestPair.p1().label()
                + " with distance = " + String.format("%.2f", currBestPair.distance()) + ".";
        steps.add(new AlgorithmStepDTO(
                doneMsg,
                null,
                delta, delta,
                List.of(),
                xSorted,
                currBestPair,
                List.of(),
                new ArrayList<>(xSorted),
                List.of(),
                List.of("return")
        ));

        return steps;
    }

    private boolean liesOutsideActiveWindow(Point point, Point current, double delta) {
        return current.x() - point.x() >= delta;
    }

    /**
     * Removes all points whose horizontal distance from current is greater than or equal to delta.
     * Such points lie on or left of the active window's left boundary and
     * cannot form a pair with distance smaller than delta with current or any later point.
     * Removed points are moved from activePoints to processed, and tail is
     * advanced to the new left border of the active sweep window.
     */
    private RemovalResult removePointsOutsideActiveSweepWindow(Point current, List<Point> xSorted, TreeSet<Point> activePoints,
            List<Point> processed, int tail, int currIndex, double delta) {

        List<Point> removed = new ArrayList<>();
        while (tail < currIndex && liesOutsideActiveWindow(xSorted.get(tail), current, delta)) {
            Point pointToRemove = xSorted.get(tail);
            activePoints.remove(pointToRemove);
            processed.add(pointToRemove);
            removed.add(pointToRemove);
            tail++;
        }
        return new RemovalResult(tail, removed);
    }

    /**
     * Compares current with every active point whose vertical distance from
     * current is strictly smaller than candidateSearchDelta.
     * activePoints already contains only points inside the active-window x-range before
     * this method is called, so only the vertical distance must be checked.
     * Points exactly on the candidate window boundary are excluded.
     */
    private CandidateResult findAndCheckCandidatesInCandidateSweepWindow(
            Point current, TreeSet<Point> activePoints, double candidateSearchDelta, double currentBestDistance, PointPair currentBestPair
    ) {
        List<CandidateComparison> candidateComparisons = new ArrayList<>();
        boolean foundNewBest = false;

        for (Point candidate : activePoints) {
            double verticalDistance = Math.abs(current.y() - candidate.y());
            if (verticalDistance < candidateSearchDelta) {
                double distance = euclideanDistance(current, candidate);
                candidateComparisons.add(new CandidateComparison(candidate, distance));

                if (distance < currentBestDistance) {
                    currentBestDistance = distance;
                    currentBestPair = new PointPair(candidate, current, distance);
                    foundNewBest = true;
                }
            }
        }

        return new CandidateResult(currentBestDistance, currentBestPair, candidateComparisons, foundNewBest);
    }

    /*
    private List<String> buildPseudoCodeLineIds(boolean removedPoints, boolean hasCandidatePairs, boolean foundNewBest) {
        List<String> ids = new ArrayList<>();
        ids.add("for-loop");
        ids.add("set-current");

        ids.add("while-loop");
        if (removedPoints) {
            ids.add("remove-point");
            ids.add("increment-tail");
        }
        ids.add("candidate-range");
        if (hasCandidatePairs) {
            ids.add("check-distance");
        }
        if (foundNewBest) {
            ids.add("update-delta");
            ids.add("update-bestpair");
        }
        ids.add("insert-current");
        return ids;
    }
     */

    private List<String> buildPseudoCodeLineIds(
            boolean removedPoints,
            boolean hasCandidatePairs,
            boolean foundNewBest
    ) {
        List<String> ids = new ArrayList<>();

        ids.add("for-loop");
        ids.add("set-current");
        ids.add("active-window-condition");
        ids.add("candidate-window");

        if (hasCandidatePairs) {
            ids.add("check-distance");
        }

        if (foundNewBest) {
            ids.add("update-bestpair");
        }

        return ids;
    }
    /*
    private List<String> buildPseudoCodeLineIds(
            boolean removedPoints,
            boolean hasCandidatePairs,
            boolean foundNewBest
    ) {
        List<String> ids = new ArrayList<>();

        ids.add("for-loop");
        ids.add("set-current");

        if (removedPoints) {
            ids.add("update-active-window");
        }

        if (hasCandidatePairs) {
            ids.add("check-candidate-window");
        }

        if (foundNewBest) {
            ids.add("update-bestpair");
        }

        return ids;
    }

     */

    private List<Point> getFuturePoints(List<Point> xSorted, int currentIndex) {
        return new ArrayList<>(xSorted.subList(currentIndex + 1, xSorted.size()));
    }

    public static double euclideanDistance(Point p1, Point p2) {
        double dx = (double) p2.x()-p1.x();
        double dy = (double) p2.y()-p1.y();
        return Math.hypot(dx,dy);
    }

    private record RemovalResult(int newTail, List<Point> removedPoints) {
        boolean removedAny() {
            return !removedPoints.isEmpty();
        }
    }

    private record CandidateResult(
            double bestDistance,
            PointPair bestPair,
            List<CandidateComparison> candidateComparisons,
            boolean foundNewBest
    ) {}

    //wrapper funktion für einfacheres testen
    public PointPair nearestPair(List<Point> points) {
        List<AlgorithmStepDTO> steps = nearestPoints(points);
        if (steps.isEmpty()) throw new IllegalStateException("Algorithm produced no steps");
        return steps.getLast().bestPair();
    }
}