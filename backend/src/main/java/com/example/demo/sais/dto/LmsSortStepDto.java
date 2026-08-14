package com.example.demo.sais.dto;

public record LmsSortStepDto(int sortedReducedIndex,
                             int lmsIndex,
                             int sourceIndex,
                             int bucketIndex,
                             int[] resultingSa) {
}
