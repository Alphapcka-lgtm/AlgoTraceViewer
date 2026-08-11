package com.example.demo;

import com.example.demo.ClosestPair.ClosestPairService;
import com.example.demo.ClosestPair.Point;
import dto.AlgorithmStepDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/closestPair")
@CrossOrigin(origins = "http://localhost:5173")
public class ClosestPairController {

    private final ClosestPairService closestPairService;

    public ClosestPairController(ClosestPairService sLineService) {
        this.closestPairService = sLineService;
    }

    @PostMapping("/steps")
    public List<AlgorithmStepDTO> calculateSteps(@RequestBody List<Point> points) {
        return closestPairService.nearestPoints(points);
    }

}
