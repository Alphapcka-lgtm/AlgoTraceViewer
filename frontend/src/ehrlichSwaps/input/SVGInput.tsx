import type {SVGInputProps} from "./Types.tsx";
import {IOModeTabs} from "../../sweepLine/shared/IOModeTabs.tsx";


export function SVGInput(props: SVGInputProps) {

    return <div className="algorithm-panel">
        <IOModeTabs
            mode="input"
            onChangeInput={() => {
            }}
            onSubmit={() => props.onSubmit()}
            canSubmit={true}
        />
        <svg className="algorithm-canvas" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
        </svg>
    </div>;
}