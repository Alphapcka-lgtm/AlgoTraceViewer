package com.example.demo.sweepLine;

import com.example.demo.model.Graph;
import com.example.demo.model.Node;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SweepLine {

    public AnimationResponse solve(Graph graph) {
        if(graph.nodes().size() < 2){throw new IllegalStateException();}

        List<Node> points = graph.nodes().stream().sorted(Comparator.comparingDouble(Node::x).thenComparingDouble(Node::y)).toList();
        List<AnimationState> intermediateStates = new ArrayList<>();
        double d = 2000;

        for(int i = 1; i < points.size(); i++){
            List<Node> nodesToCompare = new ArrayList<>();
            Node closestPoint = null;
            int j = i - 1;
            while(j >= 0 && Math.abs(points.get(i).x() - points.get(j).x()) < d){
                if(Math.abs(points.get(i).y() - points.get(j).y()) < d) {
                    nodesToCompare.add(points.get(j));
                }
                j--;
            }

            while(j < nodesToCompare.size()){
                if(getDistance(nodesToCompare.get(j), points.get(i)) < d){
                    closestPoint = nodesToCompare.get(j);
                    d = getDistance(nodesToCompare.get(j), points.get(i));
                }
            }
            intermediateStates.add(AnimationState.builder().CurrentPoint(points.get(i)).ClosestPoint(closestPoint).d(d).build());
        }

        return AnimationResponse.builder().initialState(graph).intermediateStates(intermediateStates).timestamp(System.currentTimeMillis()).build();
    }

    public double getDistance(Node node1, Node node2) {
        return Math.sqrt( (node2.x() - node1.x()) * (node2.x() - node1.x()) + (node2.y() - node1.y()) * (node2.y() - node1.y()) );
    }
}
