package com.example.demo.presets;

import com.example.demo.model.Preset;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

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

    //um alle presets für den alg zu bekommen
    @GetMapping("/{algorithm}")
    public List<Preset> getPresets(@PathVariable String algorithm) {
        return service.getPresets(algorithm);
    }

    //um presets zu speichern
    @PostMapping("/{algorithm}")
    public List<Preset> addPreset(@PathVariable String algorithm, @RequestBody Preset preset) throws IOException {
        return service.add(algorithm, preset);
    }
}
