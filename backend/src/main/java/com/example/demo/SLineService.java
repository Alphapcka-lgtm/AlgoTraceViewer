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

        //x-Queue aufbauen ... Sort all points by x coordinate
        List<Point> xSorted = new ArrayList<>(points);
        xSorted.sort(Comparator.comparingInt(Point::x).thenComparingInt(Point::y));

        //Init mit p0 und p1
        Point p0 = xSorted.get(0);
        Point p1 = xSorted.get(1);
        double delta = euclideanDistance(p0, p1); //Calculate the initial delta from the first two points
        Result currBestPair = new Result(p0, p1, delta);

        // y-Table: enthält nur active points (zwischen tail inkl. und current exkl.)
        // Sortiert nach y, bei gleichem y nach x
        //Punkte mit gleicher Position werden nicht verdrängt
        TreeSet<Point> activePoints = new TreeSet<>(
                Comparator.comparingInt(Point::y).thenComparingInt(Point::x).thenComparing(Point::id));

        //processed/discarded points ... leer am Anfang
        List<Point> processed = new ArrayList<>();
        // active points:  nur p0. currentPoint (p1) ist noch NICHT drin
        activePoints.add(p0);
        // current: p1, future: alle "nach" p1
        List<Point> future0 = xSorted.subList(2, xSorted.size());

        //shortcut for the delta control+cmd+space and then search delta
        String description = "Initialization: Points sorted by x-coordinate. "
                + "δ = dist(" + p0.label() + ", " + p1.label() + ") = "
                + String.format("%.2f", delta);

        steps.add(new AlgorithmStepDTO(
                description, p1, p1.x(), delta, delta,
                new ArrayList<>(activePoints),   //p1 noch nicht drin
                xSorted, currBestPair,
                List.of(new Result(p0, p1, delta)), new ArrayList<>(processed), new ArrayList<>(future0),
                List.of("sort", "init-ytable", "init-bestpair", "init-delta", "insert-initial", "init-tail")
        ));

        // jetzt p1 zur active menge hinzufügen
        activePoints.add(p1);

        // tail zeigt auf den linkesten noch "gültigen" Punkt der active Menge
        //  ... dadurch muss man nicht weniger punkte "durchsuchen"
        //ist quasi der linke rand des balkens
        int tail = 0;

        // mainschleife ... startet bei index 2
        for (int i = 2; i < xSorted.size(); i++) {
            Point current = xSorted.get(i);
            double deltaBeforeStep = delta;

            RemovalResult rm = removePointsOutsideActiveSweepWindow(current, xSorted, activePoints, processed, tail, i, deltaBeforeStep);
            tail = rm.newTail();
            boolean removedPoints = rm.removedAny();//für pseudo code highlighting

            // Kandidaten bestimmen ... active points im "kleinen/kleineren" [y-delta, y+delta] Fenster
            CandidateResult candidates = findAndCheckCandidatesInCandidateSweepWindow(current, activePoints, deltaBeforeStep, delta, currBestPair);
            delta = candidates.delta();
            currBestPair = candidates.bestPair();
            boolean foundNewBest = candidates.foundNewBest();

            // future = alle Punkte "rechts" von current (Index i+1 bis Ende)
            List<Point> futurePoints = new ArrayList<>(xSorted.subList(i + 1, xSorted.size()));

            String newBestMsg = "New minimum found! δ = " + String.format("%.2f", delta)
                    + " (" + currBestPair.p0().label() + ", " + currBestPair.p1().label() + ")";
            String noNewBestMsg = "Processed point " + current.label() + "; δ = " + String.format("%.2f", delta)
                    + "; active points: " + activePoints.size();

            boolean hasCandidatePairs = !candidates.candidatePairs().isEmpty();
            List<String> pseudoCodeLineIds = buildPseudoCodeLineIds(removedPoints, hasCandidatePairs, foundNewBest);


            // Step BEVOR current in active Menge kommt ...currentPoint ist ja nicht teil von activePoints
            steps.add(new AlgorithmStepDTO(
                    foundNewBest ? newBestMsg : noNewBestMsg, current, current.x(), delta, deltaBeforeStep,
                    new ArrayList<>(activePoints),  // active = {tail .. i-1} ... current noch nicht drin
                    xSorted, currBestPair, candidates.candidatePairs(), new ArrayList<>(processed), futurePoints,
                    pseudoCodeLineIds
            ));

            // current NACH dem Step in die active menge aufnehmen
            activePoints.add(current);
        }

        // final Step .... alle verbleibenden activePoints noch zeigen
        // currentPoint = null weil der alg fertig ist
        Point lastPoint = xSorted.getLast();

        String doneMsg = "Done! Closest pair: "
                + currBestPair.p0().label() + " ↔ " + currBestPair.p1().label()
                + ", distance = " + String.format("%.2f", currBestPair.distance());

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
     * Removes all points from the active sweep window that are too far left of the current point.
     * The active sweep window is the vertical strip [current.x - deltaBeforeStep, current.x).
     * Points outside this strip cannot improve the current best distance anymore,
     * because their x-distance to the current point is already at least delta.
     * Removed points are moved from activePoints to processed.
     */
    private RemovalResult removePointsOutsideActiveSweepWindow(Point current, List<Point> xSorted, TreeSet<Point> activePoints,
            List<Point> processed, int tail, int currIndex, double deltaBeforeStep) {

        boolean removedPoints = false; ////für pseudo code highlighting ...

        //while (tail < i && current.x() - xSorted.get(tail).x() >= delta) { //> ?
        //while (tail < i && current.x() - xSorted.get(tail).x() >= deltaBeforeStep) { //> ?
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
     * Checks all active points that lie inside the candidate sweep window
     * [current.x - deltaBeforeStep, current.x) × [current.y - deltaBeforeStep, current.y + deltaBeforeStep].
     * Since activePoints already only contains points from the active sweep window, this method only has to filter by y-distance.
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