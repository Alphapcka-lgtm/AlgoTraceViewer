import type {SweepingBoxesProps} from "./Types.tsx";

export function SweepingBoxes(props: SweepingBoxesProps) {
    return props.animationSteps.map((as, i) => {
        if(i > 0) {
            return (<>
                <rect
                    key={ "a" + as.currentNode.id }
                    id={ "a" + as.currentNode.id }
                    className={"sweepingBox"}
                    x={as.currentNode.x - props.animationSteps[i-1].d}
                    y={ -10 }
                    width={ props.animationSteps[i-1].d }
                    height={ 1100 }
                    display={"none"}
                    fill="none"
                    stroke="red"
                    strokeWidth="5"
                />
                <rect
                    key={ "b" + as.currentNode.id }
                    id={ "b" + as.currentNode.id }
                    className={"sweepingBox"}
                    x={as.currentNode.x - as.d}
                    y={ -10 }
                    width={ as.d }
                    height={ 1100 }
                    display={"none"}
                    fill="none"
                    stroke="red"
                    strokeWidth="5"
                />
            </>)
        } else {
            return (
                <rect
                    key={ "a" + as.currentNode.id }
                    id={ "a" + as.currentNode.id }
                    className={"sweepingBox"}
                    x={as.currentNode.x - as.d}
                    y={ -10 }
                    width={ as.d }
                    height={ 1100 }
                    fill="none"
                    stroke="red"
                    strokeWidth="5"
                />)
        }
    })
}