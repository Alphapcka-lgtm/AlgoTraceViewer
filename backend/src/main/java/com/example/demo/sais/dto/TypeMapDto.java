package com.example.demo.sais.dto;

import com.example.demo.experiments.data.TypeMap;
import lombok.Builder;

import java.util.Objects;

@Builder
public record TypeMapDto(TypeDto[] map, int lmsCount) {

    /**
     * Creates a type map dto from a type map
     *
     * @param map the type map (never <code>null</code>)
     * @return the created type map dto
     */
    public static TypeMapDto fromTypeMap(final TypeMap map) {
        Objects.requireNonNull(map, "map is null");
        final TypeDto[] dtoMap = new TypeDto[map.length()];
        for (int i = 0; i < dtoMap.length; i++) {
            dtoMap[i] = TypeDto.builder()
                    .type(map.getType(i))
                    .isLms(map.isLmsChar(i))
                    .build();
        }
        return new TypeMapDto(dtoMap, map.getLmsCount());
    }

    @Builder
    public record TypeDto(TypeMap.Type type, boolean isLms) {
    }
}
