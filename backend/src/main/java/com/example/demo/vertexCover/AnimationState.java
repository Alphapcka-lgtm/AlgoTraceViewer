package com.example.demo.vertexCover;

import com.example.demo.model.Edge;
import com.example.demo.model.Node;
import com.example.demo.model.NodeDegreePair;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class AnimationState {
    public final Edge chosenEdge;
    public final List<Node> chosenNodes;
    public final List<Edge> incidentEdges;
    public final List<NodeDegreePair> degreeMap;
}
