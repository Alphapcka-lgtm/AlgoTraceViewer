package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("/test")
    public ResponseEntity<Graph> sayHello(@RequestBody Graph graph) {
        return ResponseEntity.ok(graph);
    }

    @PostMapping("/random")
    public ResponseEntity<List<Point>> randomVertexCover(@RequestBody Graph graph) {
        return ResponseEntity.ok(randomVertexCover.solve(graph));
    }
}
