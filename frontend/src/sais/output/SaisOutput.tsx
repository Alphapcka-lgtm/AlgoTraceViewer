import type {SaisOutputProps} from "../shared/Types.tsx";
import {useRef, useState} from "react";
import gsap from "gsap";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";

export function SaisOutput(props: SaisOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    return (
        <div className="algorithm-panel">
            <IOModeTabs mode={"output"}
                        onChangeInput={props.onChangeInput}
                        onSubmit={() => {
                        }}
                        canSubmit={false}/>

            <p>{JSON.stringify(props.output)}</p>
        </div>
    )
}