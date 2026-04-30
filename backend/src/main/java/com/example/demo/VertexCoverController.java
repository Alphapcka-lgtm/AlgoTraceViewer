package com.example.demo;

import com.example.demo.vertexCover.AnimationRequest;
import com.example.demo.vertexCover.AnimationResponse;
import com.example.demo.vertexCover.OptimalVertexCover;
import com.example.demo.vertexCover.RandomVertexCover;
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

    @Autowired
    public VertexCoverController(RandomVertexCover randomVertexCover, OptimalVertexCover optimalVertexCover) {
        this.randomVertexCover = randomVertexCover;
        this.optimalVertexCover = optimalVertexCover;
    }

    @PostMapping("/vertexcover/random")
    public ResponseEntity<AnimationResponse> randomVertexCover(@RequestBody AnimationRequest request) {
        return ResponseEntity.ok(randomVertexCover.solve(request.graph(), request.randomSeed()));
    }

    @PostMapping("/vertexcover/optimal")
    public ResponseEntity<AnimationResponse> optimalVertexCover(@RequestBody AnimationRequest request) {
        return ResponseEntity.ok(optimalVertexCover.solve(request.graph()));
    }
}
