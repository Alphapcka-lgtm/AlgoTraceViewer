package com.example.demo.closestPair.dto;

import com.example.demo.closestPair.Point;
import com.example.demo.shared.AnimationRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
@AllArgsConstructor
public class ClosestPairRequest implements AnimationRequest {
    List<Point> points;
    Long timestamp;
}
