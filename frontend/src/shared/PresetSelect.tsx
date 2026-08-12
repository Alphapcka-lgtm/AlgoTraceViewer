import {useEffect, useState} from "react";
import type {Preset, PresetSelectProps} from "./Types.tsx";

export function PresetSelect(props: PresetSelectProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [presetName, setPresetName] = useState("");
    const [presets, setPresets] = useState<Preset[]>([]);

    useEffect(() => {
        const loadPresets = async () => {
            const response = await fetch(`http://localhost:8080/api/presets/${props.algorithm}`);
            const data: Preset[] = await response.json();
            setPresets(data);
        };
        void loadPresets();
    }, [props.algorithm]);



    const openDialog = () => {
        setPresetName("");
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setPresetName("");
    };

    const handlePresetChange = async (selected: string) => {
        if (selected === "") {
            setPresetName("");
        } else {
            const preset = presets.find(preset => preset.name === selected);
            if (!preset) return;
            setPresetName(preset.name);
            props.setInput({...preset.request, timestamp: Date.now()});
        }
    };

    const savePreset = async () => {
        const name = presetName.trim();
        if (!name) return;
        const preset = {name, algorithm: props.algorithm, request: props.getInput()};
        const response = await fetch(
            `http://localhost:8080/api/presets/${props.algorithm}`,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(preset)
            }
        );

        if (!response.ok) throw new Error(`Could not save preset: ${response.status}`);

        const updatedPresets: Preset[] = await response.json();
        setPresets(updatedPresets);
        setPresetName(name);
        setDialogOpen(false);
    };

    const canSave = presetName.trim().length > 0;

    return (
        <>
            <div className="preset-control-group">
                <select
                    className="control-select"
                    value={presetName}
                    onChange={(event) => void handlePresetChange(event.currentTarget.value)}
                >
                    <option value="">Select preset...</option>

                    {presets.map((preset) => (
                        <option key={preset.name} value={preset.name}>
                            {preset.name}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={openDialog}
                    className="control-button preset-add-button"
                    title="New preset"
                >
                    +
                </button>
            </div>

            {dialogOpen && (
                <div className="simple-dialog-overlay" onClick={closeDialog}>
                    <div
                        className="simple-dialog-card"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3 className="simple-dialog-title">New Preset</h3>

                        <input
                            type="text"
                            value={presetName}
                            onChange={(event) => setPresetName(event.currentTarget.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && canSave) {
                                    void savePreset();
                                }

                                if (event.key === "Escape") {
                                    closeDialog();
                                }
                            }}
                            placeholder="Preset name..."
                            autoFocus
                            className="simple-dialog-input"
                        />

                        <div className="simple-dialog-actions">
                            <button
                                type="button"
                                onClick={() => void savePreset()}
                                disabled={!canSave}
                                className="control-button"
                            >
                                Save
                            </button>

                            <button
                                type="button"
                                onClick={closeDialog}
                                className="control-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
