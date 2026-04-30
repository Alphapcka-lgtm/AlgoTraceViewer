package com.example.demo.sweepLine;

import com.example.demo.model.Graph;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnimationResponse {
    public final Graph initialState;
    public final List<AnimationState> intermediateStates;
    public final Long timestamp;
}
