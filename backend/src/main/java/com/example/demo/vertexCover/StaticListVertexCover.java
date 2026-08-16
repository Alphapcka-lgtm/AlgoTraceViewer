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
public class StaticListVertexCover {

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
                .sorted(Comparator.comparingInt(NodeDegreePair::getDegree).thenComparing(NodeDegreePair::getNode, comparator).reversed()).toList();

        int i = 0;

        while (!remainingEdges.isEmpty()) {

            Node maxDegreeNode = initialDegreePairs.get(i).getNode();

            List<Edge> incidentEdges = remainingEdges.stream().filter(edge -> edge.fromId().equals(maxDegreeNode.id()) || edge.toId().equals(maxDegreeNode.id())).toList();
            neighbourCount.put(request.getGraph().getNodeById(maxDegreeNode.id()), 0);

            remainingEdges.removeAll(incidentEdges);

            intermediateStates.add(AnimationState.builder()
                    .incidentEdges(incidentEdges)
                    .chosenNodes(List.of(maxDegreeNode))
                    .degreeMap(initialDegreePairs)
                    .build()
            );
            i++;
        }
        return AnimationResponse.builder()
                .initialState(request.getGraph())
                .initialDegreeMap(initialDegreePairs)
                .intermediateStates(intermediateStates)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
