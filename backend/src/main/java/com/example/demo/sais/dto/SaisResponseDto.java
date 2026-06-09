package com.example.demo.sais.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record SaisResponseDto(
        String source,
        int[] bucketSizes,
        TypeMapDto typeMapDto,
        List<SortStep> guessSteps,
        List<SortStep> guessInduceL,
        List<SortStep> guessInduceS,
        int[] lmsOrder,
        int[] lmsNames,
        int[] lmsPositions,
        int[] reduced,
        int[] reducedSorted,
        int[] saLmsAdded,
        List<SortStep> saInduceL,
        List<SortStep> saInduceS,
        int[] sa) {
}
