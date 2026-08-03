package com.example.demo.model;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@EqualsAndHashCode
public class Graph {

    private final List<Node> nodes;
    private final List<Edge> edges;
    private final Map<String, Node> map = new HashMap<>();


    public Graph(List<Node> nodes, List<Edge> edges) {
        this.nodes = nodes;
        this.edges = edges;
        nodes.forEach(node -> map.put(node.id(), node));
    }

    public Node getNodeById(String id) {
        return map.get(id);
    }
}
