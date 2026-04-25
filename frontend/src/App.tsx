import {SVGInput} from "./SVGInput.tsx";
import {SVGOutput} from "./SVGOutput.tsx";
import {useState} from "react";
import type {Graph, Animation} from "./Types.tsx";

function App() {
  const [modeState, setModeState] = useState("input");
  const [outputState, setOutputState] = useState<Animation>({initialState: {nodes: [], edges: []}, intermediateStates: []});

  const svgHeight = 500;

  const submitInputAndFetchAnimation = (graph: Graph) => {
      console.log(graph);
    fetch("http://localhost:8080/random", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(graph),
    }).then((response) => response.json())
      .then((json) => {
        setOutputState(json as Animation);
        setModeState("output");
        console.log(outputState)
      });
  }

  const returnToInputMask = () => {
    setModeState("input");
  }

  return (
      <>
        <SVGInput onSubmit={submitInputAndFetchAnimation} mode={modeState} height={svgHeight} />
        <SVGOutput onChangeInput={returnToInputMask} mode={modeState} output={outputState} height={svgHeight} />
      </>
    )
}

export default App