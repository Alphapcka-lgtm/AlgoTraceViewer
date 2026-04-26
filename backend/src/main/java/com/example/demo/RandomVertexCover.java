package com.example.demo;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.LongStream;

@Service
public class RandomVertexCover {

    public AnimationResponse solve(Graph graph, Long seed) {
        List<AnimationState> intermediateStates = new ArrayList<>();

        Random randomGenerator = new Random(seed);

        List<Edge> remainingEdges = new ArrayList<>(graph.edges());

        while (!remainingEdges.isEmpty()) {
            Edge chosenEdge = remainingEdges.get(randomGenerator.nextInt(remainingEdges.size()));
            remainingEdges.remove(chosenEdge);

            List<Edge> incidentEdges = remainingEdges.stream()
                    .filter(edge ->
                            edge.fromId().equals(chosenEdge.fromId()) ||
                            edge.toId().equals(chosenEdge.fromId()) ||
                            edge.fromId().equals(chosenEdge.toId()) ||
                            edge.toId().equals(chosenEdge.toId()))
                    .toList();
            remainingEdges.removeAll(incidentEdges);

            intermediateStates.add(AnimationState.builder()
                    .chosenEdge(chosenEdge)
                    .incidentEdges(incidentEdges)
                    .chosenNodes(List.of(getNodeById(graph.nodes(), chosenEdge.fromId()), getNodeById(graph.nodes(), chosenEdge.toId())))
                    .build()
            );
        }
        return AnimationResponse.builder().initialState(graph).intermediateStates(intermediateStates).randomSeed(seed).build();
    }

    public AnimationResponse solve(Graph graph) {
        return solve(graph, System.nanoTime());
    }

    private static Node getNodeById(List<Node> nodes, String id) {
        return nodes.stream().filter(node -> node.id().equals(id)).findFirst().orElseThrow();
    }

    static void main(String[] args) {
        for (Iterator<Long> it = getSubsetIterator(7, 6); it.hasNext(); ) {
            Long l = it.next();
            System.out.println(Long.toBinaryString(l));
        }
    }

    public static Iterator<Long> getSubsetIterator(long n, long k){
        if(k == 1){
            return new Iterator<>() {
                private long x = 1L;

                @Override
                public boolean hasNext() {
                    return x < (1L << n);
                }

                public Long next() {
                    long current = x;
                    x = x << 1;
                    return current;
                }
            };
        } else {
            return new Iterator<>() {
                private Iterator<Long> i = getSubsetIterator(n-1, k-1);
                private long x = (1L << (k-1));
                private long base = i.next();

                @Override
                public boolean hasNext() {
                    return x < (1L << n) || i.hasNext();
                }

                public Long next() {
                    if(x >= (1L << n)){
                        base = i.next();
                        while((x & base) == 0){
                            x = x >> 1;
                        }
                        x = x << 1;
                    }
                    long current = x | base;
                    x = x << 1;
                    return current;
                }
            };
        }
    }
}


