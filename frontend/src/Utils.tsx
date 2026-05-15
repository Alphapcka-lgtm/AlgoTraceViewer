import React from "react";

export function getRandomId(): string {
    return "i" + Math.floor(Date.now() * Math.random()).toString();
}

export const btnStyle: React.CSSProperties = {
    flex: 1,
    border: "2px solid black",
    borderRadius: "30px",
    fontFamily: "monospace",
    padding: "4px 10px",
    cursor: "pointer",
};


/*
0  -> A
1  -> B
...
25 -> Z
26 -> AA
27 -> AB
*/
export function getAlphabetLabel(index: number): string {
    let label = "";
    let n = index;

    while (n >= 0) {
        label = String.fromCharCode((n % 26) + 65) + label;
        n = Math.floor(n / 26) - 1;
    }

    return label;
}