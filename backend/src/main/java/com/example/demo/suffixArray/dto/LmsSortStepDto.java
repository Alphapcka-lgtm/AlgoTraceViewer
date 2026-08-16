package com.example.demo.suffixArray.dto;

public record LmsSortStepDto(int sortedReducedIndex,
                             int lmsIndex,
                             int sourceIndex,
                             int bucketIndex,
                             int[] resultingSa) {
}
