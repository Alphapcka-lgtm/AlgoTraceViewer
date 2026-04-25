package com.example.demo;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sweepline")
@CrossOrigin(origins = "http://localhost:5173")
public class SLineController {


    @PostMapping("/SVGInputPoints")
    public List<Point> pointsFromSVGInput(@RequestBody List<Point> points) {
        for(Point point : points) {
            System.out.println(point);
        }
        return points;
    }



}
