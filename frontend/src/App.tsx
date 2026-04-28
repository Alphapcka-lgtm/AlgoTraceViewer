import { compressAndEncode, decodeAndDecompress } from "./shared/Utils.tsx";
import { SVGOutput } from "./output/SVGOutput.tsx";
import { SVGInput } from "./input/SVGInput.tsx";
import { useState } from "react";

import type { AnimationResponse, ExportImport, AnimationRequest } from "./shared/Types.tsx";

function App() {
    const [mode, setMode] = useState<"Input" | "Output">("Input");
    const [input, setInput] = useState<AnimationRequest>({graph: {nodes: [], edges: []}, densityFactor: 0.2, randomSeed: 0, timestamp: 1});
    const [output, setOutput] = useState<AnimationResponse>({initialState: {nodes: [], edges: []}, intermediateStates: [], randomSeed: 0, timestamp: 0});
    const [progress, setProgress] = useState<number>(0);

    const svgHeight = 500;

    const fetchAnimationAndSetMode = async (input: AnimationRequest) => {
        return fetch("http://localhost:8080/vertexcover/random", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(input),
        })
            .then((response) => response.json())
            .then((json) => {
                const output = json as AnimationResponse;
                setInput({...input, randomSeed: output.randomSeed});
                setOutput(output);
            });
    };

    const submitInput = () => {
        if(input.timestamp > output.timestamp) {
            fetchAnimationAndSetMode(input)
                .then(() => {
                    setProgress(0);
                    setMode("Output");
                });
        } else {
            setMode("Output");
        }
    };

    const exportAnimationState = () => {
        compressAndEncode(JSON.stringify({
            input: input,
            initialProgress: progress,
        }))
            .then((ex) => {
                // navigator.clipboard.writeText(ex);
                const el = document.getElementById("exportImport") as HTMLInputElement;
                el.value = ex;
            });
    };

    const importAnimationState = () => {
        const el = document.getElementById("exportImport") as HTMLInputElement;
        decodeAndDecompress(el.value)
            .then((im) => {
                const state = JSON.parse(im) as ExportImport;
                fetchAnimationAndSetMode(state.input)
                    .then(() => {
                        setProgress(state.initialProgress);
                    });
            });
    };

  return (
      <div style={ { display: "flex", flexDirection: "column", gap: 3, padding: 3 } } >
          <div style={ { display: "flex", gap: 3 } } >
              { mode === "Output" ? <button onClick={ () => setMode("Input") } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Change Input</button> : <></>}
              <p style={ { flex: 3, border: "2px solid black", borderRadius: "30px" } } >{ mode }</p>
              { mode === "Input" ? <button onClick={ submitInput } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Submit</button> : <></> }
          </div>
          <SVGInput setInput={ setInput } input={ input } mode={ mode } height={ svgHeight } />
          <SVGOutput setProgress={ setProgress } progress={ progress } mode={ mode } output={ output } height={ svgHeight } />
          <div style={ { display: "flex", gap: 3 } } >
              <button onClick={ exportAnimationState } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Export</button>
              <input id={"exportImport"} style={ { flex: 3, border: "2px solid black", borderRadius: "30px" } } />
              <button onClick={ importAnimationState } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Import</button>
          </div>
      </div>
    )
}

export default App;