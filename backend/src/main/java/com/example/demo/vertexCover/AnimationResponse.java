package com.example.demo.vertexCover;

import com.example.demo.model.Graph;
import com.example.demo.model.NodeDegreePair;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnimationResponse {
    public final Graph initialState;
    public final List<String> order;
    public final List<NodeDegreePair> initialDegreeMap;
    public final List<AnimationState> intermediateStates;
    public final Long timestamp;
}
