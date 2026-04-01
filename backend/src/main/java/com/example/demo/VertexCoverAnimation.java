package com.example.demo;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class VertexCoverAnimation {
    public final List<VertexCoverState> states;

    public VertexCoverAnimation(List<VertexCoverState> states) {
        this.states = states;
    }
}
