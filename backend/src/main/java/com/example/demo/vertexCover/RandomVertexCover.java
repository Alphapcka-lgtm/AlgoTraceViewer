package com.example.demo.vertexCover;

import com.example.demo.model.Edge;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RandomVertexCover {

    public AnimationResponse solve(AnimationRequest request) {

        List<AnimationState> intermediateStates = new ArrayList<>();
        List<String> edgeOrder = new ArrayList<>();

        if (Objects.isNull(request.edgeOrder()) || request.edgeOrder().isEmpty()) {
            edgeOrder.addAll(request.graph().getEdges().stream().map(Edge::id).toList());
            Collections.shuffle(edgeOrder);
        } else {
            edgeOrder.addAll(request.edgeOrder());
        }

        OrderComparator comparator = new OrderComparator(edgeOrder);
        List<Edge> remainingEdges = new ArrayList<>(request.graph().getEdges());

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
                    .chosenNodes(List.of(request.graph().getNodeById(chosenEdge.fromId()), request.graph().getNodeById(chosenEdge.toId())))
                    .build()
            );
        }
        return AnimationResponse.builder()
                .initialState(request.graph())
                .nodeOrder(request.nodeOrder())
                .edgeOrder(edgeOrder)
                .intermediateStates(intermediateStates)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}


