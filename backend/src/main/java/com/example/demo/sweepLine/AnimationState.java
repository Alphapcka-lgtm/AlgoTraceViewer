package com.example.demo.sweepLine;

import com.example.demo.model.Node;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnimationState {
    public final Node currentNode;
    public final List<Node> nodesToCompare;
    public final Node closestNode;
    public final Double d;
}
