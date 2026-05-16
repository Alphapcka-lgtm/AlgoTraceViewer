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

        if(points == null || points.size() < 2) {
            throw new IllegalArgumentException("There must be at least two points");
        }

        // Sort all points by x-coordinate
        List<Point> xSorted = new ArrayList<>(points);
        xSorted.sort(Comparator.comparingInt(Point::x).thenComparingInt(Point::y));

        /*
        Bad for animation ??

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

        //Calculate the initial delta from the first two points 
        Point p0 = xSorted.get(0);
        Point p1 = xSorted.get(1);
        double delta = euclideanDistance(p0, p1);
        Result currBestPair = new Result(p0, p1, delta);

        //shortcut for the delta control+cmd+space and then search delta
        String description = "Initialization: The points were sorted by their x-coordinates. δ = dist(" + p0.label() + ", "
                + p1.label() + ") = " + String.format("%.2f", delta);
        steps.add(new AlgorithmStepDTO(0, description, p1, p1.x(), delta, List.of(p0, p1), xSorted, currBestPair,
                List.of(new Result(p0,p1,delta)), List.of()));

        //nach y sotieren
        // Punkt-duplikate werden nicht eingefüt/ignoriert
        //set to store the previously processed points
        // whose x-coordinates are less than delta distance from current point
        // entählt also alle punkte die im delta * 2detal balken sind? wenn man einen bestimmen punkt anschaut
        TreeSet<Point> activePoints = new TreeSet<>(Comparator.comparingInt(Point::y).thenComparingInt(Point::x));
        activePoints.add(p0);
        activePoints.add(p1);

        //index auf den linkesten noch gültigen Punkt des aktiv Window (teil der aktiven Punktemenge; current ist nicht teil)
        //  ... dann muss man nicht immer alles durchsuchen
        //ist quasi der linke rand des balkens
        int tail=0;

        // Already fully processed points (only for visualization)
        List<Point> processed = new ArrayList<>();

        for(int i = 2; i < xSorted.size(); i++) {
            Point current = xSorted.get(i);

            // Removing points outside the delta window, so points to the left of the tail
            while (tail < i && current.x() - xSorted.get(tail).x() > delta){
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

            // check candidates for this step
            List<Result> candidatePairs = new ArrayList<>();
            boolean newBest = false;

            for (Point candidate : activePoints) {
                // Look only at the relevant y range
                if (Math.abs(current.y() - candidate.y()) < delta) {
                    double dist = euclideanDistance(current, candidate);
                    candidatePairs.add(new Result(candidate, current, dist));

                    // new minimum ?
                    if (dist < delta) {
                        delta = dist;
                        currBestPair = new Result(candidate, current, delta);
                        newBest = true;
                    }
                }
            }

            String newBestFoundMsg = "New minimum found! δ = " + String.format("%.2f", delta)
                    + " (" + currBestPair.p0().label() + ", " + currBestPair.p1().label() + ")";
            String noNewBestFoundMsg = "processed points " + current.label() + "; δ = " + String.format("%.2f", delta)
                    + "; active points: " + activePoints.size();
            description = newBest ? newBestFoundMsg : noNewBestFoundMsg;

            steps.add(new AlgorithmStepDTO(i-1, description, current, current.x(), delta,
                    new ArrayList<>(activePoints), xSorted, currBestPair, candidatePairs, new ArrayList<>(processed)));

            activePoints.add(current); //muss nach dem steps.add damit current Point nicht in active Menge
        }

        description = "Done! Closest Pair: " + currBestPair.p0().label() + ", " + currBestPair.p1().label()
                + " with a distance of " + String.format("%.2f", currBestPair.distance());
        Point mostRightPoint = xSorted.getLast();

        steps.add(new AlgorithmStepDTO(steps.size(), description, mostRightPoint, mostRightPoint.x(), delta,
                new ArrayList<>(activePoints), xSorted, currBestPair, List.of(), new ArrayList<>(processed)));

        return steps;
    }

    public static double euclideanDistance(Point p1, Point p2) {
        long x = (long) p2.x() - p1.x();
        long y = (long) p2.y() - p1.y();
        long squared = (x * x) + (y * y);
        return Math.sqrt(squared);
    }

}
