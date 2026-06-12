package com.example.demo;

import dto.AlgorithmStepDTO;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.*;

@Getter
@Service
public class SLineService {

    public List<AlgorithmStepDTO> nearestPoints(List<Point> points) {
        List<AlgorithmStepDTO> steps = new ArrayList<>();

        if (points == null || points.size() < 2) {
            throw new IllegalArgumentException("There must be at least two points");
        }

        List<Point> xSorted = new ArrayList<>(points);
        xSorted.sort(Comparator.comparingInt(Point::x).thenComparingInt(Point::y));

        // Setting initial best pair the initial delta from the first two points before the sweep starts.
        Point p0 = xSorted.get(0);
        Point p1 = xSorted.get(1);
        double delta = euclideanDistance(p0, p1);
        Result currBestPair = new Result(p0, p1, delta);

        /*
        yTable contains the points currently inside the active sweep window:
        from xSorted[tail] inclusive up to the current point exclusive.
        It is ordered by y-coordinate; Point::id keeps duplicate coordinates distinct.
         */
        TreeSet<Point> activePoints = new TreeSet<>(
                Comparator.comparingInt(Point::y).thenComparingInt(Point::x).thenComparing(Point::id));

        // Points that are to the left of the tail so that have already left the active sweep window
        List<Point> processed = new ArrayList<>(); //discarded points

        // During initialization, p1 is the current point. Therefore, only p0 is part of activePoints at this moment.
        activePoints.add(p0);
        List<Point> future0 = xSorted.subList(2, xSorted.size()); // points to the right of the current point.

        //shortcut for the delta control+cmd+space and then search delta
        String description = "Initialization: Points sorted by x-coordinate. "
                + "δ = dist(" + p0.label() + ", " + p1.label() + ") = "
                + String.format("%.2f", delta);

        steps.add(new AlgorithmStepDTO(
                description, p1, p1.x(), delta, delta,
                new ArrayList<>(activePoints),   //p1 noch nicht drin
                xSorted, currBestPair,
                List.of(new Result(p0, p1, delta)), new ArrayList<>(processed), new ArrayList<>(future0),
                List.of("init") //List.of("sort", "init-ytable", "init-bestpair", "init-delta", "insert-initial", "init-tail")
        ));

        activePoints.add(p1);

        // Index of the leftmost point that is still part of the active sweep window.
        // Points before tail have already been removed from activePoints.
        int tail = 0;

        for (int i = 2; i < xSorted.size(); i++) {
            Point current = xSorted.get(i);

            //Delta at beginning of this iteration. size of the search windows to find candidate pairs for the current point.
            double deltaBeforeStep = delta;

            RemovalResult rm = removePointsOutsideActiveSweepWindow(current, xSorted, activePoints, processed, tail, i, deltaBeforeStep);
            tail = rm.newTail();
            boolean removedPoints = rm.removedAny();//für pseudo code highlighting

            /*
             * Candidate checking may find a smaller delta.
             * Step i: "New minimum found!" The windows still show the old search delta, because that was the
                        window in which the candidates were checked.
             * Step i+1: "delta shrinks..." The windows shrink at the same current point to the new delta.
             * Step i+2: The next point is processed and the smaller windows move on.
             */
            // Determine Candidates: checking only active points whose y-distance is smaller than delta .
            //so activepoints in the [y-delta, y+delta]-window (candidaten window)
            CandidateResult candidates = findAndCheckCandidatesInCandidateSweepWindow(current, activePoints, deltaBeforeStep, delta, currBestPair);

            double deltaAfterCandidateCheck = candidates.delta();
            Result bestPairAfterCandidateCheck = candidates.bestPair();
            boolean foundNewBest = candidates.foundNewBest();

            // Only for visualization: points not processed yet, so all points right of current.
            List<Point> futurePoints = new ArrayList<>(xSorted.subList(i + 1, xSorted.size()));

         //   String newBestMsg = "New minimum found! δ = " + String.format("%.2f", deltaAfterCandidateCheck) + " (" + bestPairAfterCandidateCheck.p0().label() + ", " + bestPairAfterCandidateCheck.p1().label() + ")";

            String newBestMsg = "New closest pair found: " + bestPairAfterCandidateCheck.p0().label()
                    + " ↔ " + bestPairAfterCandidateCheck.p1().label() + " with a distance " + String.format("%.2f", deltaAfterCandidateCheck)+
                    " This becomes the new δ ...";

            String noNewBestMsg = "Processed point " + current.label()
                    + ". No candidate pair is closer than the current δ = " + String.format("%.2f", deltaAfterCandidateCheck) +
                    " so δ stays unchanged.";

            boolean hasCandidatePairs = !candidates.candidatePairs().isEmpty();

            List<String> pseudoCodeLineIds = buildPseudoCodeLineIds(
                    removedPoints,
                    hasCandidatePairs,
                    foundNewBest);

            /*
             * Step i: If a new minimum was found, the step message already shows the new delta.
             * However, searchDelta stays deltaBeforeStep so the windows still show the
             * old search window in which the candidates were actually checked.
             */
            // step is taken before inserting the current point beause currentPoint ist not part of activePoints
            steps.add(new AlgorithmStepDTO(
                    foundNewBest ? newBestMsg : noNewBestMsg,
                    current,
                    current.x(),
                    deltaAfterCandidateCheck,
                    deltaBeforeStep,                        // window size used during this candidate search check
                    new ArrayList<>(activePoints),
                    xSorted,
                    bestPairAfterCandidateCheck,
                    candidates.candidatePairs(),
                    new ArrayList<>(processed),
                    futurePoints,
                    pseudoCodeLineIds
            ));

            List<Point> activePointsAfterShrink = activePoints.stream()
                    .filter(p -> current.x() - p.x() < deltaAfterCandidateCheck)
                    .toList();

            List<Point> processedAfterShrink = new ArrayList<>(processed);

            for (Point p : activePoints) {
                if (current.x() - p.x() >= deltaAfterCandidateCheck) {
                    processedAfterShrink.add(p);
                }
            }
            /*
             * Step i+1: This step only exists when delta became smaller.
             * makes effect of the new delta visible: both sweep windows shrink at the same current point.
             * Here delta and searchDelta are both the new smaller value.
             */
            if (foundNewBest) {
          //  if (false) {
                steps.add(new AlgorithmStepDTO(
                        "δ decreases from " + String.format("%.2f", deltaBeforeStep)
                                + " to " + String.format("%.2f", deltaAfterCandidateCheck)
                                + ". The sweep windows become smaller.",
                        current,
                        current.x(),
                        deltaAfterCandidateCheck,          // new best distance
                        deltaAfterCandidateCheck,          // new window size for the shrink step
                        new ArrayList<>(activePointsAfterShrink),     // current is still not active yet
                        xSorted,
                        bestPairAfterCandidateCheck,
                        List.of(),
                        processedAfterShrink,
                        futurePoints,
                        List.of("shrink-windows") //List.of("update-delta", "update-bestpair")
                ));
            }


             //From here on, the algorithm state is updated for the next iteration.
             //The smaller delta is now the "official search radius" for later points
            delta = deltaAfterCandidateCheck;
            currBestPair = bestPairAfterCandidateCheck;

            // Current point becomes part of the activePoinsts/sweep window after the step
            activePoints.add(current);
        }

        // Final visualization state after the sweep has finished.
        // currentPoint = null because the alg has finished
        Point lastPoint = xSorted.getLast();

        String doneMsg = "Done! The sweep is complete. The closest pair is"
                + currBestPair.p0().label() + " ↔ " + currBestPair.p1().label()
                + " with distance = " + String.format("%.2f", currBestPair.distance());

        steps.add(new AlgorithmStepDTO(
                doneMsg,
                null, // kein currentPoint mehr
                lastPoint.x(), delta, delta,
                List.of(), //aktive menge nicht mehr zeigen
                xSorted, currBestPair, List.of(), new ArrayList<>(processed), List.of(),
                List.of("return")
        ));

        return steps;
    }

    /**
     * Removes points that are more than delta to the left of the current point.
     * These points are left of the active sweep window, so they cannot form
     * a closer pair with the current point or any later point.
     * Removed points are moved from activePoints to processed, and tail is
     * advanced to the new left border of the active sweep window.
     */
    private RemovalResult removePointsOutsideActiveSweepWindow(Point current, List<Point> xSorted, TreeSet<Point> activePoints,
            List<Point> processed, int tail, int currIndex, double deltaBeforeStep) {

        boolean removedPoints = false; //für pseudo code highlighting ...

        //while (tail < i && current.x() - xSorted.get(tail).x() >= delta) { //> ?
        //while (tail < i && current.x() - xSorted.get(tail).x() >= deltaBeforeStep) { //> ?
        //System.out.println(current.x() +" - "+xSorted.get(tail).x() + " deltaBeforeStep " + deltaBeforeStep + " tail " + tail);
        while (tail < currIndex && current.x() - xSorted.get(tail).x() >= deltaBeforeStep) {
            Point oldPoint = xSorted.get(tail);
            activePoints.remove(oldPoint);
            processed.add(oldPoint);
            tail++;
            removedPoints = true;
        }

        return new RemovalResult(tail, removedPoints);
    }


    /**
     * Checks only active points that are at most delta above or below the current point, so that lie inside the candidate sweep window.
     * activePoints already contains only points inside the active sweep window (so no points farther left than
     * delta). Therefore, this method only needs to filter by y-distance: at most delta above or below the current point.
     */
    private CandidateResult findAndCheckCandidatesInCandidateSweepWindow(
            Point current, TreeSet<Point> activePoints, double deltaBeforeStep, double currDelta, Result currentBestPair
    ) {
        List<Result> candidatePairs = new ArrayList<>();
        boolean foundNewBest = false;

        for (Point activePoint : activePoints) {
            //if (Math.abs(current.y() - candidate.y()) < delta) {
            if (Math.abs(current.y() - activePoint.y()) < deltaBeforeStep) {
                Point candidate = activePoint;
                double distance = euclideanDistance(current, candidate);
                candidatePairs.add(new Result(candidate, current, distance));

                if (distance < currDelta) {
                    currDelta = distance;
                    currentBestPair = new Result(candidate, current, distance);
                    foundNewBest = true;
                }
            }
        }

        return new CandidateResult(currDelta, currentBestPair, candidatePairs, foundNewBest);
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
    public static double euclideanDistance(Point p1, Point p2) {
        long dx = (long) p2.x() - p1.x();
        long dy = (long) p2.y() - p1.y();
        return Math.sqrt(dx * dx + dy * dy);
    }

    private record RemovalResult(int newTail, boolean removedAny) {}

    private record CandidateResult(
            double delta,
            Result bestPair,
            List<Result> candidatePairs,
            boolean foundNewBest
    ) {}

}