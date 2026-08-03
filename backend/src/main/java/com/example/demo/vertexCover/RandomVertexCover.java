package com.example.demo.vertexCover;

import com.example.demo.model.Edge;
import com.example.demo.model.Graph;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RandomVertexCover {

    public AnimationResponse solve(Graph graph, List<String> order) {

        List<AnimationState> intermediateStates = new ArrayList<>();

        if (order.isEmpty()) {
            order.addAll(graph.getEdges().stream().map(Edge::id).toList());
            Collections.shuffle(order);
        }

        OrderComparator comparator = new OrderComparator(order);

        List<Edge> remainingEdges = new ArrayList<>(graph.getEdges());

        while (!remainingEdges.isEmpty()) {
            Edge chosenEdge = remainingEdges.stream().min(comparator::compare).orElseThrow();

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
                    .chosenNodes(List.of(graph.getNodeById(chosenEdge.fromId()), graph.getNodeById(chosenEdge.toId())))
                    .build()
            );
        }
        return AnimationResponse.builder()
                .initialState(graph)
                .order(order)
                .intermediateStates(intermediateStates)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}


