package com.example.demo.vertexCover;

import com.example.demo.model.Graph;
import com.example.demo.model.Node;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class OptimalVertexCover {

    public AnimationResponse solve(AnimationRequest request) {
        final long optimalSubset;
        Map<String, List<String>> incidenceMap = request.graph().getNodes().stream().collect(Collectors.toMap(Node::id, (node) -> new ArrayList<>()));
        request.graph().getEdges().forEach(edge -> {
            incidenceMap.get(edge.fromId()).add(edge.id());
            incidenceMap.get(edge.toId()).add(edge.id());
        });

        long k = Math.ceilDiv(request.graph().getEdges().size(), request.graph().getNodes().size());
        while(k < request.graph().getNodes().size()) {

            Iterator<Long> it = getSubsetIterator(request.graph().getNodes().size(), k);

            while (it.hasNext()) {

                long subset = it.next();
                HashSet<String> covered = new HashSet<>();

                IntStream.range(0, request.graph().getNodes().size()).forEach(index -> {
                    if (((1L << index) & subset) != 0) {
                        covered.addAll(incidenceMap.get(request.graph().getNodes().get(index).id()));
                    }
                });

                if(covered.size() == request.graph().getEdges().size()) {
                    optimalSubset =  subset;

                    return AnimationResponse.builder()
                            .initialState(
                                    new Graph(IntStream.range(0, request.graph().getNodes().size())
                                            .filter(index -> ((1L << index) & optimalSubset) != 0)
                                            .mapToObj(request.graph().getNodes()::get).toList(), List.of()))
                            .intermediateStates(List.of())
                            .build();
                }
            }

            k++;
        }
        throw new IllegalStateException();
    }

    private Iterator<Long> getSubsetIterator(long n, long k){
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
