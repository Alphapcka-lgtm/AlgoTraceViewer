package com.example.demo;

import dto.EhrlichSwapDTO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/swaps")
//@CrossOrigin(origins = "http://localhost:5173")
@CrossOrigin(origins = "http://localhost:5173")
public class SwapsController {
    public SwapsController() {}

    @PostMapping("/swap_steps")
    public EhrlichSwapDTO calculateSwapSteps(@RequestBody List<String> inputValues) {
        System.out.println(inputValues);
        return new EhrlichSwapDTO(inputValues);

    }
}
