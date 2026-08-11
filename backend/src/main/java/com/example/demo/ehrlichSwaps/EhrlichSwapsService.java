package com.example.demo.ehrlichSwaps;

import dto.EhrlichSwapStepDTO;
import lombok.Getter;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.IntStream;

@Getter
@Service
public class EhrlichSwapsService {

    public List<EhrlichSwapStepDTO> ehrlichSwaps(List<String> inputValues) {
        List<EhrlichSwapStepDTO> steps = new ArrayList<>();

        if (inputValues == null || inputValues.isEmpty()) throw new IllegalArgumentException("Input must not be empty");

        final int size = inputValues.size();

        String[] a = inputValues.toArray(new String[0]);
        int[] b = IntStream.range(0, size).toArray();
        int[] c = new int[size]; //control table ... ist k generator ... wird nicht dargestellt

        while (true) {
            int k = calcNextK(c, size);

            if (k == size) {
                steps.add(new EhrlichSwapStepDTO(
                        "Done. All permutations were generated.",
                        toList(a),
                        toList(a),
                        toList(b),
                        toList(b),
                        k,
                        -1,
                        "",
                        "")
                );
                break;
            }

            List<String> valuesBefore = toList(a);
            List<Integer> bBefore = toList(b);

            c[k - 1] += 1;

            int swapIndex = b[k];
            String leftValue = a[0];
            String rightValue = a[swapIndex];

            swap(a, 0, swapIndex);

            int leftIndex = 1; //left index des zu drehenden Bereichs
            int rightIndex = k - 1; //right index des zu drehenden Bereichs
            while (leftIndex < rightIndex) {
                swap(b, leftIndex, rightIndex);
                leftIndex++;
                rightIndex--;
            }


            //step aufzeichnen: bk und k -> in a wird 0 mit bk getauscht
            // und in b wird das subarray b[1..k-1] gedreht

            steps.add(new EhrlichSwapStepDTO(
                    "Swap a[0] = " + leftValue + " with a[" + swapIndex + "] = " + rightValue,
                    valuesBefore,
                    toList(a),
                    bBefore,
                    toList(b),
                    k,
                    swapIndex,
                    leftValue,
                    rightValue
            ));

        }
        return steps;
    }

    public static int calcNextK(int[] c, int SIZE){
        int k=1;
        while (k < SIZE && k == c[k - 1]) {
            c[k - 1] = 0;
            k++;
        }
        return k;
    }

    private static List<String> toList(String[] array) {
        return Arrays.asList(array.clone());
    }

    private static List<Integer> toList(int[] array) {
        return Arrays.stream(array).boxed().toList();
    }

    public static void swap(String[] array, int i, int j) {
        String temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    public static void swap(int[] array, int i, int j) {
        int temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}