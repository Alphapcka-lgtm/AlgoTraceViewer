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

        /*
        Bad for animation ...

        //If there are only two points, then the solution is trivial -> return immediately
        if(xSorted.size() == 2) {
            double minDistance = euclideanDistance(xSorted.get(0), xSorted.get(1));
            return new Result(xSorted.get(0), xSorted.get(1), minDistance);
        }

        //If two points are identical, then the solution is trivial -> return immediately
        Set<Point> set = new HashSet<>();
        for (Point p : xSorted) {
            if (!set.add(p)) {
                return new Result(p, p, 0);
            }
        }
        */

        //Init mit p0 und p1
        Point p0 = xSorted.get(0);
        Point p1 = xSorted.get(1);
        double delta = euclideanDistance(p0, p1); //Calculate the initial delta from the first two points
        Result currBestPair = new Result(p0, p1, delta);

        // y-Table: enthält nur active points (zwischen tail inkl. und current exkl.)
        // Sortiert nach y, bei gleichem y nach x
        //Punkte mit gleicher Position werden nicht verdrängt
        TreeSet<Point> activePoints = new TreeSet<>(
                Comparator.comparingInt(Point::y)
                        .thenComparingInt(Point::x)
                        .thenComparing(Point::id)
        );

        //processed/discarded points ... leer am Anfang
        List<Point> processed = new ArrayList<>();
        // active points:  nur p0. currentPoint (p1) ist noch NICHT drin
        activePoints.add(p0);
        // current: p1
        // future: alle "nach" p1
        List<Point> future0 = xSorted.subList(2, xSorted.size());

        //shortcut for the delta control+cmd+space and then search delta
        String description = "Initialization: Points sorted by x-coordinate. "
                + "δ = dist(" + p0.label() + ", " + p1.label() + ") = "
                + String.format("%.2f", delta);

        steps.add(new AlgorithmStepDTO(
                description, p1, p1.x(), delta,
                new ArrayList<>(activePoints),   //p1 noch nicht drin
                xSorted, currBestPair,
                List.of(new Result(p0, p1, delta)), new ArrayList<>(processed), new ArrayList<>(future0)
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

            // Punkte aus der active Menge entfernen, die außerhalb des [x-delta, x) Streifens liegen
            // -> werden der processed Menge hinzugefügt
            while (tail < i && current.x() - xSorted.get(tail).x() > delta) {
                Point toRemove = xSorted.get(tail);
                activePoints.remove(toRemove);
                processed.add(toRemove);
                tail++;
            }

            /*
            //noch nicht ganz optimal weil ich durch ganze tree set gehe.
            // Muss nur den relvanten y-Bereich im treeset anschauen
            for(Point p : activePoints){
                if(Math.abs(current.y() - p.y()) < delta){
                    double possibleNewDetla = euclideanDistance(current, p);
                    if(possibleNewDetla < delta){
                        delta = possibleNewDetla;
                        currBestPair = new Result(p, current, delta);
                    }
                }
            }
            */

            // Kandidaten bestimmen ... active points im "kleinen/kleineren" [y-delta, y+delta] Fenster
            List<Result> candidatePairs = new ArrayList<>();
            boolean newBest = false;

            for (Point candidate : activePoints) {
                if (Math.abs(current.y() - candidate.y()) < delta) {
                    double dist = euclideanDistance(current, candidate);
                    candidatePairs.add(new Result(candidate, current, dist));

                    if (dist < delta) {
                        delta = dist;
                        currBestPair = new Result(candidate, current, delta);
                        newBest = true;
                    }
                }
            }

            // future = alle Punkte "rechts" von current (Index i+1 bis Ende)
            List<Point> futurePoints = new ArrayList<>(xSorted.subList(i + 1, xSorted.size()));

            String newBestMsg = "New minimum found! δ = " + String.format("%.2f", delta)
                    + " (" + currBestPair.p0().label() + ", " + currBestPair.p1().label() + ")";
            String noNewBestMsg = "Processed point " + current.label() + "; δ = " + String.format("%.2f", delta)
                    + "; active points: " + activePoints.size();

            // Step BEVOR current in active Menge kommt ...currentPoint ist ja nicht teil von activePoints
            steps.add(new AlgorithmStepDTO(
                    newBest ? newBestMsg : noNewBestMsg, current, current.x(), delta,
                    new ArrayList<>(activePoints),  // active = {tail .. i-1} ... current noch nicht drin
                    xSorted, currBestPair, candidatePairs, new ArrayList<>(processed), futurePoints
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
                lastPoint.x(), delta,
                List.of(), //aktive menge nicht mehr zeigen
                xSorted, currBestPair, List.of(), new ArrayList<>(processed), List.of()
        ));

        return steps;
    }

    public static double euclideanDistance(Point p1, Point p2) {
        long dx = (long) p2.x() - p1.x();
        long dy = (long) p2.y() - p1.y();
        return Math.sqrt(dx * dx + dy * dy);
    }
}
