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
@RequestMapping("/api/vertexCover")
public class VertexCoverController {

    RandomVertexCover randomVertexCover;
    OptimalVertexCover optimalVertexCover;
    MaxDegreeVertexCover maxDegreeVertexCover;
    StaticListVertexCover staticListVertexCover;

    @Autowired
    public VertexCoverController(
            RandomVertexCover randomVertexCover,
            OptimalVertexCover optimalVertexCover,
            MaxDegreeVertexCover maxDegreeVertexCover,
            StaticListVertexCover staticListVertexCover
    ) {
        this.randomVertexCover = randomVertexCover;
        this.optimalVertexCover = optimalVertexCover;
        this.maxDegreeVertexCover = maxDegreeVertexCover;
        this.staticListVertexCover = staticListVertexCover;
    }

    @PostMapping("/random")
    public ResponseEntity<AnimationResponse> randomVertexCover(@RequestBody VertexCoverRequest request) {
        return ResponseEntity.ok(randomVertexCover.solve(request));
    }

    @PostMapping("/optimal")
    public ResponseEntity<AnimationResponse> optimalVertexCover(@RequestBody VertexCoverRequest request) {
        return ResponseEntity.ok(optimalVertexCover.solve(request));
    }

    @PostMapping("/maxDegree")
    public ResponseEntity<AnimationResponse> maxDegreeVertexCover(@RequestBody VertexCoverRequest request) {
        return ResponseEntity.ok(maxDegreeVertexCover.solve(request));
    }

    @PostMapping("/staticList")
    public ResponseEntity<AnimationResponse> staticListVertexCover(@RequestBody VertexCoverRequest request) {
        return ResponseEntity.ok(staticListVertexCover.solve(request));
    }
}
