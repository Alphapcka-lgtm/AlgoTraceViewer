package com.example.demo.vertexCover.dto;

import com.example.demo.shared.AnimationRequest;
import com.example.demo.vertexCover.model.Graph;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class VertexCoverRequest implements AnimationRequest {
    private final Graph graph;
    private final List<String> nodeOrder;
    private final List<String> edgeOrder;
    private final Long timestamp;

}
