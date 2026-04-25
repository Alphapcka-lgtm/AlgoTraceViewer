package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.POST, RequestMethod.OPTIONS}
)
public class Controller {

    RandomVertexCover randomVertexCover;

    @Autowired
    public Controller(RandomVertexCover randomVertexCover) {
        this.randomVertexCover = randomVertexCover;
    }

    @PostMapping("/random")
    public ResponseEntity<AnimationResponse> randomVertexCover(@RequestBody AnimationRequest request) {
        if(request.randomSeed() == 0){
            return ResponseEntity.ok(randomVertexCover.solve(request.graph()));
        } else {
            return ResponseEntity.ok(randomVertexCover.solve(request.graph(), request.randomSeed()));
        }
    }
}
