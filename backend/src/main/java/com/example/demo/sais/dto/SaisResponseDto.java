package com.example.demo.sais.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record SaisResponseDto(
        String source,
        List<BucketSizeDto> bucketSizes,
        TypeMapDto typeMapDto,
        List<SortStepDto> guessLmsSteps,
        List<SortStepDto> guessInduceL,
        List<SortStepDto> guessInduceS,
        int[] guessedSa,
        int[] lmsOrder,
        int[] lmsNames,
        int[] lmsPositions,
        int[] reduced,
        int[] reducedSorted,
        int[] saLmsAdded,
        List<SortStepDto> saInduceL,
        List<SortStepDto> saInduceS,
        int[] sa,
        Long timestamp) {
}
