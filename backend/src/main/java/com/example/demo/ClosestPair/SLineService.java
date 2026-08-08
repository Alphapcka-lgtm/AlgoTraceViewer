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
                SweepLineStepType.INITIALIZATION,
                description,
                p1,
                delta,
                new ArrayList<>(activePoints),
                xSorted,
                currBestPair,
                List.of(),
                List.of(),
                new ArrayList<>(processedPoints),
                getFuturePoints(xSorted, 1)
        ));

        activePoints.add(p1);

        // Index of the leftmost x-sorted point that is still part of the activePoints.
        // Every point before tail has already been removed.
        int tail = 0;

        for (int i = 2; i < xSorted.size(); i++) {
            Point current = xSorted.get(i);

             //used to remove points outside the active x-range and select points inside the candidate y-range.
            double candidateSearchDelta = delta;

            // Points that have not yet become the current point. Used only for visualization.
            List<Point> futurePoints = getFuturePoints(xSorted, i);

            //After that, all points satisfy: current.x - point.x < candidateSearchDelta.
            RemovalResult removalResult = removePointsOutsideActiveSweepWindow(current, xSorted, activePoints, processedPoints, tail, i, candidateSearchDelta);
            tail = removalResult.newTail();

            String advanceDescription;

            if (removalResult.removedAny()) {
                String removedLabels = removalResult.removedPoints().stream().map(Point::label).collect(Collectors.joining(", "));

                advanceDescription = "Select " + current.label() + " as the current point. "
                                + "Remove " + removedLabels
                                + " from active window because their x-distance is at least (>=) δ.";
            } else {
                advanceDescription = "Select " + current.label() + " as the current point. " + "No active points lie outside the active window so no had to be removed.";
            }

            steps.add(new AlgorithmStepDTO(
                    SweepLineStepType.ADVANCE_AND_PRUNE,
                    advanceDescription,
                    current,
                    candidateSearchDelta,
                    new ArrayList<>(activePoints), //activePoints hat hier schon den zustand nach entfernen ...
                    xSorted,
                    currBestPair,
                    List.of(),
                    new ArrayList<>(removalResult.removedPoints()),
                    new ArrayList<>(processedPoints),
                    futurePoints
            ));

            //Candidate checking may find a smaller delta.
            CandidateResult candidateResult = findAndCheckCandidatesInCandidateSweepWindow(current, activePoints, candidateSearchDelta, delta, currBestPair);

            double deltaAfterCandidateCheck = candidateResult.bestDistance();
            PointPair bestPairAfterCandidateCheck = candidateResult.bestPair();
            boolean foundNewBest = candidateResult.foundNewBest();

            String comparedPoints = candidateResult.candidateComparisons.stream().map(p->p.candidate().label()).collect(Collectors.joining(", "));
            String candidateDescription = candidateResult.candidateComparisons().isEmpty() ?
                    "No active points (points in yTable?) lie inside the candidate window."
                    : "Compared the distance from " + current.label() + " with every candidate point (" + comparedPoints + ") so every active point whose y-distance is smaller than δ";

            steps.add(new AlgorithmStepDTO(
                    SweepLineStepType.CHECK_CANDIDATES,
                    candidateDescription,
                    current,
                    candidateSearchDelta,
                    new ArrayList<>(activePoints),
                    xSorted,
                    // Deliberately still the pair known before these comparisons.
                    currBestPair,
                    candidateResult.candidateComparisons(),
                    List.of(),
                    new ArrayList<>(processedPoints),
                    futurePoints
            ));

            delta = deltaAfterCandidateCheck; //The smaller delta now becomes the new "search radius" for later points
            currBestPair = bestPairAfterCandidateCheck;

            //current point only becomes part of the activePoints after all snapshots for this iteration were taken.
            activePoints.add(current);

            String commitDescription;
            if (foundNewBest) {
                commitDescription = "A new closer pair was found: " + currBestPair.p0().label() + " ↔ "
                                + currBestPair.p1().label() + " with distance " + String.format("%.2f", delta)
                                + ". Update δ and insert " + current.label() + " into the active set.";
            } else {
                commitDescription = "No candidate pair is closer. δ remains " + String.format("%.2f", delta) + ". " + current.label() + " ist now part of the active set";
            }

            steps.add(new AlgorithmStepDTO(
                    SweepLineStepType.COMMIT_ITERATION,
                    commitDescription,
                    current,
                    delta,
                    new ArrayList<>(activePoints),
                    xSorted,
                    currBestPair,
                    List.of(),
                    List.of(),
                    new ArrayList<>(processedPoints),
                    futurePoints
            ));

        }

        // Final snapshot after the sweep has finished.
        String doneMsg = "Done! The sweep is complete. The closest pair is "
                + currBestPair.p0().label() + " ↔ " + currBestPair.p1().label()
                + " with distance = " + String.format("%.2f", currBestPair.distance()) + ".";
        steps.add(new AlgorithmStepDTO(
                SweepLineStepType.FINISHED,
                doneMsg,
                null,
                delta,
                List.of(),
                xSorted,
                currBestPair,
                List.of(),
                List.of(),
                new ArrayList<>(xSorted),
                List.of()
        ));

        return steps;
    }

    private boolean liesOutsideActiveWindow(Point pointAtIndexTail, Point current, double delta) {
        return current.x() - pointAtIndexTail.x() >= delta;
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