package com.example.demo;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RandomVertexCover {
    public Set<Node> solve(Graph graph, Long seed) {
        Random randomGenerator = seed == null ? new Random() : new Random(seed);

        List<Edge> remainingEdges = new ArrayList<>(graph.edges());
        Set<Node> chosenNodes = new HashSet<>(graph.nodes().size());

        while (!remainingEdges.isEmpty()) {
            Edge randomEdge = remainingEdges.get(randomGenerator.nextInt(remainingEdges.size()));
            List<Edge> incidentEdges = remainingEdges.stream()
                    .filter(edge ->
                            edge.fromId() == randomEdge.fromId() ||
                            edge.toId() == randomEdge.fromId() ||
                            edge.fromId()== randomEdge.toId() ||
                            edge.toId() == randomEdge.toId())
                    .toList();
            remainingEdges.removeAll(incidentEdges);
            chosenNodes.add(getNodeById(graph.nodes(), randomEdge.fromId()));
            chosenNodes.add(getNodeById(graph.nodes(), randomEdge.toId()));
        }
        return chosenNodes;
    }

    public Set<Node> solve(Graph graph) {
        return solve(graph, null);
    }

    private static Node getNodeById(List<Node> nodes, long id) {
        return nodes.stream().filter(node -> node.id() == id).findFirst().orElseThrow();
    }

}


