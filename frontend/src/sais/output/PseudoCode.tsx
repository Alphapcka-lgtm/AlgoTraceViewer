import type {PseudoCodeLine} from "../../shared/Types.tsx";

export const PSEUDOCODE_SAIS: PseudoCodeLine[] = [
    {
        id: "word",
        text: "word = the input text",
        indent: 0
    },
    {
        id: "typeMap",
        text: "tm = type map with S- and L-Types and left-most S-Types marked",
        indent: 0
    },
    {
        id: "buckets",
        text: "buckets = buckets for different symbols",
        indent: 0
    },
    {
        id: "saInit",
        text: "sa = suffix array with length of word",
        indent: 0
    },
    {
        id: "lmsGuess",
        text: "for each lms-suffix in word place offset in right most empty slot of it's bucket",
        indent: 0
    },
    {
        id: "forEachInduceLGuess",
        text: "for each offset o in sa from left to right where neighbour n = o - 1 is L-Type:",
        indent: 0
    },
    {
        id: "placeInduceLGuess",
        text: "place n in the left most empty slot of it's bucket",
        indent: 1
    },
    {
        id: "forEachInduceSGuess",
        text: "for each offset o in sa from right to left where neighbour n = o - 1 is S-Type:",
        indent: 0
    },
    {
        id: "placeInduceSGuess",
        text: "place n in the right most empty slot of it's bucket",
        indent: 1
    },
    {
        id: "assignName",
        text: "assign name to each offset in sa that is a lms",
        indent: 0
    },
    {
        id: "pos",
        text: "pos = all lms-suffixes offsets from left to right in word",
        indent: 0
    },
    {
        id: "reduced",
        text: "r = reduced word with all names of lms-suffixes in order lms-suffixes occur in word",
        indent: 0
    },
    {
        id: "initRsa",
        text: "r_sa = suffix array of r",
        indent: 0
    },
    {
        id: "ifDuplicateNames",
        text: "if no duplicate names",
        indent: 0
    },
    {
        id: "ifDuplicateNamesThen",
        text: "r_sa = r",
        indent: 1
    },
    {
        id: "else",
        text: "else",
        indent: 0
    },
    {
        id: "ifDuplicateNamesElse",
        text: "r_sa = sais(r) // create suffix array or r",
        indent: 1
    },
    {
        id: "clearSa",
        text: "clear the suffix array",
        indent: 0
    },
    {
        id: "forEachFinalLms",
        text: "for each element e in r_sa from right to left where e < #pos:",
        indent: 0
    },
    {
        id: "finalLmsOffset",
        text: "offset = pos[e]",
        indent: 1
    },
    {
        id: "finalLmsPlace",
        text: "place offset in the right most empty slot of its bucket",
        indent: 1
    },
    {
        id: "forEachInduceLFinal",
        text: "for each offset o in sa from left to right where neighbour n = o - 1 is L-Type:",
        indent: 0
    },
    {
        id: "placeInduceLFinal",
        text: "place n in the left most empty slot of it's bucket",
        indent: 1
    },
    {
        id: "forEachInduceSFinal",
        text: "for each offset o in sa from right to left where neighbour n = o - 1 is S-Type:",
        indent: 0
    },
    {
        id: "placeInduceSFinal",
        text: "place n in the right most empty slot of it's bucket",
        indent: 1
    },
    {
        id: "return",
        text: "return sa",
        indent: 0
    }
]