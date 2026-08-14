import type {SwapInputField} from "../shared/Types.tsx";

export function removeExtraEmptyFieldAtEnd(fields: SwapInputField[]):SwapInputField[] {
    if (fields.length < 2) return fields;
    const lastFieldIsEmpty = fields[fields.length - 1].value.trim() === "";
    const secondLastFieldIsEmpty = fields[fields.length - 2].value.trim() === "";
    if (lastFieldIsEmpty && secondLastFieldIsEmpty) return fields.slice(0, -1);
    return fields;
}

export function extractEnteredValues(fields: SwapInputField[]):string[]{
    const values = fields.map((field) => field.value.trim());
    if (values[values.length - 1] === "") return values.slice(0, -1);
    return values;
}

export const validateValues = (values: string[]): string | undefined => {
    if (values.length < 2) return "Enter at least two values";

    const containsEmptyValue = values.some((value) => value === "");
    if (containsEmptyValue) return "Empty cells in between are not allowed";

    const uniqueValues = new Set(values);
    if (uniqueValues.size !== values.length) return "Every value must be unique";

    return undefined;
};