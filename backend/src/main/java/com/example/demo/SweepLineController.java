package com.example.demo;

import com.example.demo.sweepLine.AnimationRequest;
import com.example.demo.sweepLine.AnimationResponse;
import com.example.demo.sweepLine.SweepLine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.POST, RequestMethod.OPTIONS}
)
public class SweepLineController {

    SweepLine sweepLine;

    @Autowired
    public SweepLineController(SweepLine sweepLine) {
        this.sweepLine = sweepLine;
    }

    @PostMapping("/sweepline")
    public ResponseEntity<AnimationResponse> randomVertexCover(@RequestBody AnimationRequest request) {
        return ResponseEntity.ok(sweepLine.solve(request.graph()));
    }
}
