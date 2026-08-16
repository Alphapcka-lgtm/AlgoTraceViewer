package com.example.demo.suffixArray.dto;

import com.example.demo.shared.AnimationRequest;
import lombok.Builder;

@Builder
public record SaisRequestDto(String source, Long timestamp) implements AnimationRequest {
}
