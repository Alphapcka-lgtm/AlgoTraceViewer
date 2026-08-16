package com.example.demo.suffixArray.dto;

import lombok.Builder;

@Builder
public record SortStepDto(int sourceIndex,
                          int bucketIndex,
                          int[] resultingArray,
                          String stepDescription,
                          int induceSaIndex,
                          int seedSourceIndex) {
}
