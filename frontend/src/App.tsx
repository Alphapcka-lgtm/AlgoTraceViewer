import {SVGInput} from "./SVGInput.tsx";
import {SVGOutput} from "./SVGOutput.tsx";
import {useState} from "react";
import type {Graph, AnimationResponse} from "./Types.tsx";

function App() {
  const [mode, setMode] = useState<"input" | "output">("input");
  const [output, setOutput] = useState<AnimationResponse>({initialState: {nodes: [], edges: []}, intermediateStates: [], randomSeed: 0});

  const svgHeight = 500;

  const submitInputAndFetchAnimation = (graph: Graph) => {
      console.log(JSON.stringify({graph: graph, randomSeed: output.randomSeed}));
    fetch("http://localhost:8080/random", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({graph: graph, randomSeed: output.randomSeed}),
    }).then((response) => response.json())
      .then((json) => {
        setOutput(json as AnimationResponse);
        setMode("output");
      });
  }

  const returnToInputMask = () => {
    setMode("input");
  }

  return (
      <>
        <SVGInput onSubmit={submitInputAndFetchAnimation} mode={mode} height={svgHeight} />
        <SVGOutput onChangeInput={returnToInputMask} mode={mode} output={output} height={svgHeight} />
      </>
    )
}

export default App