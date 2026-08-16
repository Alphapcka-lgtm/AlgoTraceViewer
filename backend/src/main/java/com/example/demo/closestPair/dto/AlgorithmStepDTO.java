package com.example.demo.closestPair.dto;

import com.example.demo.closestPair.CandidateComparison;
import com.example.demo.closestPair.Point;
import com.example.demo.closestPair.PointPair;
import com.example.demo.closestPair.SweepLineStepType;

import java.util.List;

public record AlgorithmStepDTO(
        SweepLineStepType stepType,
        String description,
        Point currentPoint,
        //Delta used for the sweep windows shown in this snapshot. The current best distance is available through bestPair.distance().
        double windowDelta,
        List<Point> activePoints,
        List<Point> allPoints,
        PointPair bestPair,
        List<CandidateComparison> candidateComparisons,
        List<Point> removedPoints,
        List<Point> processedPoints,
        List<Point> futurePoints
) {}
