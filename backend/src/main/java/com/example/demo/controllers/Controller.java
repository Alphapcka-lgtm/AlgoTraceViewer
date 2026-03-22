package com.example.demo.controllers;

import com.example.demo.bubblesort.BubbleSort;
import com.example.demo.bubblesort.dto.BubbleSortRequestDto;
import com.example.demo.bubblesort.dto.BubbleSortResponseDto;
import com.example.demo.bubblesort.entities.BubbleSortState;
import jakarta.websocket.server.PathParam;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class Controller {

    @GetMapping
    public int base() {
        return 0;
    }

    @GetMapping("/algo")
    public Algo algo(@PathParam("name") String name) {
        return new Algo(name);
    }

    @PostMapping("/bubblesort")
    public BubbleSortResponseDto bubbleSort(@RequestBody BubbleSortRequestDto requestDto) {
        final List<BubbleSortState> bubbleSortStates = BubbleSort.sort(requestDto.numbers());
        return BubbleSortResponseDto.builder().states(bubbleSortStates).build();
    }

    public record Algo(String name) {
    }

}
