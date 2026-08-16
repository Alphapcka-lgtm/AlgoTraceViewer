package com.example.demo.controller;

import com.example.demo.ehrlichSwaps.EhrlichSwapsService;
import com.example.demo.ehrlichSwaps.dto.EhrlichSwapStepDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ehrlichSwaps")
public class EhrlichSwapsController {
    private final EhrlichSwapsService ehrlichSwapsService;

    public EhrlichSwapsController(EhrlichSwapsService ehrlichSwapsRequest) {
        this.ehrlichSwapsService = ehrlichSwapsRequest;
    }

    @PostMapping("/steps")
    public List<EhrlichSwapStepDTO> calculateSwapSteps(@RequestBody List<String> inputValues) {
        return ehrlichSwapsService.ehrlichSwaps(inputValues);
    }
}
