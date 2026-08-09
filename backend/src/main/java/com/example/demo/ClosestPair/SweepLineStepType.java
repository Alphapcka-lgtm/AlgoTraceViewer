package com.example.demo.ClosestPair;

public enum SweepLineStepType {
    START, //bevor der alg startet ... kein wirklicher alg step
    INITIALIZATION,
    ADVANCE_AND_PRUNE,
    CHECK_CANDIDATES,
    COMMIT_ITERATION,
    FINISHED
}
