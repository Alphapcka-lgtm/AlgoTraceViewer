package com.example.demo.presets;

import com.example.demo.vertexCover.AnimationRequest;
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
    public record Preset(String name, String importString) {}
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Path file = Paths.get("data/presets.json");

    //wandelt json zurück in eine map um
    private Map<String, Map<String, String>> readAll() throws IOException {
        if (!Files.exists(file)) return new LinkedHashMap<>(); //wenn noch keine presets.json gibt ...
        return objectMapper.readValue(file.toFile(), new TypeReference<Map<String, Map<String, String>>>() {});
    }

    //map in json umwandeln und in datei schreiben
    public void writeAll(Map<String, Map<String, String>> presets) throws IOException {
        Files.createDirectories(file.getParent());
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), presets);
    }

    public List<Preset> getPresets(String algorithm) throws IOException {
        Map<String, String> algorithmPresets = readAll().get(algorithm);
        if (algorithmPresets == null) return new ArrayList<>();
        return toPresetList(algorithmPresets);
    }

    public List<Preset> add(String algorithm, String name, String exportString) throws IOException {
        Map<String, Map<String, String>> allPresets = readAll();

        Map<String, String> presets = allPresets.get(algorithm);
        if (presets == null) {
            presets = new LinkedHashMap<>();
            allPresets.put(algorithm, presets);
        }

        presets.put(name, exportString);
        writeAll(allPresets);

        return toPresetList(presets);
    }

    private List<Preset> toPresetList(Map<String, String> presets) {
        return presets.entrySet().stream()
                .map(entry -> new Preset(entry.getKey(), entry.getValue())).toList();
    }


    /*
    public AnimationRequest add(AnimationRequest request) throws IOException {
        List<AnimationRequest> presets = readAll();
        List<AnimationRequest> newPresets = new ArrayList<>(List.of(request));
        if (presets.stream().anyMatch(p -> p.getPresetName().equals(request.getPresetName()))){
            newPresets.addAll(presets.stream().filter(p -> !p.getPresetName().equals(request.getPresetName())).toList());
        } else {
            newPresets.addAll(presets);
        }
        writeAll(newPresets);
        return request;
    }

     */
}
