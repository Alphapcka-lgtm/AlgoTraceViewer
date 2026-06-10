package com.example.demo.sais.validatioin;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = SaisSourceValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface SaisRequestDtoConstraint {
    String message() default "Sais Source";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
