package com.example.demo.vertexCover;

import com.example.demo.model.Edge;
import com.example.demo.model.Graph;
import com.example.demo.model.Node;
import com.example.demo.model.NodeDegreePair;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StaticListVertexCover {

    public static Comparator<NodeDegreePair> NDPComp = (n1, n2) -> {
        if(n1.node().label().length() == n2.node().label().length()){
            return n1.node().label().compareTo(n2.node().label());
        } else {
            return n1.node().label().length() -  n2.node().label().length();
        }
    };

    public AnimationResponse solve(Graph graph, Long seed) {
        seed = seed == null || seed == 0 ? System.nanoTime() : seed;

        List<AnimationState> intermediateStates = new ArrayList<>();

        Random randomGenerator = new Random(seed);

        List<Edge> remainingEdges = new ArrayList<>(graph.edges());

        Map<Node, Integer> neighbourCount = new HashMap<>();

        graph.edges().forEach(edge -> {
            neighbourCount.put(getNodeById(graph.nodes(), edge.fromId()), neighbourCount.getOrDefault(getNodeById(graph.nodes(), edge.fromId()), 0) + 1);
            neighbourCount.put(getNodeById(graph.nodes(), edge.toId()), neighbourCount.getOrDefault(getNodeById(graph.nodes(), edge.toId()), 0) + 1);
        });

        List<NodeDegreePair> initialDegreePairs = neighbourCount.entrySet().stream()
                .map(entry -> new NodeDegreePair(entry.getKey(), entry.getValue()))
                .sorted(NDPComp)
                .toList();

        while (!remainingEdges.isEmpty()) {

            int maxDegree = neighbourCount.values().stream().max(Integer::compareTo).orElse(0);

            List<Node> maxDegreeNodes = neighbourCount.entrySet().stream().filter(e -> e.getValue() == maxDegree).map(Map.Entry::getKey).toList();

            int randomIndex = randomGenerator.nextInt(maxDegreeNodes.size());

            Node maxDegreeNode = maxDegreeNodes.get(randomIndex);

            List<Edge> incidentEdges = remainingEdges.stream().filter(edge -> edge.fromId().equals(maxDegreeNode.id()) || edge.toId().equals(maxDegreeNode.id())).toList();
            neighbourCount.put(getNodeById(graph.nodes(), maxDegreeNode.id()), 0);

            remainingEdges.removeAll(incidentEdges);

            List<NodeDegreePair> degreePairs = neighbourCount.entrySet().stream()
                    .map(entry -> new NodeDegreePair(entry.getKey(), entry.getValue()))
                    .sorted(NDPComp)
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
                .randomSeed(seed)
                .build();
    }

    private static Node getNodeById(List<Node> nodes, String id) {
        return nodes.stream().filter(node -> node.id().equals(id)).findFirst().orElseThrow();
    }
}
