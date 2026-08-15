import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import type {SaisInputProps, SaisRequestDto} from "../shared/Types.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {SaisInputField} from "./SaisInputField.tsx";
import {PresetSelect} from "../../shared/PresetSelect.tsx";
import type {AnimationRequest} from "../../shared/Types.tsx";
import {AlgorithmOverviewBox} from "../../shared/AlgorithmOverviewBox.tsx";

export function SaisInput(props: SaisInputProps) {
    const setPreset = (input: AnimationRequest) => {
        const myInput: SaisRequestDto = input as SaisRequestDto;
        props.setInput({...myInput, timestamp: Date.now()});
    }

    const getInput = (): SaisRequestDto => {
        return {source: props.value, timestamp: Date.now()};
    }

    return (
        <div className="algorithm-panel">
            <AlgorithmOverviewBox algoTyp={"suffixArray"}/>
            {/* input/output tabs header */}
            <IOModeTabs
                mode={"input"}
                onChangeInput={props.onChangeInput}
                onSubmit={props.onSubmit}
                canSubmit={props.canSubmit}
            />
            <SaisInputField value={props.value} onUpdateValue={props.onUpdateValue}/>
            {/* input control buttons */}
            <div className="control-row">
                <PresetSelect algorithm={"sais"} setInput={setPreset} getInput={getInput}/>
                <ImportExportDialog onImport={props.onImport} createExportString={props.createExportString}/>
            </div>
        </div>
    )
}