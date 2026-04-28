import {SVGInput} from "./SVGInput.tsx";
import {SVGOutput} from "./SVGOutput.tsx";
import {useState} from "react";
import type {AnimationResponse, ExportImport, AnimationRequest} from "./Types.tsx";
import {compressAndEncode, decodeAndDecompress} from "./Utils.tsx";

function App() {
    const [modeState, setModeState] = useState<"Input" | "Output">("Input");
    const [inputState, setInputState] = useState<AnimationRequest>({graph: {nodes: [], edges: []}, densityFactor: 0.2, randomSeed: 0, timestamp: 1});
    const [outputState, setOutputState] = useState<AnimationResponse>({initialState: {nodes: [], edges: []}, intermediateStates: [], randomSeed: 0, timestamp: 0});
    const [currentProgressState, setCurrentProgressState] = useState<number>(0);

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
                setInputState({...input, randomSeed: output.randomSeed});
                setOutputState(output);
            });
    };

    const submitInput = () => {
        if(inputState.timestamp > outputState.timestamp) {
            fetchAnimationAndSetMode(inputState)
                .then(() => {
                    setCurrentProgressState(0);
                    setModeState("Output");
                });
        } else {
            setModeState("Output");
        }
    };

    const exportAnimationState = () => {
        compressAndEncode(JSON.stringify({
            input: inputState,
            initialProgress: currentProgressState,
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
                        setCurrentProgressState(state.initialProgress);
                    });
            });
    };

  return (
      <div style={ { display: "flex", flexDirection: "column", gap: 3, padding: 3 } } >
          <div style={ { display: "flex", gap: 3 } } >
              { modeState === "Output" ? <button onClick={ () => setModeState("Input") } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Change Input</button> : <></>}
              <p style={ { flex: 3, border: "2px solid black", borderRadius: "30px" } } >{ modeState }</p>
              { modeState === "Input" ? <button onClick={ () => submitInput() } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Submit</button> : <></> }
          </div>
          <SVGInput height={ svgHeight } input={ inputState } setInput={ setInputState } mode={ modeState } />
          <SVGOutput height={ svgHeight } output={ outputState } currentProgress={ currentProgressState } setCurrentProgress={ setCurrentProgressState } mode={ modeState } />
          <div style={ { display: "flex", gap: 3 } } >
              <button onClick={ () => exportAnimationState() } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Export</button>
              <input id={"exportImport"} style={ { flex: 3, border: "2px solid black", borderRadius: "30px" } } />
              <button onClick={ () => importAnimationState() } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Import</button>
          </div>
      </div>
    )
}

export default App