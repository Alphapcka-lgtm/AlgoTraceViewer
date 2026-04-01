import {SVGInput} from "./SVGInput.tsx";
import {SVGOutput} from "./SVGOutput.tsx";
import {useState} from "react";
import type {Graph} from "./Nodes.tsx";

function App() {
  const [modeState, setModeState] = useState("input");
  const [outputState, setOutputState] = useState<Graph>({nodes: [], edges: []});

  const submitInput = (graph: Graph) => {
    fetch("http://localhost:8080/test", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(graph),
    }).then((response) => response.json())
      .then((json) => {
        setOutputState(json as Graph);
        setModeState("output");
      });
  }

  const changeInput = () => {
    setModeState("input");
  }

  return (
      <>
        <SVGInput submit={submitInput} mode={modeState} />
        <SVGOutput changeInput={changeInput} mode={modeState} output={outputState} />
      </>
    )
}

export default App
