package com.example.demo.presets;

import com.example.demo.model.Preset;
import org.springframework.stereotype.Service;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
public class PresetService {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path file = Paths.get("data/presets.json");

    //wandelt json zurück in eine map um
    private Map<String, Map<String, Preset>> readAll() {
        if (!Files.exists(file)) return new LinkedHashMap<>(); //wenn noch keine presets.json gibt ...
        return objectMapper.readValue(file.toFile(), new TypeReference<>() {});
    }

    public void writeAll(Map<String, Map<String, Preset>> presets) throws IOException {
        Files.createDirectories(file.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), presets);
    }

    public List<Preset> getPresets(String algorithm) {
        Map<String, Preset> algorithmPresets = readAll().get(algorithm);
        if (algorithmPresets == null) return new ArrayList<>();
        return algorithmPresets.values().stream().toList();
    }

    public List<Preset> add(String algorithm, Preset preset) throws IOException {
        Map<String, Map<String, Preset>> allPresets = readAll();

        Map<String, Preset> presets = allPresets.get(algorithm);
        if (presets == null) {
            presets = new LinkedHashMap<>();
            allPresets.put(algorithm, presets);
        }

        presets.put(preset.getName(), preset);
        writeAll(allPresets);

        return presets.values().stream().toList();
    }
}
