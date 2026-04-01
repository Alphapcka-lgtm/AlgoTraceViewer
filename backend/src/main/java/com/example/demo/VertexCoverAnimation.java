package com.example.demo;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class VertexCoverAnimation {
    public final Graph initialState;
    public final List<VertexCoverState> intermediateStates;
}
