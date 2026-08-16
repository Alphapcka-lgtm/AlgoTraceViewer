package com.example.demo.controller;

import com.example.demo.suffixArray.SAISService;
import com.example.demo.suffixArray.dto.SaisRequestDto;
import com.example.demo.suffixArray.dto.SaisResponseDto;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suffixArray")
public class SuffixArrayController {

    private SAISService saisService;

    @Autowired
    public SuffixArrayController(SAISService saisService) {
        this.saisService = saisService;
    }

    @PostMapping("/sais")
    public ResponseEntity<SaisResponseDto> suffixArrayInducedSorting(@Valid @RequestBody SaisRequestDto saisRequestDto) {
        saisService.suffixArray(saisRequestDto.source());
        final SaisResponseDto response = saisService.getResponseData();
        return ResponseEntity.ok(response);
    }
}
