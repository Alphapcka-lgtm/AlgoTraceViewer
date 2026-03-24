package com.example.demo;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class RandomVertexCover {
    public List<Point> solve(Graph graph, Long seed) {
        Random randomGenerator = seed == null ? new Random() : new Random(seed);
        List<Point> remainingPoints = new ArrayList<>(graph.points());
        List<Point> chosenPoints = new ArrayList<>(graph.points().size());

        while (!remainingPoints.isEmpty()) {
            Point randomPoint = remainingPoints.get(randomGenerator.nextInt(remainingPoints.size()));
            List<Point> adjacentPoints = graph.edges().stream()
                    .filter(edge -> edge.from().equals(randomPoint) || edge.to().equals(randomPoint))
                    .map(edge -> edge.from().equals(randomPoint) ? edge.to() : edge.from())
                    .toList();
            remainingPoints.removeAll(adjacentPoints);
            chosenPoints.add(randomPoint);
        }
        return chosenPoints;
    }

    public List<Point> solve(Graph graph) {
        return solve(graph, null);
    }
}
