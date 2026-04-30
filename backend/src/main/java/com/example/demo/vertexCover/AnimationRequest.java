package com.example.demo.vertexCover;

import com.example.demo.model.Graph;

public record AnimationRequest(Graph graph, Long randomSeed, Long timestamp) {}
