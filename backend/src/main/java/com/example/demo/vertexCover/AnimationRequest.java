package com.example.demo.vertexCover;

import com.example.demo.model.Graph;

import java.util.List;

public record AnimationRequest(Graph graph, List<String> nodeOrder, List<String> edgeOrder, String preset, Long timestamp) {}
