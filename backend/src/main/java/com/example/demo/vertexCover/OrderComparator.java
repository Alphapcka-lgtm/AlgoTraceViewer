package com.example.demo.vertexCover;
import com.example.demo.model.Identifiable;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

public class OrderComparator {

    private final Map<String, Integer> map = new HashMap<>();

    public OrderComparator(List<String> order) {
        IntStream.range(0, order.size()).forEach(i -> map.put(order.get(i), i));
    }

    public int compare(Identifiable o1, Identifiable o2) {
        return map.get(o1.id()).compareTo(map.get(o2.id()));
    }

}
