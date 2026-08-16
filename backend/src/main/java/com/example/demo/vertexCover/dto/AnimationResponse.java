package com.example.demo.vertexCover.dto;

import com.example.demo.vertexCover.model.AnimationState;
import com.example.demo.vertexCover.model.Graph;
import com.example.demo.vertexCover.model.NodeDegreePair;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnimationResponse {
    public final Graph initialState;
    public final List<NodeDegreePair> initialDegreeMap;
    public final List<AnimationState> intermediateStates;
    public final Long timestamp;
}
