package com.example.demo.vertexCover;

import com.example.demo.model.Edge;
import com.example.demo.model.Graph;
import com.example.demo.model.Node;
import com.example.demo.model.NodeDegreePair;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MaxDegreeVertexCover {

    public AnimationResponse solve(Graph graph, Long seed) {
        seed = seed == 0 ? System.nanoTime() : seed;

        Random randomGenerator = new Random(seed);

        Map<Node, Integer> neighbourCount = new HashMap<>();

        List<AnimationState> intermediateStates = new ArrayList<>();

        graph.edges().forEach(edge -> {
            neighbourCount.put(getNodeById(graph.nodes(), edge.fromId()), neighbourCount.getOrDefault(getNodeById(graph.nodes(), edge.fromId()), 0) + 1);
            neighbourCount.put(getNodeById(graph.nodes(), edge.toId()), neighbourCount.getOrDefault(getNodeById(graph.nodes(), edge.toId()), 0) + 1);
        });

        List<NodeDegreePair> initialDegreePairs = neighbourCount.entrySet().stream().map(entry -> new NodeDegreePair(entry.getKey(), entry.getValue())).toList();

        List<Edge> remainingEdges = new ArrayList<>(graph.edges());

        while (!remainingEdges.isEmpty()) {


            Node maxDegreeNode = neighbourCount.entrySet().stream().max(Map.Entry.comparingByValue()).get().getKey();

            List<Edge> incidentEdges = remainingEdges.stream().filter(edge -> {
                if (edge.fromId().equals(maxDegreeNode.id()) || edge.toId().equals(maxDegreeNode.id())) {
                    neighbourCount.put(getNodeById(graph.nodes(), edge.fromId()), neighbourCount.get(getNodeById(graph.nodes(), edge.fromId())) - 1);
                    neighbourCount.put(getNodeById(graph.nodes(), edge.toId()), neighbourCount.get(getNodeById(graph.nodes(), edge.toId())) - 1);
                    return true;
                }
                return false;
            }).toList();

            remainingEdges.removeAll(incidentEdges);

            List<NodeDegreePair> degreePairs = neighbourCount.entrySet().stream()
                    .sorted(Comparator.comparing(e -> e.getKey().label()))
                    .map(entry -> new NodeDegreePair(entry.getKey(), entry.getValue()))
                    .toList();

            intermediateStates.add(AnimationState.builder()
                    .incidentEdges(incidentEdges)
                    .chosenNodes(List.of(maxDegreeNode))
                    .degreeMap(degreePairs)
                    .build()
            );
        }
        return AnimationResponse.builder()
                .initialState(graph)
                .initialDegreeMap(initialDegreePairs)
                .intermediateStates(intermediateStates)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    private static Node getNodeById(List<Node> nodes, String id) {
        return nodes.stream().filter(node -> node.id().equals(id)).findFirst().orElseThrow();
    }
}
