package com.example.demo.sais.dto;

import com.example.demo.sais.validatioin.SaisRequestDtoConstraint;
import lombok.Builder;

@Builder
public record SaisRequestDto(@SaisRequestDtoConstraint String source) {
}
