package com.example.demo.sweepLine;

import com.example.demo.model.Node;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnimationState {
    public final Node CurrentPoint;
    public final List<Node> pointsToCompare;
    public final Node ClosestPoint;
    public final Double d;
}
