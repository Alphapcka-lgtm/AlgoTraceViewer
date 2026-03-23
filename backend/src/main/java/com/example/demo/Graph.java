package com.example.demo;

import lombok.Data;

import java.util.List;

@Data
public class Graph {
    public final List<Point> points;
    public final List<Edge> edges;
}
