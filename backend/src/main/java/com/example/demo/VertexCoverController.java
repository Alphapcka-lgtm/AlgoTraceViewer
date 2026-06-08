package com.example.demo;

import com.example.demo.vertexCover.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.POST, RequestMethod.OPTIONS}
)
public class VertexCoverController {

    RandomVertexCover randomVertexCover;
    OptimalVertexCover optimalVertexCover;
    MaxDegreeVertexCover maxDegreeVertexCover;

    @Autowired
    public VertexCoverController(RandomVertexCover randomVertexCover, OptimalVertexCover optimalVertexCover,  MaxDegreeVertexCover maxDegreeVertexCover) {
        this.randomVertexCover = randomVertexCover;
        this.optimalVertexCover = optimalVertexCover;
        this.maxDegreeVertexCover = maxDegreeVertexCover;
    }

    @PostMapping("/vertexcover/random")
    public ResponseEntity<AnimationResponse> randomVertexCover(@RequestBody AnimationRequest request) {
        return ResponseEntity.ok(randomVertexCover.solve(request.graph(), request.randomSeed()));
    }

    @PostMapping("/vertexcover/optimal")
    public ResponseEntity<AnimationResponse> optimalVertexCover(@RequestBody AnimationRequest request) {
        return ResponseEntity.ok(optimalVertexCover.solve(request.graph()));
    }

    @PostMapping("/vertexcover/heuristic")
    public ResponseEntity<AnimationResponse> heuristicVertexCover(@RequestBody AnimationRequest request) {
        return ResponseEntity.ok(maxDegreeVertexCover.solve(request.graph(), request.randomSeed()));
    }
}
