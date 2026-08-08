package com.example.demo.vertexCover;

import com.example.demo.model.Graph;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@Builder
@RequiredArgsConstructor
public class AnimationRequest {

    private final Graph graph;
    private final List<String> nodeOrder;
    private final List<String> edgeOrder;
    private final Double densityFactor;
    private final String presetName;
    private final Long timestamp;

}
