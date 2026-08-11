package com.example.demo.closestPair;
// der candidate wird immer mit den current point verglichen
//benötigt current point nicht, weil der schon in currentPoint im DTO drin ist
public record CandidateComparison(Point candidate, double distance) { }
