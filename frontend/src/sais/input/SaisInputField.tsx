import type {SaisInputFieldProps} from "../shared/Types.tsx";

export function SaisInputField(props: SaisInputFieldProps) {
    const isEmpty = props.value.trim() === "";
    const className = isEmpty ? "sais-input-cell sais-input-cell-empty" : "sais-input-cell";

    return (
        <div className={className} title={"Enter a value"}>
            <input
                value={props.value}
                placeholder={"..."}
                onChange={(event) =>
                    props.onUpdateValue(event.currentTarget.value)
                }
            />
        </div>
    );
}