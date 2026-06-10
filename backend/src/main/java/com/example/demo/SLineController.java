package com.example.demo;

import dto.AlgorithmStepDTO;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/sweepline")
@CrossOrigin(origins = "http://localhost:5173")
public class SLineController {

    private final SLineService sweepLineService;

    public SLineController(SLineService sLineService) {
        this.sweepLineService = sLineService;
    }

    @PostMapping("/steps")
    public List<AlgorithmStepDTO> calculateSteps(@RequestBody List<Point> points) {
        return sweepLineService.nearestPoints(points);
    }

}
