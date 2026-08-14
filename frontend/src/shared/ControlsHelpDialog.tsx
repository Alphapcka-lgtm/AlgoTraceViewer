import {
    ArrowLeft,
    ArrowRight,
    Gauge, Info,
    MousePointerClick,
    Move,
    MoveHorizontal,
    Pause,
    Play, Plus,
    RotateCcw,
    SkipBack, Spline,
    X
} from "lucide-react";
import "./styles/controls-help-dialog.css"
import {useState} from "react";
import type {AlgorithmType} from "./Types.tsx";


type ControlsHelpProps =
    | {
    tab: "output";
}
    | {
    tab: "input";
    algorithm: AlgorithmType;
};

export function ControlsHelp(props: ControlsHelpProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                title="Controls explained"
                onClick={() => setIsOpen(true)}
                className="control-button icon-only"
            >
                <Info size={20}/>
            </button>

            {isOpen && (
                <ControlsHelpDialog
                    {...props}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

type ControlsHelpDialogProps =
    | {
    tab: "output";
    onClose: () => void;
}
    | {
    tab: "input";
    algorithm: AlgorithmType;
    onClose: () => void;
};

export function ControlsHelpDialog(props: ControlsHelpDialogProps) {
    return (
        <div
            className="dialog-overlay"
            onClick={props.onClose}
        >
            <div
                className="dialog-card controls-help-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="controls-help-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="controls-help-close"
                    onClick={props.onClose}
                >
                    <X size={14}/>
                </button>

                <div className="controls-help-list">
                    {props.tab === "output" ? (
                        <>
                            <h2 id="controls-help-title">
                                Controls explained
                            </h2>
                            <OutputHelpGeneral/>
                        </>
                    ) : (
                        <>
                            <h2 id="controls-help-title">
                                Input explained
                            </h2>
                            <InputHelp algorithm={props.algorithm}/>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function InputHelp({algorithm}: {algorithm: AlgorithmType}) {
    switch (algorithm) {
        case "closestPair":
            return (
                <>
                    <div>
                        <MousePointerClick size={20}/>
                        <span>Click on the canvas to add a point.</span>
                    </div>

                    <div>
                        <MousePointerClick size={20}/>
                        <span>Double-click a point to remove it.</span>
                    </div>

                    <div>
                        <Move size={20}/>
                        <span>Drag a point to change its position.</span>
                    </div>
                    <div>
                        <Plus size={20}/>
                        <span>Save your input as a preset.</span>
                    </div>
                </>
            );
        case "suffixArray":
            return (
                <>

                </>
            );
        case "vertexCover":
            return (
                <>
                    <div>
                        <MousePointerClick size={20}/>
                        <span>Click on the canvas to add a Node.</span>
                    </div>
                    <div>
                        <Spline />
                        <span>Click two nodes to connect them with an Edge.</span>
                    </div>
                    <div>
                        <MousePointerClick size={20}/>
                        <span>Double-click a Node to remove it.</span>
                    </div>
                    <div>
                        <Move size={20}/>
                        <span>Drag a Node to change its position.</span>
                    </div>
                    <div>
                        <Plus size={20}/>
                        <span>Save your input as a preset.</span>
                    </div>
                </>
            );
        case "ehrlichSwaps":
            return (
                <>
                    <h3>...</h3>

                </>
            );
    }
}

function OutputHelpGeneral() {
    return (
        <>
            <div>
                <Gauge size={20}/>
                <span>Adjust playback speed.</span>
            </div>
            <div>
                <ArrowLeft size={20}/>
                <span>Show previous step.</span>
            </div>
            <div>
                <Play size={20}/>
                <span>Start automatic playback.</span>
            </div>
            <div>
                <Pause size={20}/>
                <span>Pause automatic playback.</span>
            </div>
            <div>
                <RotateCcw size={20}/>
                <span>Restart automatic playback.</span>
            </div>
            <div>
                <ArrowRight size={20}/>
                <span>Show next step.</span>
            </div>
            <div>
                <SkipBack size={20}/>
                <span>Reset the visualization.</span>
            </div>
            <div>
                <MoveHorizontal size={20}/>
                <span>Drag the timeline to move through the animation.</span>
            </div>

        </>
    );
}