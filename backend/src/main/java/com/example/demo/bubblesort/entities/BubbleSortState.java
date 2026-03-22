package com.example.demo.bubblesort.entities;

import lombok.Builder;

import java.util.List;

@Builder
public record BubbleSortState(List<Integer> numbers) {
}
