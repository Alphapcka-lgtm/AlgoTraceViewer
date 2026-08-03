package dto;

import com.example.demo.ClosestPair.CandidateComparison;
import com.example.demo.ClosestPair.Point;
import com.example.demo.ClosestPair.PointPair;

import java.util.List;

/**
 * @param description        Beschreibung was in diesem Schritt passiert
 * @param currentPoint       Der Punkt, bei dem die SweepLine gerade hält

 * @param activePoints       Alle Punkte, die sich aktuell im [x - delta, x]-Streifen befinden
 * @param allPoints          Alle Punkte der Eingabemenge
 * @param bestPair           Das aktuell beste Punktepaar (kann null sein, wenn noch keines gefunden)
 * @param candidateComparisons
 * @param processedPoints    Punkte, die bereits abgearbeitet wurden (links von SweepLine)
 */
public record AlgorithmStepDTO(
        String description,
        Point currentPoint,
        double deltaAfterCandidateCheck,
        double deltaBeforeCandidateCheck,
        List<Point> activePoints,
        List<Point> allPoints,
        PointPair bestPair,
        List<CandidateComparison> candidateComparisons,
        List<Point> processedPoints,
        List<Point> futurePoints,
        List<String> pseudoCodeLineIds
) {}
