package com.example.demo.vertexCover.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NodeDegreePair implements Comparable<NodeDegreePair> {
    Node node;
    int degree;

    @Override
    public int compareTo(NodeDegreePair o) {
        if(node.label().length() == o.getNode().label().length()){
            return node.label().compareTo(o.getNode().label());
        } else {
            return node.label().length() -  o.getNode().label().length();
        }
    }
}