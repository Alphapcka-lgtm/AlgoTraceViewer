import {SVGInput} from "./SVGInput.tsx";
import {SVGOutput} from "./SVGOutput.tsx";
import {useState} from "react";
import type {Graph, AnimationResponse, ExportImport} from "./Types.tsx";
import {compressAndEncode, decodeAndDecompress} from "./Utils.tsx";

function App() {
  const [mode, setMode] = useState<"input" | "output">("input");
  const [output, setOutput] = useState<AnimationResponse>({initialState: {nodes: [], edges: []}, intermediateStates: [], randomSeed: 0});

  const svgHeight = 500;

  const submitInputAndFetchAnimation = (graph: Graph) => {
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
          <div style={{display: "flex", gap: 3}}>

              <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                  compressAndEncode(JSON.stringify({
                      graph: output.initialState,
                      randomSeed: output.randomSeed,
                      initialProgress: 0,
                  })).then((ex) => {
                      navigator.clipboard.writeText(ex);
                      const el = document.getElementById("exportImport") as HTMLInputElement;
                      el.value = ex;
                  });
              }}>Export</button>

              <input id={"exportImport"} style={{flex: 3, border: "2px solid black", borderRadius: "30px"}}/>

              <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                  const el = document.getElementById("exportImport") as HTMLInputElement;
                  decodeAndDecompress(el.value).then((im) => {
                      const state = JSON.parse(im) as ExportImport;
                      output.randomSeed = state.randomSeed;
                      submitInputAndFetchAnimation(state.graph);
                  })
              }}>Import</button>

          </div>
      </>
    )
}

export default App