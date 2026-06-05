import React, {useState} from "react";
import {btnStyle} from "./Utils.tsx";

type ImportExportDialogProps = {
    mode: "input" | "output";
    onImport: (encoded: string) => void;
    createExportString: () => string;
};

//Input: Import möglich, Export nicht möglich
//Output: Export möglich, Import nicht möglich

export function ImportExportDialog(props: ImportExportDialogProps) {
    const [open, setOpen] = useState(false);
    const [importValue, setImportValue] = useState("");
    const [exportValue, setExportValue] = useState("");
    const [copied, setCopied] = useState(false);

    const openDialog = () => {
        setCopied(false);

        if (props.mode === "output") {
            const value = props.createExportString();
            setExportValue(value);
        }
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
    };

    const copyExport = async () => {
        if (!exportValue) return;
        await navigator.clipboard.writeText(exportValue);
        setCopied(true);
    };

    const importState = () => {
        const trimmed = importValue.trim();
        if (!trimmed || !props.onImport) return;
        props.onImport(trimmed);
        setImportValue("");
        setOpen(false);
    };

    let dialog = null;

    if (open) {
        dialog = (
            <div style={overlayStyle} onClick={closeDialog}>
                <div style={dialogStyle} onClick={(event) => event.stopPropagation()}>
                    <h3 style={{marginTop: 0}}>
                        {props.mode === "input" ? "Import" : "Export"}
                    </h3>

                    {props.mode === "input" ? (
                        <ImportDialog
                            importValue={importValue}
                            setImportValue={setImportValue}
                            importState={importState}
                            closeDialog={closeDialog}
                            canImport={!!importValue.trim() && !!props.onImport}
                        />
                    ) : (
                        <ExportDialog
                            exportValue={exportValue}
                            copyExport={copyExport}
                            closeDialog={closeDialog}
                            copied={copied}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <button type="button" onClick={openDialog} className="control-button" style={{marginTop: "6px"}}>
                {props.mode === "input" ? "Import" : "Export"}
            </button>

            {dialog}
        </>
    );
}

type ImportDialogProps = {
    importValue: string;
    setImportValue: (value: string) => void;
    importState: () => void;
    closeDialog: () => void;
    canImport: boolean;
};

function ImportDialog(props: ImportDialogProps) {
    return (
        <>
            <textarea
              value={props.importValue}
              onChange={(event) => props.setImportValue(event.currentTarget.value)}
              placeholder="Paste export string here..."
              rows={3}
              style={textareaStyle}
            />

            <div style={buttonRowStyle}>
                <button type="button" onClick={props.importState} disabled={!props.canImport} className="control-button">
                    Import
                </button>

                <button type="button" onClick={props.closeDialog} className="control-button">
                    Cancel
                </button>
            </div>
        </>
    );
}

type ExportDialogProps = { exportValue: string; copyExport: () => void; closeDialog: () => void; copied: boolean };

function ExportDialog(props: ExportDialogProps) {
    return (
        <>
            <textarea value={props.exportValue} readOnly rows={5} style={textareaStyle}/>
            <div style={buttonRowStyle}>
                <button type="button" onClick={props.copyExport} disabled={!props.exportValue} style={btnStyle}>
                    {props.copied ? "Copied!" : "Copy"}
                </button>

                <button type="button" onClick={props.closeDialog} style={btnStyle}>
                    Close
                </button>
            </div>
        </>
    );
}

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
const textareaStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "monospace",
    resize: "vertical"
};
const buttonRowStyle: React.CSSProperties = {display: "flex", gap: 8, marginTop: 10};