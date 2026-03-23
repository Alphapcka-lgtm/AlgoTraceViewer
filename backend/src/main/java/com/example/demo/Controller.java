package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.POST, RequestMethod.OPTIONS}
)
public class Controller {

    @PostMapping("/test")
    public ResponseEntity<Graph> sayHello(@RequestBody Graph graph) {
        return ResponseEntity.ok(graph);
    }
}
