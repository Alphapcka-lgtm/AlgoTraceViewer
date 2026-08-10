package com.example.demo.EhrlichSwapsAlgorithm;

import com.example.demo.model.AnimationRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
@AllArgsConstructor
public class EhrlichSwapsRequest implements AnimationRequest {
    List<String> inputValues;
    Long timestamp;
}
