package com.example.demo.vertexCover;

import com.example.demo.model.Edge;
import com.example.demo.model.Graph;
import com.example.demo.model.Node;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RandomVertexCover {

    public AnimationResponse solve(AnimationRequest request) {

        List<AnimationState> intermediateStates = new ArrayList<>();
        List<String> nodeOrder = new ArrayList<>();
        List<String> edgeOrder = new ArrayList<>();
        Graph graph = Graph.getShortenedIdGraph(request.getGraph());

        if (Objects.isNull(request.getNodeOrder()) || request.getNodeOrder().isEmpty()) {
            nodeOrder.addAll(graph.getNodes().stream().map(Node::id).toList());
            Collections.shuffle(nodeOrder);
        } else {
            nodeOrder.addAll(request.getNodeOrder());
        }

        if (Objects.isNull(request.getEdgeOrder()) || request.getEdgeOrder().isEmpty()) {
            edgeOrder.addAll(graph.getEdges().stream().map(Edge::id).toList());
            Collections.shuffle(edgeOrder);
        } else {
            edgeOrder.addAll(request.getEdgeOrder());
        }

        OrderComparator comparator = new OrderComparator(edgeOrder);
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
                .nodeOrder(nodeOrder)
                .edgeOrder(edgeOrder)
                .intermediateStates(intermediateStates)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}


