package com.example.demo;

import com.example.demo.closestPair.SweepLineService;
import com.example.demo.closestPair.Point;
import dto.AlgorithmStepDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/closestPair")
public class ClosestPairController {

    private final SweepLineService sweepLineService;

    public ClosestPairController(SweepLineService sLineService) {
        this.sweepLineService = sLineService;
    }

    @PostMapping("/sweepLine")
    public List<AlgorithmStepDTO> calculateSteps(@RequestBody List<Point> points) {
        return sweepLineService.nearestPoints(points);
    }

}
