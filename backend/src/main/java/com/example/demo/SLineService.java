package com.example.demo;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SLineService {

    public static Result nearestPoints(List<Point> points_S) {

        //The x-queue (=points_xQueue) stores the points of the set S (=points_S) ...
        List<Point> points_xQueue = new ArrayList<>(points_S);

        if(points_xQueue.size() < 2) {
            throw new IllegalArgumentException("There must be at least two points");
        }

        // ... ordered by their x-coordinate (aufsteigend)
        points_xQueue.sort(Comparator.comparingInt(Point::x).thenComparingInt(Point::y));

        if(points_xQueue.size() == 2) {
            double minDistance = euclideanDistance(points_xQueue.get(0), points_xQueue.get(1));
            return new Result(points_xQueue.get(0), points_xQueue.get(1), minDistance);
        }

        Set<Point> set = new HashSet<>();
        for (Point p : points_xQueue) {
            if (!set.add(p)) {
                return new Result(p, p, 0);
            }
        }

        Point p1 = points_xQueue.get(0);
        Point p2 = points_xQueue.get(1);
        double delta = euclideanDistance(p1, p2); //anfangs delta

        Result result = new Result(p1, p2, delta);

        //nach y sotieren und Punkt-duplikate werden nicht eingefüt/ignoriert
        //set to store the previously processed points
        // whose x-coordinates are less than delta distance from current point
        // entählt also alle punkte die im delta * 2detal baken sind wenn man einen bestimmen punkt anschaut
        TreeSet<Point> treeSetActivePoints = new TreeSet<>(Comparator.comparingInt(Point::y)
                .thenComparingInt(Point::x));

        treeSetActivePoints.add(p1);
        treeSetActivePoints.add(p2);

        int tail=0; //index auf den linkesten noch gültigen (teil der aktiven Punktemenge; current ist nicht teil) Punkt ... dann muss man nicht immer alles durchsuchen
        //ist quasi der linke rand des balkens

        for(int i = 2; i < points_xQueue.size(); i++) {
            Point current = points_xQueue.get(i);
            while (tail< i && current.x() - points_xQueue.get(tail).x() > delta){
                treeSetActivePoints.remove(points_xQueue.get(tail));
                tail++;
            }

            //noch nicht ganz optimal weil ich durch ganze tree set gehe. Muss nur den relvanten y-Bereich im treeset anschauen
            for(Point p : treeSetActivePoints){
                if(Math.abs(current.y() - p.y()) < delta){
                    double possibleNewDetla = euclideanDistance(current, p);
                    if(possibleNewDetla < delta){
                        delta = possibleNewDetla;
                        result = new Result(p, current, delta);
                    }
                }
            }

            treeSetActivePoints.add(current);
        }
        return result;
    }

    public static double euclideanDistance(Point p1, Point p2) {
        long x = (long) p2.x() - p1.x();
        long y = (long) p2.y() - p1.y();
        long squared = (x * x) + (y * y);
        return Math.sqrt(squared);
    }

    static void main(){
        List<Point> points = List.of(
                new Point(0, 0, "a"),
                new Point(10, 10, "b"),
                new Point(1, 1, "c")
        );
        Result res = nearestPoints(points);
        System.out.println(res);
    }



}
