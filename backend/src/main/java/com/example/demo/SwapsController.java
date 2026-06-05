package com.example.demo;

import com.example.demo.EhrlichSwapsAlgorithm.EhrlichSwapsService;
import dto.EhrlichSwapStepDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/swaps")
@CrossOrigin(origins = "http://localhost:5173")
public class SwapsController {
    private final EhrlichSwapsService esService;

    public SwapsController(EhrlichSwapsService ess) {this.esService = ess;}

    @PostMapping("/swap_steps")
    public List<EhrlichSwapStepDTO> calculateSwapSteps(@RequestBody List<String> inputValues) {
        return esService.ehrlichSwaps(inputValues);
    }
}
