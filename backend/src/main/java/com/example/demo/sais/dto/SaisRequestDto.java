package com.example.demo.sais.dto;

import com.example.demo.model.AnimationRequest;
import lombok.Builder;

@Builder
public record SaisRequestDto(String source, Long timestamp) implements AnimationRequest {
}
