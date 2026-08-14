package com.example.demo.sais.validatioin;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class SaisSourceValidator implements ConstraintValidator<SaisRequestDtoConstraint, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            return false;
        }

        if (value.isBlank() || value.length() > 15) {
            return false;
        }

        return isLowercaseString(value);
    }

    private boolean isLowercaseString(final String value) {
        for (char c : value.toCharArray()) {
            if (!Character.isLowerCase(c)) {
                return false;
            }
        }
        return true;
    }
}
