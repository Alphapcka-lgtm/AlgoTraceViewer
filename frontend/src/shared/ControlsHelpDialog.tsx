import {ArrowLeft, ArrowRight, Pause, Play, RotateCcw, SkipBack, X} from "lucide-react";
import "../shared/SharedStyle.css"
type ControlsHelpDialogProps = {
    onClose: () => void;
};

export function ControlsHelpDialog({onClose}: ControlsHelpDialogProps) {
    return (
        <div
            className="dialog-overlay"
            onClick={onClose}
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
                    onClick={onClose}
                >
                    <X size={14}/>
                </button>

                <h2 id="controls-help-title">Controls explained </h2>

                <div className="controls-help-list">
                    <div>
                        <ArrowLeft size={20}/> <span>Show previous step.</span>
                    </div>

                    <div>
                        <Play size={20}/>
                        <span>Starts automatic playback.</span>
                    </div>

                    <div>
                        <Pause size={20}/>
                        <span>Pauses automatic playback.</span>
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
                        <SkipBack size={20}/> <span>Resets the visualization.</span>
                    </div>

                </div>
            </div>
        </div>
    );
}