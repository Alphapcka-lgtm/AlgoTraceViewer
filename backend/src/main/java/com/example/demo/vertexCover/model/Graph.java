package com.example.demo.vertexCover.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class Graph {

    private final List<Node> nodes;
    private final List<Edge> edges;
    @JsonIgnore
    private final Map<String, Node> map = new HashMap<>();


    public Graph(List<Node> nodes, List<Edge> edges) {
        this.nodes = nodes;
        this.edges = edges;
        nodes.forEach(node -> map.put(node.id(), node));
    }

    public Node getNodeById(String id) {
        return map.get(id);
    }

    public static Graph getShortenedIdGraph(Graph graph) {
        Map<String, String> idMap = new HashMap<>();
        graph.getNodes().forEach(node -> idMap.put(node.id(), node.label()));

        List<Node> nodes = graph.getNodes().stream().map(n -> new Node(n.x(), n.y(), idMap.get(n.id()), n.label())).toList();

        List<Edge> edges = graph.getEdges().stream().map(e -> {
            String newFromId = idMap.get(e.fromId());
            String newToId = idMap.get(e.toId());
            return new Edge(newFromId, newToId, newFromId + "-" + newToId);
        }).toList();

        return new Graph(nodes, edges);
    }
}
