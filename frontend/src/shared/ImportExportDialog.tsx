import {useState} from "react";

type ImportExportDialogProps = {
    onImport: (encoded: string) => void;
    createExportString: () => string;
};

export function ImportExportDialog(props: ImportExportDialogProps) {
    const [dialogMode, setDialogMode] = useState<"import" | "export" | null>(null);
    const [importValue, setImportValue] = useState("");
    const [exportValue, setExportValue] = useState("");
    const [copied, setCopied] = useState(false);

    const openImportDialog = () => {
        setCopied(false);
        setImportValue("");
        setDialogMode("import");
    };

    const openExportDialog = () => {
        setCopied(false);
        setExportValue(props.createExportString());
        setDialogMode("export");
    };

    const closeDialog = () => {setDialogMode(null);};

    const copyExport = async () => {
        if (!exportValue) return;
        await navigator.clipboard.writeText(exportValue);
        setCopied(true);
        setTimeout(() => {
            closeDialog();
        }, 500);
    };

    const importState = () => {
        const trimmed = importValue.trim();
        if (!trimmed) return;
        props.onImport(trimmed);
        setImportValue("");
        closeDialog();
    };

    const canImport = importValue.trim().length > 0;
    const dialogTitle = dialogMode === "import" ? "Import" : dialogMode === "export" ? "Export" : "";

    let dialogContent = null;
    if (dialogMode === "import") {
        dialogContent = (
            <ImportDialog
                importValue={importValue}
                setImportValue={setImportValue}
                importState={importState}
                closeDialog={closeDialog}
                canImport={canImport}
            />
        );
    } else if (dialogMode === "export") {
        dialogContent = (
            <ExportDialog
                exportValue={exportValue}
                copyExport={copyExport}
                closeDialog={closeDialog}
                copied={copied}
            />
        );
    }

    return (
        <>
            <button type="button" onClick={openImportDialog} className="control-button">Import</button>
            <button type="button" onClick={openExportDialog} className="control-button">Export</button>
            {dialogMode && (
                <div className="simple-dialog-overlay" onClick={closeDialog}>
                    <div className="simple-dialog-card"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3 className="simple-dialog-title">{dialogTitle}</h3>
                        {dialogContent}
                    </div>
                </div>
            )}
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
              className="simple-dialog-textarea"
            />

            <div className="simple-dialog-actions">
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
            <textarea value={props.exportValue} readOnly rows={5} className="simple-dialog-textarea"/>
            <div className="simple-dialog-actions">
                <button type="button" onClick={props.copyExport} disabled={!props.exportValue} className="simple-dialog-button">
                    {props.copied ? "Copied!" : "Copy"}
                </button>

                <button type="button" onClick={props.closeDialog} className="simple-dialog-button">
                    Close
                </button>
            </div>
        </>
    );
}
