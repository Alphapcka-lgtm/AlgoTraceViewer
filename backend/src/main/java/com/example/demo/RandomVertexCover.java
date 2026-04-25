package com.example.demo;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RandomVertexCover {



    public VertexCoverAnimation solve(Graph graph, Long seed) {
        List<VertexCoverState> intermediateStates = new ArrayList<>();

        Random randomGenerator = new Random(seed);

        List<Edge> remainingEdges = new ArrayList<>(graph.edges());

        while (!remainingEdges.isEmpty()) {
            Edge chosenEdge = remainingEdges.get(randomGenerator.nextInt(remainingEdges.size()));
            remainingEdges.remove(chosenEdge);

            List<Edge> incidentEdges = remainingEdges.stream()
                    .filter(edge ->
                            edge.fromId().equals(chosenEdge.fromId()) ||
                            edge.toId().equals(chosenEdge.fromId()) ||
                            edge.fromId().equals(chosenEdge.toId()) ||
                            edge.toId().equals(chosenEdge.toId()))
                    .toList();
            remainingEdges.removeAll(incidentEdges);

            intermediateStates.add(VertexCoverState.builder()
                    .chosenEdge(chosenEdge)
                    .incidentEdges(incidentEdges)
                    .chosenNodes(List.of(getNodeById(graph.nodes(), chosenEdge.fromId()), getNodeById(graph.nodes(), chosenEdge.toId())))
                    .build()
            );
        }

        return VertexCoverAnimation.builder().initialState(graph).intermediateStates(intermediateStates).build();
    }

    public VertexCoverAnimation solve(Graph graph) {
        return solve(graph, System.nanoTime());
    }

    private static Node getNodeById(List<Node> nodes, String id) {
        return nodes.stream().filter(node -> node.id().equals(id)).findFirst().orElseThrow();
    }

}


