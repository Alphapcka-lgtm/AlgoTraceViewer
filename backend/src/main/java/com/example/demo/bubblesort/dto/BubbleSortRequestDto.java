package com.example.demo.bubblesort.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record BubbleSortRequestDto(List<Integer> numbers) {
}
