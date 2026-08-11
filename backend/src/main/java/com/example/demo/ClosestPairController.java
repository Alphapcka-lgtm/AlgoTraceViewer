package com.example.demo;

import com.example.demo.ClosestPair.ClosestPairRequest;
import com.example.demo.ClosestPair.ClostestPairService;
import dto.AlgorithmStepDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/closestPair")
@CrossOrigin(origins = "http://localhost:5173")
public class ClosestPairController {

    private final ClostestPairService closestPairService;

    public ClosestPairController(ClostestPairService sLineService) {
        this.closestPairService = sLineService;
    }

    @PostMapping("/steps")
    public List<AlgorithmStepDTO> calculateSteps(@RequestBody ClosestPairRequest closestPairRequest) {
        return closestPairService.nearestPoints(closestPairRequest);
    }

}
