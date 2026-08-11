import {
    ArrowLeft,
    ArrowRight,
    Gauge, Info,
    MousePointerClick,
    Move,
    MoveHorizontal,
    Pause,
    Play,
    RotateCcw,
    SkipBack,
    X
} from "lucide-react";
import "../shared/SharedStyle.css"
import {useState} from "react";


type ControlsHelpProps = {
    tab: "input" | "output";
    algorithm: alg;
};

export function ControlsHelp({tab, algorithm}: ControlsHelpProps) {
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
                    onClose={() => setIsOpen(false)}
                    tab={tab}
                    algorithm={algorithm}
                />
            )}
        </>
    );
}


type alg = "closestPair" | "suffixArray" | "vertexCover" | "ehrlichSwaps";
type ControlsHelpDialogProps = {
    onClose: () => void;
    tab: "input" | "output"
    algorithm:alg
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
                    className="controls-help-close" //control-button
                    onClick={props.onClose}
                >
                    <X size={14}/>
                </button>

                <div className="controls-help-list">

                    {props.tab === "output" && (
                        <>
                            <h2 id="controls-help-title">Controls explained </h2>
                            <OutputHelpGeneral/>
                        </>
                    )}

                    {props.tab === "input" && (
                        <>
                            <h2 id="controls-help-title">Input explained </h2>
                            <InputHelp algorithm={props.algorithm}/>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function InputHelp({algorithm}: {algorithm: alg}) {
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
                    <h3>Graph editing</h3>

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