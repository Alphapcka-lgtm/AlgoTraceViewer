package com.example.demo.vertexCover;

import com.example.demo.model.Edge;
import com.example.demo.model.Graph;
import com.example.demo.model.Node;
import com.example.demo.model.NodeDegreePair;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MaxDegreeVertexCover {

    public static Comparator<NodeDegreePair> NDPComp = (n1, n2) -> {
        if(n1.node().label().length() == n2.node().label().length()){
            return n1.node().label().compareTo(n2.node().label());
        } else {
            return n1.node().label().length() -  n2.node().label().length();
        }
    };

    public AnimationResponse solve(VertexCoverRequest request) {

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

        OrderComparator comparator = new OrderComparator(nodeOrder);
        List<Edge> remainingEdges = new ArrayList<>(graph.getEdges());

        Map<Node, Integer> neighbourCount = new HashMap<>();

        graph.getEdges().forEach(edge -> {
            neighbourCount.put(graph.getNodeById(edge.fromId()), neighbourCount.getOrDefault(graph.getNodeById(edge.fromId()), 0) + 1);
            neighbourCount.put(graph.getNodeById(edge.toId()), neighbourCount.getOrDefault(graph.getNodeById(edge.toId()), 0) + 1);
        });

        List<NodeDegreePair> initialDegreePairs = neighbourCount.entrySet().stream()
                .map(entry -> new NodeDegreePair(entry.getKey(), entry.getValue()))
                .sorted(NDPComp)
                .toList();

        while (!remainingEdges.isEmpty()) {

            int maxDegree = neighbourCount.values().stream().max(Integer::compareTo).orElse(0);

            List<Node> maxDegreeNodes = neighbourCount.entrySet().stream().filter(e -> e.getValue() == maxDegree).map(Map.Entry::getKey).toList();

            Node maxDegreeNode = maxDegreeNodes.stream().min(comparator::compare).orElseThrow();

            List<Edge> incidentEdges = remainingEdges.stream().filter(edge -> {
                if (edge.fromId().equals(maxDegreeNode.id()) || edge.toId().equals(maxDegreeNode.id())) {
                    neighbourCount.put(graph.getNodeById(edge.fromId()), neighbourCount.get(graph.getNodeById(edge.fromId())) - 1);
                    neighbourCount.put(graph.getNodeById(edge.toId()), neighbourCount.get(graph.getNodeById(edge.toId())) - 1);
                    return true;
                }
                return false;
            }).toList();

            remainingEdges.removeAll(incidentEdges);

            List<NodeDegreePair> degreePairs = neighbourCount.entrySet().stream()
                    .map(entry -> new NodeDegreePair(entry.getKey(), entry.getValue()))
                    .sorted(NDPComp)
                    .toList();

            intermediateStates.add(AnimationState.builder()
                    .incidentEdges(incidentEdges)
                    .chosenNodes(List.of(maxDegreeNode))
                    .degreeMap(degreePairs)
                    .build()
            );
        }
        return AnimationResponse.builder()
                .initialState(graph)
                .nodeOrder(nodeOrder)
                .edgeOrder(edgeOrder)
                .initialDegreeMap(initialDegreePairs)
                .intermediateStates(intermediateStates)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
