package com.example.demo.vertexCover;

import com.example.demo.model.Edge;
import com.example.demo.model.Graph;
import com.example.demo.model.Node;
import com.example.demo.model.NodeDegreePair;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MaxDegreeVertexCover {

    private static final Map<String, int[]> presets = Map.of("preset", new int[]{0, 2, 2, 3, 5, 4, 2, 2, 0, 2, 2, 0, 1, 6, 2, 2, 2, 7, 6, 4, 6, 5, 8, 0, 0, 2, 0});

    private static final Comparator<NodeDegreePair> comp = (ndp1, ndp2) -> ndp1.node().label().length() == ndp2.node().label().length() ? ndp1.node().label().compareTo(ndp2.node().label()) : ndp1.node().label().length() -  ndp2.node().label().length();

    public AnimationResponse solve(Graph graph, Long seed) {

        Random randomGenerator;

        if(presets.containsKey("presets")){
            randomGenerator = new PresetRandom(presets.get("preset"));
        } else {
            seed = seed == 0 ? System.nanoTime() : seed;
            randomGenerator = new Random(seed);
        }

        Map<Node, Integer> neighbourCount = new HashMap<>();

        List<AnimationState> intermediateStates = new ArrayList<>();

        graph.edges().forEach(edge -> {
            neighbourCount.put(getNodeById(graph.nodes(), edge.fromId()), neighbourCount.getOrDefault(getNodeById(graph.nodes(), edge.fromId()), 0) + 1);
            neighbourCount.put(getNodeById(graph.nodes(), edge.toId()), neighbourCount.getOrDefault(getNodeById(graph.nodes(), edge.toId()), 0) + 1);
        });

        List<NodeDegreePair> initialDegreePairs = neighbourCount.entrySet().stream().map(entry -> new NodeDegreePair(entry.getKey(), entry.getValue())).toList();

        List<Edge> remainingEdges = new ArrayList<>(graph.edges());

        while (!remainingEdges.isEmpty()) {

            int maxDegree = neighbourCount.values().stream().max(Integer::compareTo).orElse(0);

            List<Node> maxDegreeNodes = neighbourCount.entrySet().stream().filter(e -> e.getValue() == maxDegree).map(Map.Entry::getKey).toList();

            int randomIndex = randomGenerator.nextInt(maxDegreeNodes.size());

            Node maxDegreeNode = maxDegreeNodes.get(randomIndex);

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
                    .sorted(comp).toList();

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

    private static class PresetRandom extends Random {

        private final int[] preset;
        private int index = 0;

        public PresetRandom(int[] preset) {
            this.preset = preset;
        }

        @Override
        public int nextInt(int bound) {
            return preset[index++];
        }
    }
}
