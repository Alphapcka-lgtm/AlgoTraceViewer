package com.example.demo;

import com.example.demo.sais.SuffixArray;
import com.example.demo.sais.dto.SaisRequestDto;
import com.example.demo.sais.dto.SaisResponseDto;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = "*",
        methods = {RequestMethod.POST}
)
public class SaisController {

    private SuffixArray suffixArray;

    @Autowired
    public SaisController(SuffixArray suffixArray) {
        this.suffixArray = suffixArray;
    }

    @PostMapping("/sais")
    public ResponseEntity<SaisResponseDto> suffixArrayInducedSorting(@Valid @RequestBody SaisRequestDto saisRequestDto) {
        suffixArray.suffixArray(saisRequestDto.source());
        final SaisResponseDto response = suffixArray.getResponseData();
        return ResponseEntity.ok(response);
    }
}
