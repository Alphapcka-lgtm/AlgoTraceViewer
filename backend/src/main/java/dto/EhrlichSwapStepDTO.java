package dto;

import java.util.List;

public record EhrlichSwapStepDTO(
        String description,
        List<String> valuesBefore,
        List<String> valuesAfter,
        List<Integer> bBefore,
        List<Integer> bAfter,
        int k,
        int swapIndex, //b[k]
        String swappedLeftValue,
        String swappedRightValue
) {}


/*export type EhrlichSwapStepDTO = {
    description: string;
    valuesBefore: string[];
    valuesAfter: string[];
    bBefore: number[];
    bAfter: number[];
    k: number;
    swapIndex: number; //b[k]
    swappedLeftValue: string;
    swappedRightValue: string;
};*/