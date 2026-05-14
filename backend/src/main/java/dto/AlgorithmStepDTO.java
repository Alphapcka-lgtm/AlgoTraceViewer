package dto;

import com.example.demo.Point;
import com.example.demo.Result;

import java.util.List;

/**
 * @param stepIndex          Index dieses Schritts
 * @param description        Beschreibung was in diesem Schritt passiert
 * @param currentPoint       Der Punkt, bei dem die SweepLine gerade hält
 * @param sweepLineX         Die aktuelle x Position der SweepLine (= currentPoint.x)
 * @param delta              Das aktuell bekannte minimum Abstand delta
 * @param activePoints       Alle Punkte, die sich aktuell im [x - delta, x]-Streifen befinden
 * @param allPoints          Alle Punkte der Eingabemenge
 * @param bestPair           Das aktuell beste Punktepaar (kann null sein, wenn noch keines gefunden)
 * @param candidatePairs     Paare, die in diesem Schritt verglichen wurden
 * @param processedPoints    Punkte, die bereits abgearbeitet wurden (links von SweepLine)
 */
public record AlgorithmStepDTO(
        int stepIndex,
        String description,
        Point currentPoint,
        int sweepLineX,
        double delta,
        List<Point> activePoints,
        List<Point> allPoints,
        Result bestPair,
        List<Result> candidatePairs,
        List<Point> processedPoints
) {}
