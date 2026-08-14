package com.example.demo.ehrlichSwaps;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@AllArgsConstructor
public class SwapInputField {
    int  id;
    String value;
}
