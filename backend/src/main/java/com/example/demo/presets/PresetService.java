package com.example.demo.presets;

import com.example.demo.vertexCover.AnimationRequest;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Service
public class PresetService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path file = Paths.get("data/vertexCoverPresets.json");

    public Map<String, AnimationRequest> readAll() {
        if (!Files.exists(file)) {
            return new HashMap<>();
        }

        return objectMapper.readValue(file.toFile(), new TypeReference<>() {});
    }

    public void writeAll(Map<String, AnimationRequest> presets) throws IOException {
        Files.createDirectories(file.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), presets);
    }

    public AnimationRequest add(AnimationRequest request) throws IOException {
        Map<String, AnimationRequest> presets = readAll();
        presets.put(request.preset(), request);
        writeAll(presets);
        return request;
    }
}
