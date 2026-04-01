package com.example.demo;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RandomVertexCover {



    public VertexCoverAnimation solve(Graph graph, Long seed) {
        List<VertexCoverState> states = new ArrayList<>();

        Random randomGenerator = seed == null ? new Random() : new Random(seed);

        List<Edge> remainingEdges = new ArrayList<>(graph.edges());

        while (!remainingEdges.isEmpty()) {
            Edge chosenEdge = remainingEdges.get(randomGenerator.nextInt(remainingEdges.size()));
            remainingEdges.remove(chosenEdge);

            List<Edge> incidentEdges = remainingEdges.stream()
                    .filter(edge ->
                            edge.fromId() == chosenEdge.fromId() ||
                            edge.toId() == chosenEdge.fromId() ||
                            edge.fromId()== chosenEdge.toId() ||
                            edge.toId() == chosenEdge.toId())
                    .toList();
            remainingEdges.removeAll(incidentEdges);

            states.add(VertexCoverState.builder()
                    .chosenEdge(chosenEdge)
                    .incidentEdges(incidentEdges)
                    .chosenNodes(List.of(getNodeById(graph.nodes(), chosenEdge.fromId()), getNodeById(graph.nodes(), chosenEdge.toId())))
                    .build()
            );
        }

        return VertexCoverAnimation.builder().states(states).build();
    }

    public VertexCoverAnimation solve(Graph graph) {
        return solve(graph, null);
    }

    private static Node getNodeById(List<Node> nodes, long id) {
        return nodes.stream().filter(node -> node.id() == id).findFirst().orElseThrow();
    }

}


