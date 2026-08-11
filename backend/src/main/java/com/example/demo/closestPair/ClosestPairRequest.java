package com.example.demo.closestPair;

import com.example.demo.model.AnimationRequest;
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
