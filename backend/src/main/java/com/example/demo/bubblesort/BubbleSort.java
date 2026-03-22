package com.example.demo.bubblesort;

import com.example.demo.bubblesort.entities.BubbleSortState;

import java.util.ArrayList;
import java.util.List;

public class BubbleSort {

    public static List<BubbleSortState> sort(final List<Integer> numbers) {
        final List<BubbleSortState> states = new ArrayList<>();
        states.add(new BubbleSortState(new ArrayList<>(numbers)));
        boolean change = false;
        for (int i = numbers.size(); i >= 1; i--) {
            for (int j = 0; j < i - 1; j++) {
                int x = numbers.get(j);
                int y = numbers.get(j + 1);
                if (x > y) {
                    numbers.set(j, y);
                    numbers.set(j + 1, x);
                    change = true;
                }
            }
            if (!change) {
                // no change, exit early
                break;
            }
            change = false;
            states.add(new BubbleSortState(new ArrayList<>(numbers)));
        }

        return states;
    }
}
