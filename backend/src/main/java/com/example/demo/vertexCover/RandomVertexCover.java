package com.example.demo.vertexCover;

import com.example.demo.model.Edge;
import com.example.demo.model.Graph;
import com.example.demo.model.Node;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RandomVertexCover {

    public AnimationResponse solve(Graph graph, Long seed) {
        seed = seed == 0 ? System.nanoTime() : seed;

        List<AnimationState> intermediateStates = new ArrayList<>();

        Random randomGenerator = new Random(seed);

        List<Edge> remainingEdges = new ArrayList<>(graph.edges());

        while (!remainingEdges.isEmpty()) {
            Edge chosenEdge = remainingEdges.get(randomGenerator.nextInt(remainingEdges.size()));
            //remainingEdges.remove(chosenEdge);

            List<Edge> incidentEdges = remainingEdges.stream()
                    .filter(edge ->
                            edge.fromId().equals(chosenEdge.fromId()) ||
                            edge.toId().equals(chosenEdge.fromId()) ||
                            edge.fromId().equals(chosenEdge.toId()) ||
                            edge.toId().equals(chosenEdge.toId()))
                    .toList();
            remainingEdges.removeAll(incidentEdges);

            intermediateStates.add(AnimationState.builder()
                    .chosenEdge(chosenEdge)
                    .incidentEdges(incidentEdges)
                    .chosenNodes(List.of(getNodeById(graph.nodes(), chosenEdge.fromId()), getNodeById(graph.nodes(), chosenEdge.toId())))
                    .build()
            );
        }
        return AnimationResponse.builder()
                .initialState(graph)
                .intermediateStates(intermediateStates)
                .randomSeed(seed)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    private static Node getNodeById(List<Node> nodes, String id) {
        return nodes.stream().filter(node -> node.id().equals(id)).findFirst().orElseThrow();
    }
}


