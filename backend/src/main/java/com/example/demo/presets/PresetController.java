package com.example.demo.presets;

import com.example.demo.vertexCover.AnimationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.POST, RequestMethod.GET, RequestMethod.OPTIONS}
)
@RequestMapping("/api/presets")
public class PresetController {

    private final PresetService service;

    @Autowired
    public PresetController(PresetService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, AnimationRequest> getItems() throws IOException {
        return service.readAll();
    }

    @PostMapping
    public AnimationRequest addItem(@RequestBody AnimationRequest request) throws IOException {
        return service.add(request);
    }
}
