package com.example.demo.presets;

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
    public record SavePresetRequest(String name, String exportString) {}
    private final PresetService service;

    @Autowired
    public PresetController(PresetService service) {
        this.service = service;
    }

    //um alle presets für den alg zu bekommen
    @GetMapping("/{algorithm}")
    public List<PresetService.Preset> getPresets(@PathVariable String algorithm) throws IOException {
        return service.getPresets(algorithm);
    }

    //um presets zu speichern
    @PostMapping("/{algorithm}")
    public List<PresetService.Preset> addPreset(@PathVariable String algorithm, @RequestBody SavePresetRequest request) throws IOException {
        return service.add(algorithm, request.name(), request.exportString());
    }
}
