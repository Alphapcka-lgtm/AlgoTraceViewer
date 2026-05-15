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
export function getAlphabetLabel(i: number): string {
    let result:string = "";
    let current:number = i;
    while (current >= 0) {
        const rest = current % 26;
        const char = String.fromCharCode(65 + rest);
        result = char + result;
        current = Math.floor(current / 26) - 1;
    }
    return result;
}