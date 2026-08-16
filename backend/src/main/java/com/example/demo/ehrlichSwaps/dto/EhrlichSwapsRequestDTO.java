package com.example.demo.ehrlichSwaps.dto;

import com.example.demo.ehrlichSwaps.SwapInputField;
import com.example.demo.shared.AnimationRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
@AllArgsConstructor
public class EhrlichSwapsRequestDTO implements AnimationRequest {
    List<SwapInputField> inputFields;
    Long timestamp;
}
