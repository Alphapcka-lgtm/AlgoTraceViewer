package com.example.demo.vertexCover;

import com.example.demo.vertexCover.dto.VertexCoverRequest;
import com.example.demo.vertexCover.model.Edge;
import com.example.demo.vertexCover.dto.AnimationResponse;
import com.example.demo.vertexCover.model.AnimationState;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RandomVertexCover {

    public AnimationResponse solve(VertexCoverRequest request) {


        List<Edge> remainingEdges = new ArrayList<>(request.getGraph().getEdges());
        OrderComparator comparator = new OrderComparator(request.getEdgeOrder());
        List<AnimationState> intermediateStates = new ArrayList<>();

        while (!remainingEdges.isEmpty()) {
            Edge chosenEdge = remainingEdges.stream().min(comparator).orElseThrow();

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
                    .chosenNodes(List.of(request.getGraph().getNodeById(chosenEdge.fromId()), request.getGraph().getNodeById(chosenEdge.toId())))
                    .build()
            );
        }
        return AnimationResponse.builder()
                .initialState(request.getGraph())
                .intermediateStates(intermediateStates)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}


