package com.example.demo.sweepLine;

import com.example.demo.model.Node;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnimationState {
    public final Node CurrentNode;
    public final List<Node> pointsToCompare;
    public final Node ClosestNode;
    public final Double d;
}
