package com.example.demo.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class NodeDegreePair {
    Node node;
    int degree;
}