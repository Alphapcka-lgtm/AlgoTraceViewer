package com.example.demo;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnimationState {
    public final Edge chosenEdge;
    public final List<Node> chosenNodes;
    public final List<Edge> incidentEdges;
}
