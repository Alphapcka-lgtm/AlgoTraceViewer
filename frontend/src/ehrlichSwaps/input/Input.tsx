import { IOModeTabs } from "../../shared/IOModeTabs.tsx";
import type {SwapInputProps} from "../shared/Types.tsx";
import {ControlsHelp} from "../../shared/ControlsHelpDialog.tsx";
import {PresetSelect} from "../../shared/PresetSelect.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {AlgorithmOverviewBox} from "../../shared/AlgorithmOverviewBox.tsx";


const MIN_INPUT_LENGTH = 1;
const MAX_INPUT_LENGTH = 6;

export const SwapInput = (props: SwapInputProps) => {
    return (
        <div className="algorithm-panel">
            <AlgorithmOverviewBox algoTyp={"ehrlichSwaps"}/>

            <IOModeTabs
                mode="input"
                onChangeInput={props.onChangeInput}
                onSubmit={props.onSubmit}
                canSubmit={props.canSubmit}
            />

            <div className="swap-input-fields">
                {props.fields.map((field, index) => {
                    const isEmptyLastField = index === props.fields.length - 1 && field.value.trim() === "";
                    const inputLength = Math.max(MIN_INPUT_LENGTH, Math.min(field.value.length, MAX_INPUT_LENGTH));
                    const className = isEmptyLastField ? "swap-input-cell swap-input-cell-empty" : "swap-input-cell";
                    const title = isEmptyLastField ? "Enter a value" : "double click to delete";

                    const handleDoubleClick = (): void => {
                        if (!isEmptyLastField) props.onDeleteField(field.id);
                    };

                    return (
                        <div key={field.id} className={className} title={title} onDoubleClick={handleDoubleClick}>
                            <input
                                value={field.value}
                                size={inputLength}
                                maxLength={MAX_INPUT_LENGTH}
                                placeholder={isEmptyLastField ? "..." : ""}
                                onChange={(event) => {
                                    props.onUpdateValue(field.id, event.currentTarget.value);
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {props.validationError !== null && (
                <p className="swap-input-error" role="alert">{props.validationError}</p>
            )}


            <div className="control-row">
                <ControlsHelp tab={"input"} algorithm={"closestPair"}/>

                <PresetSelect algorithm={"ehrlichSwaps"} setInput={props.onPresetChange} getInput={() => {
                    console.log(props.fields)
                    return {inputFields: props.fields, timestamp: Date.now()}
                }}/>

                <button
                    className="control-button"
                    onClick={() => {
                        props.onReset();
                    }}
                >
                    Reset
                </button>

                <ImportExportDialog
                    onImport={props.onImport}
                    createExportString={props.createExportString}
                />
            </div>
        </div>
    );
};