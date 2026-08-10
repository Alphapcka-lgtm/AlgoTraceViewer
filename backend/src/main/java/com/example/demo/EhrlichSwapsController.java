package com.example.demo;

import com.example.demo.EhrlichSwapsAlgorithm.EhrlichSwapsRequest;
import com.example.demo.EhrlichSwapsAlgorithm.EhrlichSwapsService;
import dto.EhrlichSwapStepDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/swaps")
@CrossOrigin(origins = "http://localhost:5173")
public class EhrlichSwapsController {
    private final EhrlichSwapsService ehrlichSwapsService;

    public EhrlichSwapsController(EhrlichSwapsService ehrlichSwapsRequest) {
        this.ehrlichSwapsService = ehrlichSwapsRequest;
    }

    @PostMapping("/swap_steps")
    public List<EhrlichSwapStepDTO> calculateSwapSteps(@RequestBody EhrlichSwapsRequest ehrlichSwapsRequest) {
        return ehrlichSwapsService.ehrlichSwaps(ehrlichSwapsRequest);
    }
}
