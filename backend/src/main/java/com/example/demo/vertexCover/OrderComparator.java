package com.example.demo.vertexCover;
import com.example.demo.vertexCover.model.Identifiable;

import java.util.*;
import java.util.stream.IntStream;

public class OrderComparator implements Comparator<Identifiable> {

    private final Map<String, Integer> map = new HashMap<>();

    public OrderComparator(List<String> order) {
        IntStream.range(0, order.size()).forEach(i -> map.put(order.get(i), i));
    }

    public int compare(Identifiable o1, Identifiable o2) {
        if(o1 == null){
            return 1;
        } else if(o2 == null){
            return -1;
        } else if (!map.containsKey(o1.id())){
            return 1;
        } else if (!map.containsKey(o2.id())){
            return -1;
        } else {
            return map.get(o1.id()).compareTo(map.get(o2.id()));
        }
    }

}
