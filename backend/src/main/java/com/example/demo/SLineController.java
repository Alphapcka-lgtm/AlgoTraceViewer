package com.example.demo;

import com.example.demo.ClosestPair.Point;
import com.example.demo.ClosestPair.SLineService;
import dto.AlgorithmStepDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/closestPair")
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
