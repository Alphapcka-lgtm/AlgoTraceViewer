import React, {useEffect, useState} from "react";
import type {AnimationRequest} from "../shared/Types.tsx";

type PresetSelectProps = {
    input: AnimationRequest;
    setInput: (preset: AnimationRequest) => void;
};

export function PresetSelect(props: PresetSelectProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [presetName, setPresetName] = useState("");
    const [presets, setPresets] = useState<AnimationRequest[]>([]);

    const fetchPresets = async () => {
        await fetch("http://localhost:8080/api/presets")
            .then((response) => response.json()).then(setPresets);
    };

    const addPreset = async (input: AnimationRequest) => {
        await fetch("http://localhost:8080/api/presets", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(input)
        });
    };

    useEffect(() => {
        void fetchPresets();
    }, []);

    const openDialog = () => {
        setPresetName("");
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setPresetName("");
    };

    const savePreset = async () => {
        const name = presetName.trim();

        if (!name || name === "custom") {
            return;
        }

        await addPreset({...props.input, preset: name});
        await fetchPresets()
        closeDialog();
    };

    const canSave = presetName.trim().length > 0;

    return (
        <>
            <div style={presetRowStyle}>
                <select
                    className="control-select"
                    defaultValue=""
                    onChange={(event) => {
                        const preset = presets.find(
                            preset => preset.preset === event.currentTarget.value
                        );

                        if (preset) {
                            props.setInput({...preset, timestamp: Date.now()});
                        }
                    }}
                >
                    <option value="">Select preset...
                    </option>

                    {presets.map(preset => (
                        <option key={preset.preset} value={preset.preset}>
                            {preset.preset}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={openDialog}
                    className="control-button"
                    title="New preset"
                    style={plusButtonStyle}
                >
                    +
                </button>
            </div>

            {dialogOpen && (
                <div style={overlayStyle} onClick={closeDialog}>
                    <div
                        style={dialogStyle}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3 style={{marginTop: 0}}>New Preset</h3>

                        <input
                            type="text"
                            value={presetName}
                            onChange={(event) =>
                                setPresetName(event.currentTarget.value)
                            }
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
                            style={inputStyle}
                        />

                        <div style={buttonRowStyle}>
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

const presetRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4
};

const plusButtonStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    padding: 0,
    fontSize: 20,
    lineHeight: "20px"
};

const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.25)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
};

const dialogStyle: React.CSSProperties = {
    width: 520,
    maxWidth: "90vw",
    background: "white",
    border: "2px solid black",
    borderRadius: 12,
    padding: 16,
    fontFamily: "monospace"
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "monospace",
    padding: 6
};

const buttonRowStyle: React.CSSProperties = {
    display: "flex",
    gap: 8,
    marginTop: 10
};