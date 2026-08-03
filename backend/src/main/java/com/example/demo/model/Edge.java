package com.example.demo.model;

public record Edge (String fromId, String toId, String id, String label) implements Identifiable {}
