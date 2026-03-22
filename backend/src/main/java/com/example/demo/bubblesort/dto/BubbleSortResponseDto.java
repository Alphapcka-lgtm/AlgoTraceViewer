package com.example.demo.bubblesort.dto;

import com.example.demo.bubblesort.entities.BubbleSortState;
import lombok.Builder;

import java.util.List;

@Builder
public record BubbleSortResponseDto(List<BubbleSortState> states) {
}
