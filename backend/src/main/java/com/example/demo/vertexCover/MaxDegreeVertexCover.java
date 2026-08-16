package com.example.demo.vertexCover;

import com.example.demo.vertexCover.dto.VertexCoverRequest;
import com.example.demo.vertexCover.model.Edge;
import com.example.demo.vertexCover.model.Node;
import com.example.demo.vertexCover.model.NodeDegreePair;
import com.example.demo.vertexCover.dto.AnimationResponse;
import com.example.demo.vertexCover.model.AnimationState;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MaxDegreeVertexCover {

    public AnimationResponse solve(VertexCoverRequest request) {

        List<Edge> remainingEdges = new ArrayList<>(request.getGraph().getEdges());
        OrderComparator comparator = new OrderComparator(request.getNodeOrder());
        List<AnimationState> intermediateStates = new ArrayList<>();
        Map<Node, Integer> neighbourCount = new HashMap<>();

        request.getGraph().getEdges().forEach(edge -> {
            neighbourCount.put(request.getGraph().getNodeById(edge.fromId()), neighbourCount.getOrDefault(request.getGraph().getNodeById(edge.fromId()), 0) + 1);
            neighbourCount.put(request.getGraph().getNodeById(edge.toId()), neighbourCount.getOrDefault(request.getGraph().getNodeById(edge.toId()), 0) + 1);
        });

        List<NodeDegreePair> initialDegreePairs = neighbourCount.entrySet().stream()
                .map(entry -> NodeDegreePair.builder().node(entry.getKey()).degree(entry.getValue()).build())
                .sorted().toList();

        while (!remainingEdges.isEmpty()) {

            int maxDegree = neighbourCount.values().stream().max(Integer::compareTo).orElse(0);

            List<Node> maxDegreeNodes = neighbourCount.entrySet().stream().filter(e -> e.getValue() == maxDegree).map(Map.Entry::getKey).toList();

            Node maxDegreeNode = maxDegreeNodes.stream().min(comparator).orElseThrow();

            List<Edge> incidentEdges = remainingEdges.stream().filter(edge -> {
                if (edge.fromId().equals(maxDegreeNode.id()) || edge.toId().equals(maxDegreeNode.id())) {
                    neighbourCount.put(request.getGraph().getNodeById(edge.fromId()), neighbourCount.get(request.getGraph().getNodeById(edge.fromId())) - 1);
                    neighbourCount.put(request.getGraph().getNodeById(edge.toId()), neighbourCount.get(request.getGraph().getNodeById(edge.toId())) - 1);
                    return true;
                }
                return false;
            }).toList();

            remainingEdges.removeAll(incidentEdges);

            List<NodeDegreePair> degreePairs = neighbourCount.entrySet().stream()
                    .map(entry -> NodeDegreePair.builder().node(entry.getKey()).degree(entry.getValue()).build())
                    .sorted().toList();

            intermediateStates.add(AnimationState.builder()
                    .incidentEdges(incidentEdges)
                    .chosenNodes(List.of(maxDegreeNode))
                    .degreeMap(degreePairs)
                    .build()
            );
        }
        return AnimationResponse.builder()
                .initialState(request.getGraph())
                .initialDegreeMap(initialDegreePairs)
                .intermediateStates(intermediateStates)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
