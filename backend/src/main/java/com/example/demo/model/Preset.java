package com.example.demo.model;

import com.example.demo.ClosestPair.ClosestPairRequest;
import com.example.demo.EhrlichSwapsAlgorithm.EhrlichSwapsRequest;
import com.example.demo.vertexCover.VertexCoverRequest;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.Value;

@Value
@Builder
@RequiredArgsConstructor
public class Preset {

    @JsonTypeInfo(
            use = JsonTypeInfo.Id.NAME,
            include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
            property = "algorithm"
    )
    @JsonSubTypes({
            @JsonSubTypes.Type(
                    value = ClosestPairRequest.class,
                    name = "closestPair"
            ),
            @JsonSubTypes.Type(
                    value = VertexCoverRequest.class,
                    name = "vertexCover"
            ),
            @JsonSubTypes.Type(
                    value = EhrlichSwapsRequest.class,
                    name = "ehrlichSwaps"
            )
    })
    AnimationRequest request;

    String algorithm;
    String name;
}
