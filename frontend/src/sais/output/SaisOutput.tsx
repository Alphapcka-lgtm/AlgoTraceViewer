import type {SaisOutputProps, SaisResponseDto, Step, SvgCellData} from "../shared/Types.tsx";
import {useMemo, useRef, useState} from "react";
import gsap from "gsap";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import {BucketsRow} from "../shared/BucketsRow.tsx";
import {TypesRow} from "../shared/TypesRow.tsx";
import {TextRow} from "../shared/TextRow.tsx";
import {IndexRow} from "../shared/IndexRow.tsx";
import {createStepLabels, getStepIndexFromTimeline} from "../../shared/Utils.tsx";
import {useGSAP} from "@gsap/react";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import {OutputControls} from "../../shared/OutputControls.tsx";

function buildSteps(data: SaisResponseDto): Step[] {
    const steps: Step[] = [];

    steps.push({
        phaseLabel: "Setup",
        title: "Classify S-type / L-type positions",
        description: "Each position is S-type if its suffix is lexicographically smaller than the next position's suffix, or L-type if larger. Positions marked LMS (Left-Most S-type) are L→S transitions and anchor the whole algorithm.",
        kind: "intro",
    });

    if (data.guessLmsSteps.length > 0) {
        data.guessLmsSteps.forEach((_, i) => {
            steps.push({
                phaseLabel: "Phase 1",
                title: i === 0 ? "Roughly place LMS suffixes (left-to-right scan)" : "Continue rough LMS placement",
                description:
                    "Scanning left to right, each LMS position is dropped at the current tail of its character's bucket. This rough pass just seeds the next two induction passes — order isn't correct yet.",
                kind: "guess-lms-frame",
                frameIndex: i,
            });
        });
    }

    if (data.guessInduceL.length > 0) {
        data.guessInduceL.forEach((_, i) => {
            steps.push({
                phaseLabel: "Phase 1",
                title: i === 0 ? "Induce L-type suffixes (left-to-right)" : "Continue inducing L-types",
                description:
                    "Scanning the array left to right: whenecer a slot holds position p and p-1 is L-type, place p-1 at the current head of its bucket.",
                kind: "guess-induce-l-frame",
                frameIndex: i,
            });
        });
    }

    if (data.guessInduceS.length > 0) {
        data.guessInduceS.forEach((_, i) => {
            steps.push({
                phaseLabel: "Phase 1",
                title: i === 0 ? "Induce S-type suffixes (right-to-left) — LMS now sorted" : "Continue inducing S-types",
                description:
                    "Scanning right to left: whenever a slot holds position p and p-1 is S-type, place p-1 at the current tail of its bucket. After this pass, LMS suffixes sit in correct realtive order.",
                kind: "guess-induce-s-frame",
                frameIndex: i,
            });
        });
    }

    steps.push({
        phaseLabel: "Phase 2",
        title: "Name each LMS substring",
        description:
            "Using the sorted LMS order just found, compare each LMS substring (from one LMS position to the next, inclusive) to its predecessor: identical → same name, different → next name.",
        kind: "naming",
    });

    steps.push({
        phaseLabel: "Phase 2",
        title: "Reduced string & recursion check",
        description:
            "Write the assigend names in the order their LMS positions occur in the original string. If every name is unique, the order is already knwon. If two LMS substrings share a name, the backend recurses SA-IS in this reduced string to resolve the tie.",
        kind: "reduced",
    });

    if (data.saLmsAdded.some((v) => v !== -1)) {
        steps.push({
            phaseLabel: "Phase 3",
            title: "Place LMS suffixes in correct order (right-to-left",
            description: "Using the now-correct LMS order, scan it right to left, placing each LMS suffix at the current tail of its bucket.",
            kind: "place-lms-frame",
        });
    }

    data.saInduceL.forEach((_, i) => {
        steps.push({
            phaseLabel: "Phase 3",
            title: i === 0 ? "Final induce L-types (left-to-right)" : "Continue final L-type induction",
            description: "Same induction rule as before, now seededed with the correctly ordered LMS suffixes",
            kind: "sa-induce-l-frame",
            frameIndex: i,
        });
    });

    data.saInduceS.forEach((_, i) => {
        steps.push({
            phaseLabel: "Phase 3",
            title: i === 0 ? "Final induce S-types — suffix array complete" : "Continue final S-type induction",
            description: i === 0 ? "Final right-to-left induction pass. The suffix array is now fully sorted." : "Continuing the final right-to-left-pass.",
            kind: "sa-induce-s-frame",
            frameIndex: i,
        });
    });

    steps.push({
        phaseLabel: "Result",
        title: "Final suffix array",
        description: "Every suffix of the input, listed in lexicopraphic order.",
        kind: "final",
    });

    return steps;
}

// Design tokens
const COLORS = {
    bg: "#15161A",
    panel: "#1C1E24",
    panelBorder: "#2C2F38",
    textPrimary: "#EDEDEF",
    textSecondary: "#9A9CA6",
    textMuted: "#6B6D78",
    amber: "#E8A33D",
    amberBg: "rgba(232,163,61,0.12)",
    violet: "#9C8CF0",
    violetBg: "rgba(156,140,240,0.14)",
    teal: "#5FC9B8",
    tealBg: "rgba(95,201,184,0.12)",
    rose: "#E8806B",
    roseBg: "rgba(232,128,107,0.12)",
    cellBg: "#23252C",
    cellEmpty: "#1A1B20",
};

function typeColor(t: string) {
    return t === "L" ? COLORS.teal : COLORS.rose;
}

function typeBg(t: string) {
    return t === "L" ? COLORS.tealBg : COLORS.roseBg;
}


// SVG primitives
const CELL_W = 42;
const CELL_H = 36;
const CELL_GAP = 6;
const SUB_H = 16; // space reserved below each cell for its sub-label

/** Renders a horizontal strip of cells as one <svg>. Scrolls horizontally if it overflows. */
function CellRow({
                     cells,
                     label,
                     cellWidth = CELL_W,
                 }: {
    cells: SvgCellData[];
    label?: string;
    cellWidth?: number;
}) {
    const n = cells.length;
    const width = n * cellWidth + Math.max(0, n - 1) * CELL_GAP;
    const height = CELL_H + SUB_H;

    return (
        <div style={{marginBottom: 18}}>
            {label && (
                <div
                    style={{
                        fontSize: 11,
                        color: COLORS.textMuted,
                        fontFamily: "'Inter', sans-serif",
                        marginBottom: 6,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                    }}
                >
                    {label}
                </div>
            )}
            <div className="sais-scrollbar" style={{overflowX: "auto", paddingBottom: 4}}>
                {/*<svg*/}
                {/*    width={width}*/}
                {/*    height={height}*/}
                {/*    viewBox={`0 0 ${width} ${height}`}*/}
                {/*    role="img"*/}
                {/*    aria-label={label || "data row"}*/}
                {/*    style={{display: "block", overflow: "visible"}}*/}
                {/*>*/}
                {cells.map((c, i) => {
                    const x = i * (cellWidth + CELL_GAP);
                    const bg = c.bg ?? COLORS.cellBg;
                    const border = c.ringColor ?? c.border ?? COLORS.panelBorder;
                    const strokeW = c.ringColor ? c.ringWidth ?? 1.5 : 0.8;
                    const color = c.color ?? COLORS.textPrimary;
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={0}
                                width={cellWidth}
                                height={CELL_H}
                                rx={8}
                                fill={bg}
                                stroke={border}
                                strokeWidth={strokeW}
                            />
                            <text
                                x={x + cellWidth / 2}
                                y={CELL_H / 2}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontFamily="'JetBrains Mono', monospace"
                                fontSize={15}
                                fontWeight={c.bold ? 600 : 400}
                                fill={color}
                            >
                                {c.label}
                            </text>
                            {c.sub !== undefined && (
                                <text
                                    x={x + cellWidth / 2}
                                    y={CELL_H + 13}
                                    textAnchor="middle"
                                    fontFamily="'JetBrains Mono', monospace"
                                    fontSize={10}
                                    fill={COLORS.textMuted}
                                >
                                    {c.sub}
                                </text>
                            )}
                        </g>
                    );
                })}
                {/*</svg>*/}
            </div>
        </div>
    );
}

/** Renders the dashed bucket boundaries beneath a cell row as one <svg>. */
function BucketSvg({data}: { data: SaisResponseDto }) {
    const cellWidth = CELL_W;
    const groupH = 28;
    let x = 0;
    const groups = data.bucketSizes.map((b) => {
        const w = b.size * cellWidth + (b.size - 1) * CELL_GAP;
        const g = {x, w, c: b.c};
        x += w + CELL_GAP;
        return g;
    });
    const totalW = x - CELL_GAP;
    const totalH = groupH + 16;

    return (
        <div style={{marginBottom: 18}}>
            <div
                style={{
                    fontSize: 11,
                    color: COLORS.textMuted,
                    fontFamily: "'Inter', sans-serif",
                    marginBottom: 6,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                }}
            >
                Buckets
            </div>
            <div className="sais-scrollbar" style={{overflowX: "auto", paddingBottom: 4}}>
                <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} role="img"
                     aria-label="bucket layout" style={{display: "block", overflow: "visible"}}>
                    {groups.map((g, i) => (
                        <g key={i}>
                            <rect
                                x={g.x}
                                y={0}
                                width={g.w}
                                height={groupH}
                                rx={6}
                                fill="none"
                                stroke={COLORS.panelBorder}
                                strokeWidth={0.8}
                                strokeDasharray="3 3"
                            />
                            <text
                                x={g.x + g.w / 2}
                                y={groupH / 2}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontFamily="'JetBrains Mono', monospace"
                                fontSize={10}
                                fill={COLORS.textMuted}
                            >
                                ×{Math.round((g.w + CELL_GAP) / (cellWidth + CELL_GAP))}
                            </text>
                            <text
                                x={g.x + g.w / 2}
                                y={groupH + 13}
                                textAnchor="middle"
                                fontFamily="'JetBrains Mono', monospace"
                                fontSize={11}
                                fill={COLORS.textSecondary}
                            >
                                '{g.c}'
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}

/** Final ranked suffix list rendered as one <svg> table. */
function FinalListSvg({data}: { data: SaisResponseDto }) {
    const n = data.source.length;
    const rowH = 26;
    const width = 460;
    const height = data.sa.length * rowH + 8;
    const rankColX = 14;
    const idxColX = 50;
    const suffixColX = 86;

    return (
        <div className="sais-scrollbar" style={{overflowX: "auto"}}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img"
                 aria-label="final suffix array" style={{display: "block", overflow: "visible"}}>
                {data.sa.map((v, rank) => {
                    const isSentinel = v === n - 1;
                    const suffix = data.source.slice(v);
                    const y = rank * rowH;
                    const rowBg = rank % 2 === 0 ? COLORS.panel : "transparent";
                    return (
                        <g key={rank}>
                            <rect x={0} y={y} width={width} height={rowH} fill={rowBg} rx={6}/>
                            <text x={rankColX} y={y + rowH / 2} dominantBaseline="central"
                                  fontFamily="'JetBrains Mono', monospace" fontSize={11} fill={COLORS.textMuted}>
                                {rank}
                            </text>
                            <text
                                x={idxColX}
                                y={y + rowH / 2}
                                dominantBaseline="central"
                                fontFamily="'JetBrains Mono', monospace"
                                fontSize={12}
                                fontWeight={600}
                                fill={isSentinel ? COLORS.amber : COLORS.violet}
                            >
                                {v}
                            </text>
                            <text
                                x={suffixColX}
                                y={y + rowH / 2}
                                dominantBaseline="central"
                                fontFamily="'JetBrains Mono', monospace"
                                fontSize={14}
                                fontWeight={isSentinel ? 600 : 400}
                                fill={isSentinel ? COLORS.amber : COLORS.textPrimary}
                            >
                                {suffix}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

/** One LMS-naming comparison row rendered as a small <svg> card. */
function NamingRowSvg({
                          pos,
                          substring,
                          name,
                          isDup,
                      }: {
    pos: number;
    substring: string;
    name: number;
    isDup: boolean;
}) {
    const width = 480;
    const height = 40;
    const badgeColor = isDup ? COLORS.rose : COLORS.amber;
    const badgeBg = isDup ? COLORS.roseBg : COLORS.amberBg;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img"
             aria-label={`LMS naming for position ${pos}`} style={{display: "block", overflow: "visible"}}>
            <rect x={0} y={0} width={width} height={height} rx={8} fill={COLORS.panel} stroke={COLORS.panelBorder}
                  strokeWidth={0.8}/>
            <text x={12} y={height / 2} dominantBaseline="central" fontFamily="'JetBrains Mono', monospace"
                  fontSize={11} fill={COLORS.textMuted}>
                pos {pos}
            </text>
            <rect x={64} y={8} width={width - 64 - 110} height={height - 16} rx={5} fill={COLORS.cellBg}/>
            <text
                x={64 + 10}
                y={height / 2}
                dominantBaseline="central"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={13}
                fill={COLORS.textPrimary}
            >
                "{substring}"
            </text>
            <rect x={width - 100} y={6} width={88} height={height - 12} rx={5} fill={badgeBg} stroke={badgeColor}
                  strokeWidth={0.8}/>
            <text
                x={width - 56}
                y={height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="'JetBrains Mono', monospace"
                fontSize={12}
                fontWeight={600}
                fill={badgeColor}
            >
                name = {name}
            </text>
        </svg>
    );
}

function Legend({items}: { items: { color: string; bg: string; label: string }[] }) {
    return (
        <div style={{display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14}}>
            {items.map((it, i) => (
                <div key={i}
                     style={{display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textSecondary}}>
          <span
              style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: it.bg,
                  border: `1.5px solid ${it.color}`,
                  display: "inline-block"
              }}
          />
                    {it.label}
                </div>
            ))}
        </div>
    );
}

function InfoBox({children, tone = "neutral"}: { children: React.ReactNode; tone?: "neutral" | "warn" | "ok" }) {
    const color = tone === "warn" ? COLORS.rose : tone === "ok" ? COLORS.teal : COLORS.textSecondary;
    const bg = tone === "warn" ? COLORS.roseBg : tone === "ok" ? COLORS.tealBg : COLORS.panel;
    const border = tone === "warn" ? `${COLORS.rose}33` : tone === "ok" ? `${COLORS.teal}33` : COLORS.panelBorder;
    return (
        <div
            style={{
                fontSize: 12.5,
                color,
                fontFamily: tone === "neutral" ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 8,
                padding: "10px 14px",
                lineHeight: 1.55,
                marginTop: 6,
            }}
        >
            {children}
        </div>
    );
}


// Data-driven sub views
function snippetFor(source: string, pos: number): string {
    if (pos < 0) return "";
    const rest = source.slice(pos);
    return rest.length > 4 ? rest.slice(0, 4) + "…" : rest;
}

function StringRow({data}: { data: SaisResponseDto }) {
    const lmsSet = new Set(data.lmsPositions);
    const chars = data.source.split("");
    const cells: SvgCellData[] = chars.map((ch, i) => {
        const isSentinel = ch === "$";
        const isLms = lmsSet.has(i);
        return {
            label: ch,
            sub: String(i),
            ringColor: isLms ? COLORS.violet : isSentinel ? COLORS.amber : undefined,
            bg: isLms ? COLORS.violetBg : isSentinel ? COLORS.amberBg : COLORS.cellBg,
            color: isLms ? COLORS.violet : isSentinel ? COLORS.amber : COLORS.textPrimary,
            bold: isLms,
        };
    });
    return <CellRow cells={cells} label="Source string"/>;
}

function TypeRow({data}: { data: SaisResponseDto }) {
    const cells: SvgCellData[] = data.typeMapDto.map.map((t) => ({
        label: t.type,
        sub: t.isLms ? "LMS" : undefined,
        bg: typeBg(t.type),
        color: typeColor(t.type),
        ringColor: t.isLms ? COLORS.violet : undefined,
        bold: t.isLms,
    }));
    return <CellRow cells={cells} label="Type (S = smaller, L = larger)"/>;
}

function BucketStrip({data}: { data: SaisResponseDto }) {
    return <BucketSvg data={data}/>;
}

/** Renders a single animation frame of a SortStepDto array (one of guessLmsSteps / guessInduceL / etc). */
function SortStepRow({
                         data,
                         array,
                         activeBucketIndex,
                         highlightColor,
                         highlightBg,
                         label,
                     }: {
    data: SaisResponseDto;
    array: number[];
    activeBucketIndex?: number;
    activeSourceIndex?: number;
    highlightColor: string;
    highlightBg: string;
    label?: string;
}) {
    const sentinelIdx = data.source.length - 1;
    const cells: SvgCellData[] = array.map((v, i) => {
        const isActive = i === activeBucketIndex;
        const isSentinel = v === sentinelIdx;
        return {
            label: v === -1 ? "·" : String(v),
            sub: v === -1 ? undefined : snippetFor(data.source, v),
            bg: v === -1 ? COLORS.cellEmpty : isActive ? highlightBg : isSentinel ? COLORS.amberBg : COLORS.cellBg,
            color: v === -1 ? COLORS.textMuted : isActive ? highlightColor : isSentinel ? COLORS.amber : COLORS.textPrimary,
            ringColor: isActive ? highlightColor : isSentinel ? COLORS.amber : undefined,
            bold: isActive || isSentinel,
        };
    });
    return <CellRow cells={cells} label={label || "Suffix array slots"}/>;
}


// step visual dispatch
function VisualForStep({step, data}: { step: Step; data: SaisResponseDto }) {
    switch (step.kind) {
        case "intro":
            return (
                <>
                    <StringRow data={data}/>
                    <TypeRow data={data}/>
                </>
            );

        case "guess-lms-frame": {
            const frame = data.guessLmsSteps[step.frameIndex!];
            return (
                <>
                    <Legend items={[{color: COLORS.violet, bg: COLORS.violetBg, label: "LMS just placed"}]}/>
                    <SortStepRow
                        data={data}
                        array={frame.resultingArray}
                        activeBucketIndex={frame.bucketIndex}
                        activeSourceIndex={frame.sourceIndex}
                        highlightColor={COLORS.violet}
                        highlightBg={COLORS.violetBg}
                    />
                    <BucketStrip data={data}/>
                    <InfoBox>
                        position {frame.sourceIndex} → slot {frame.bucketIndex}
                    </InfoBox>
                </>
            );
        }

        case "guess-induce-l-frame": {
            const frame = data.guessInduceL[step.frameIndex!];
            return (
                <>
                    <Legend items={[{color: COLORS.teal, bg: COLORS.tealBg, label: "newly induced L-type"}]}/>
                    <SortStepRow
                        data={data}
                        array={frame.resultingArray}
                        activeBucketIndex={frame.bucketIndex}
                        activeSourceIndex={frame.sourceIndex}
                        highlightColor={COLORS.teal}
                        highlightBg={COLORS.tealBg}
                    />
                    <InfoBox>
                        position {frame.sourceIndex} → slot {frame.bucketIndex}
                    </InfoBox>
                </>
            );
        }

        case "guess-induce-s-frame": {
            const frame = data.guessInduceS[step.frameIndex!];
            const isLast = step.frameIndex === data.guessInduceS.length - 1;
            return (
                <>
                    <Legend items={[{color: COLORS.rose, bg: COLORS.roseBg, label: "newly induced S-type"}]}/>
                    <SortStepRow
                        data={data}
                        array={frame.resultingArray}
                        activeBucketIndex={frame.bucketIndex}
                        activeSourceIndex={frame.sourceIndex}
                        highlightColor={COLORS.rose}
                        highlightBg={COLORS.roseBg}
                    />
                    <InfoBox>
                        position {frame.sourceIndex} → slot {frame.bucketIndex}
                    </InfoBox>
                    {isLast && <InfoBox>Sorted LMS order extracted: [{data.lmsOrder.join(", ")}]</InfoBox>}
                </>
            );
        }

        case "naming": {
            const lmsSet = new Set(data.lmsPositions);

            function lmsSubstr(pos: number): string {
                const res: string[] = [];
                const n = data.source.length;
                for (let k = pos; k < n; k++) {
                    res.push(data.source[k]);
                    if (k > pos && lmsSet.has(k)) break;
                    if (k === n - 1) break;
                }
                return res.join("");
            }

            return (
                <div style={{display: "flex", flexDirection: "column", gap: 8}}>
                    {data.lmsOrder.map((p, i) => {
                        const nm = data.lmsNames[p];
                        const prevNm = i > 0 ? data.lmsNames[data.lmsOrder[i - 1]] : null;
                        const isDup = prevNm !== null && nm === prevNm;
                        return <NamingRowSvg key={p} pos={p} substring={lmsSubstr(p)} name={nm} isDup={isDup}/>;
                    })}
                </div>
            );
        }

        case "reduced": {
            const positiveNames = data.lmsPositions.map((p) => data.lmsNames[p]);
            const namesUnique = new Set(positiveNames).size === positiveNames.length;
            const reducedCells: SvgCellData[] = data.lmsPositions.map((p, i) => ({
                label: String(data.reduced[i]),
                sub: `pos ${p}`,
                bg: COLORS.amberBg,
                color: COLORS.amber,
                ringColor: COLORS.amber,
                bold: true,
            }));
            const sortedCells: SvgCellData[] = data.reducedSorted.map((ri) => ({
                label: String(ri),
                sub: `→ pos ${data.lmsPositions[ri]}`,
                bg: COLORS.violetBg,
                color: COLORS.violet,
                ringColor: COLORS.violet,
            }));
            return (
                <>
                    <CellRow cells={reducedCells} label="Reduced string (LMS names, in original left-to-right order)"/>
                    <CellRow cells={sortedCells}
                             label="Reduced suffix array (reducedSorted — indices into reduced/lmsPositions)"/>
                    <InfoBox tone={namesUnique ? "ok" : "warn"}>
                        {namesUnique
                            ? "✓ All LMS names are unique — the backend did not need a recursive SA-IS call. The order above was determined directly."
                            : "⚠ Two or more LMS substrings share a name — the backend recursed (called SA-IS again on the reduced string) to resolve the tie. That recursive call isn't shown here; reducedSorted already reflects its result."}
                    </InfoBox>
                </>
            );
        }

        case "place-lms-frame": {
            const filled = new Set(data.saLmsAdded.map((v, i) => (v >= 0 ? i : -1)).filter((i) => i >= 0));
            return (
                <>
                    <Legend items={[{color: COLORS.violet, bg: COLORS.violetBg, label: "LMS placed (correct order)"}]}/>
                    <SortStepRow data={data} array={data.saLmsAdded} highlightColor={COLORS.violet}
                                 highlightBg={COLORS.violetBg}/>
                    <BucketStrip data={data}/>
                    <InfoBox>Correct LMS order used:
                        [{data.reducedSorted.map((ri) => data.lmsPositions[ri]).join(", ")}]</InfoBox>
                </>
            );
        }

        case "sa-induce-l-frame": {
            const frame = data.saInduceL[step.frameIndex!];
            return (
                <>
                    <Legend items={[{color: COLORS.teal, bg: COLORS.tealBg, label: "newly induced L-type"}]}/>
                    <SortStepRow
                        data={data}
                        array={frame.resultingArray}
                        activeBucketIndex={frame.bucketIndex}
                        activeSourceIndex={frame.sourceIndex}
                        highlightColor={COLORS.teal}
                        highlightBg={COLORS.tealBg}
                    />
                    <InfoBox>
                        position {frame.sourceIndex} → slot {frame.bucketIndex}
                    </InfoBox>
                </>
            );
        }

        case "sa-induce-s-frame": {
            const frame = data.saInduceS[step.frameIndex!];
            return (
                <>
                    <Legend items={[{color: COLORS.rose, bg: COLORS.roseBg, label: "newly induced S-type"}]}/>
                    <SortStepRow
                        data={data}
                        array={frame.resultingArray}
                        activeBucketIndex={frame.bucketIndex}
                        activeSourceIndex={frame.sourceIndex}
                        highlightColor={COLORS.rose}
                        highlightBg={COLORS.roseBg}
                    />
                    <InfoBox>
                        position {frame.sourceIndex} → slot {frame.bucketIndex}
                    </InfoBox>
                </>
            );
        }

        case "final": {
            return <FinalListSvg data={data}/>;
        }

        default:
            return null;
    }
}

// TODO: export

const LABEL_H = 18;

function labelText(text: string, y: number): React.ReactNode {
    return (
        <text
            x={0}
            y={y}
            fontFamily="'Inter', sans-serif"
            fontSize={11}
            fill={COLORS.textMuted}
            letterSpacing="0.02em"
            style={{textTransform: "uppercase" as const}}
        >
            {text.toUpperCase()}
        </text>
    );
}

/** A horizontal strip of cells (string / types / SA slots / reduced values). */
function cellRowBlock(cells: SvgCellData[], label?: string, cellWidth = CELL_W) {
    const n = cells.length;
    const rowW = n * cellWidth + Math.max(0, n - 1) * CELL_GAP;
    const labelH = label ? LABEL_H : 0;
    const height = labelH + CELL_H + SUB_H;

    return {
        height,
        width: rowW,
        render(yOffset) {
            return (
                <g transform={`translate(0, ${yOffset})`}>
                    {label && labelText(label, 11)}
                    <g transform={`translate(0, ${labelH})`}>
                        {cells.map((c, i) => {
                            const x = i * (cellWidth + CELL_GAP);
                            const bg = c.bg ?? COLORS.cellBg;
                            const border = c.ringColor ?? c.border ?? COLORS.panelBorder;
                            const strokeW = c.ringColor ? c.ringWidth ?? 1.5 : 0.8;
                            const color = c.color ?? COLORS.textPrimary;
                            return (
                                <g key={i}>
                                    <rect x={x} y={0} width={cellWidth} height={CELL_H} rx={8} fill={bg} stroke={border}
                                          strokeWidth={strokeW}/>
                                    <text
                                        x={x + cellWidth / 2}
                                        y={CELL_H / 2}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontFamily="'JetBrains Mono', monospace"
                                        fontSize={15}
                                        fontWeight={c.bold ? 600 : 400}
                                        fill={color}
                                    >
                                        {c.label}
                                    </text>
                                    {c.sub !== undefined && (
                                        <text
                                            x={x + cellWidth / 2}
                                            y={CELL_H + 13}
                                            textAnchor="middle"
                                            fontFamily="'JetBrains Mono', monospace"
                                            fontSize={10}
                                            fill={COLORS.textMuted}
                                        >
                                            {c.sub}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </g>
                </g>
            );
        },
    };
}

const STEP_DURATION = 1.0;

export function SaisOutput(props: SaisOutputProps) {
    const data = props.output;
    const steps = useMemo(() => buildSteps(data), [data]);

    const lmsNeedsRecursion = useMemo(() => {
        const names = data.lmsPositions.map((p) => data.lmsNames[p]);
        return new Set(names).size !== names.length;
    }, [data]);

    const getLmsOffsets = () => {
        const offsets = []
        for (let offset = 0; offset < props.output.source.length; offset++) {
            if (props.output.typeMapDto.map[offset].isLms) {
                offsets.push(offset);
            }
        }
        return offsets;
    }
    //
    const lmsOffsets = getLmsOffsets();

    const lmsSet = new Set(data.lmsPositions);

    function lmsSubstr(pos: number): string {
        const res: string[] = [];
        const n = data.source.length;
        for (let k = pos; k < n; k++) {
            res.push(data.source[k]);
            if (k > pos && lmsSet.has(k)) break;
            if (k === n - 1) break;
        }
        return res.join("");
    }

    const reducedCells: SvgCellData[] = data.lmsPositions.map((pos, i) => ({
        label: String(data.reduced[i]),
        sub: `pos ${pos}`,
        bg: COLORS.amberBg,
        color: COLORS.amber,
        ringColor: COLORS.amber,
        bold: true,
    }));

    const sortedCells: SvgCellData[] = data.reducedSorted.map((ri) => ({
        label: String(ri),
        sub: `→ pos ${data.lmsPositions[ri]}`,
        bg: COLORS.violetBg,
        color: COLORS.violet,
        ringColor: COLORS.violet,
    }));

    // TODO: old stuff!
    // console.log(props.output);
    //
    const cellWidth = 30
    const cellHeight = 30
    const boxCount = props.output.source.length;
    const arrowXStart = 10 + 10 + props.output.reduced.length * cellWidth
    const arrowXEnd = 180 + props.output.reduced.length * cellWidth
    const arrowTextX = (arrowXStart + arrowXEnd) / 2

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const labels = createStepLabels(props.output.guessLmsSteps.length
        + props.output.guessInduceS.length
        + props.output.guessInduceL.length
        + 1 // for the final guessed sa
    );

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        tlRef.current.timeScale(speed);
    };

    useGSAP(() => {
        gsap.registerPlugin(DrawSVGPlugin);
        gsap.registerPlugin(ScrambleTextPlugin);

        tlRef.current?.kill();

        // create timeline
        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut",
            },
            onUpdate: () => {
                const tl = tlRef.current;
                props.setProgress(tl.progress()); //für scrubber

                const stepIndex: number = getStepIndexFromTimeline(tl, labels);

                props.setStepIndex(stepIndex);
            },
            onComplete: () => {
                setIsPlaying(false);
                tlRef.current.pause();
            },
        });

        tlRef.current = timeline;

        // draw initial states
        timeline.addLabel(labels[0]);

        {
            timeline.set("#index_row", {opacity: 100});
            timeline.set("#text_row", {opacity: 100},);
            timeline.set("#buckets_row", {opacity: 100},);
            timeline.set("#types_row", {opacity: 100},);

            // timeline.from("#index_row", {drawSVG: "50% 50%"}, "<");
            // timeline.from("#text_row", {drawSVG: "50% 50%"}, "<");
            // timeline.from("#types_row", {drawSVG: "50% 50%"}, "<");
            // timeline.from("#buckets_row", {drawSVG: "50% 50%"}, "<");
        }

        timeline.progress(props.progress);
        setIsPlaying(false);

        return () => {
            timeline.kill();
            tlRef.current = gsap.timeline({paused: true});
        }
    }, {dependencies: [props.output.timestamp]});

    let yOffset = 180;

    const xOffsetLeftCol = 10;
    const rowNameColWidth = 80;

    const guessesYOffset = 150;
    let counter = 0
    return (
        <div className="algorithm-panel">
            <IOModeTabs mode={"output"}
                        onChangeInput={props.onChangeInput}
                        onSubmit={() => {
                        }}
                        canSubmit={false}/>

            <svg className="algorithm-canvas" viewBox="0 0 1123 500" preserveAspectRatio="xMidYMid meet">
                {/*<text x={10} y={10}>{JSON.stringify(props.output)}</text>*/}
                {/*<foreignObject x={10} y={30} width={100} height={150}>*/}
                {/*    <table>*/}
                {/*        <tbody>*/}
                {/*        <tr>*/}
                {/*            {[...props.output.source].map((char, index) => (*/}
                {/*                <th>{char}</th>*/}
                {/*            ))}*/}
                {/*        </tr>*/}
                {/*        </tbody>*/}
                {/*    </table>*/}
                {/*</foreignObject>*/}

                {/* initial state with indexes and buckets */}
                <IndexRow
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={30}
                    source={props.output.source}
                    nameColWidth={rowNameColWidth}
                />
                <TextRow
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={60}
                    typeMap={props.output.typeMapDto}
                    source={props.output.source}
                    nameColWidth={rowNameColWidth}
                />
                <TypesRow
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={90}
                    typeMap={props.output.typeMapDto}
                    source={props.output.source}
                    nameColWidth={rowNameColWidth}
                />
                <BucketsRow
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    bucketSizes={props.output.bucketSizes}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={120}
                    nameColWidth={rowNameColWidth}
                />

                {/* lms guesses */}
                {props.output.guessLmsSteps.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"s" + counter} key={"s" + counter}>
                                <rect
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                    y={guessesYOffset}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell yellow when suffix is lms
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                    style={{opacity: 0}}
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={guessesYOffset + cellHeight * 0.7}
                                    textAnchor="middle"
                                    style={{opacity: 0}}
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        counter++;
                    }

                    return elements;
                })}
                {/* induce L-types guess */}
                {props.output.guessInduceL.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"s" + counter} key={"s" + counter} style={{opacity: 1}}>
                                <rect
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                    y={guessesYOffset}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell lightblue when it's the newly inserted one
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                    style={{opacity: 0}}
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={guessesYOffset + cellHeight * 0.7}
                                    textAnchor="middle"
                                    style={{opacity: 0}}
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        counter++;
                    }
                    return elements
                })}

                {/* induce S-types guess */}
                {props.output.guessInduceS.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                                <rect
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                    y={guessesYOffset}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={guessesYOffset + cellHeight * 0.7}
                                    textAnchor="middle"
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        counter++;
                    }
                    return elements;
                })}

                {/* guessed sa */}
                <g id={"s" + counter} key={"s" + counter} style={{opacity: 1}}>
                    {props.output.guessedSa.map((offset, index) => (
                        <g key={index}>
                            <rect
                                x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                y={guessesYOffset}
                                width={cellWidth}
                                height={cellHeight}
                                // fill cell yellow when suffix is lms
                                fill={(lmsOffsets.includes(offset, 0)) ? "yellow" : "white"}
                                stroke="black"
                            />
                            <text
                                x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                y={guessesYOffset + cellHeight * 0.7}
                                textAnchor="middle"
                            >
                                {offset}
                            </text>
                        </g>
                    ))}
                </g>
                {counter++}

                {/* naming */}
                <g id={"s" + counter} key={"s" + counter} transform="translate(10, 0)">
                    {
                        data.lmsOrder.map((pos, i) => {
                            const height = 30
                            const width = 250;
                            yOffset += 40;

                            const substring = lmsSubstr(pos);
                            const nm = data.lmsNames[pos];
                            const prevNm = i > 0 ? data.lmsNames[data.lmsOrder[i - 1]] : null;
                            const isDup = prevNm !== null && nm === prevNm;

                            const badgeColor = isDup ? COLORS.rose : COLORS.amber;
                            const badgeBg = isDup ? COLORS.roseBg : COLORS.amberBg;
                            return (
                                <g transform={`translate(0, ${yOffset})`}>
                                    <rect x={0} y={0} width={width} height={height} fill="white"
                                          stroke="black" strokeWidth={1}/>
                                    <text x={12} y={height / 2} dominantBaseline="central"
                                        // fontFamily="'JetBrains Mono', monospace"
                                        // fontSize={11} fill={COLORS.textMuted}
                                    >
                                        pos {pos}
                                    </text>
                                    <rect x={64} y={8} width={width - 64 - 110} height={height - 16} rx={5}
                                          fill="lightgray"/>
                                    <text x={74} y={height / 2} dominantBaseline="central"
                                        // fontFamily="'JetBrains Mono', monospace"
                                          fontSize={13}
                                        // fill={COLORS.textPrimary}
                                    >
                                        "{substring}"
                                    </text>
                                    <rect x={width - 100} y={6} width={88} height={height - 12} rx={5} fill={badgeBg}
                                          stroke={badgeColor} strokeWidth={0.8}/>
                                    <text
                                        x={width - 56}
                                        y={height / 2}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontFamily="'JetBrains Mono', monospace"
                                        fontSize={12}
                                        fontWeight={600}
                                        fill={badgeColor}
                                    >
                                        name = {nm}
                                    </text>
                                </g>
                            );
                        })
                    }
                </g>
                {counter++}

                {/* reduced */}
                <g id={"s" + counter} key={"s" + counter}>
                    {props.output.reduced.map((pos, index) => {
                        const y = 30;
                        const x = 600;
                        return <g key={index}>
                            <rect
                                x={x + index * 30}
                                y={y}
                                width={cellWidth}
                                height={cellHeight}
                                fill="white"
                                stroke="black"
                            />
                            <text
                                x={x + index * 30 + 15}
                                y={y + 20}
                                textAnchor="middle"
                            >
                                {pos}
                            </text>
                        </g>
                    })
                    }
                </g>
                {counter++}
                {/* reduced sorted */}
                <g id={"s" + counter} key={"s" + counter}>
                    {props.output.reducedSorted.map((pos, index) => {
                        const y = 80;
                        const x = 600;
                        return <g key={index}>
                            <rect
                                x={x + index * 30}
                                y={y}
                                width={cellWidth}
                                height={cellHeight}
                                fill="white"
                                stroke="black"
                            />
                            <text
                                x={x + index * 30 + 15}
                                y={y + 20}
                                textAnchor="middle"
                            >
                                {pos}
                            </text>
                        </g>
                    })
                    }
                </g>
                {counter++}
                {/* sa Slots */}
                <g id={"s" + counter} key={"s" + counter}>
                    {props.output.saLmsAdded.map((pos, index) => {
                        const y = 120;
                        const x = 600;
                        return <g key={index}>
                            <rect
                                x={x + index * 30}
                                y={y}
                                width={cellWidth}
                                height={cellHeight}
                                fill={(lmsOffsets.includes(pos, 0)) ? "yellow" : "white"}
                                stroke="black"
                            />
                            <text
                                x={x + index * 30 + 15}
                                y={y + 20}
                                textAnchor="middle"
                            >
                                {(pos == -1) ? "" : pos}
                            </text>
                        </g>
                    })
                    }
                </g>
                {counter++}

                {/* induce L-types final */}
                {props.output.saInduceL.map((step, j) => {
                    const x = 600;
                    const y = 160;
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"s" + counter} key={"s" + counter} style={{opacity: 1}}>
                                <rect
                                    x={x + index * 30}
                                    y={y}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell lightblue when it's the newly inserted one
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={x + index * 30 + 15}
                                    y={y + 20}
                                    textAnchor="middle"
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        counter++;
                    }
                    return elements
                })}

                {/* induce S-types final */}
                {props.output.saInduceS.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        const x = 600;
                        const y = 160;
                        elements.push(
                            <g id={"s" + counter} key={"s" + counter}>
                                <rect
                                    x={x + index * 30}
                                    y={y}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={x + index * 30 + 15}
                                    y={y + 20}
                                    textAnchor="middle"
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        counter++;
                    }
                    return elements;
                })}
                {/* final suffix */}
                {
                    props.output.sa.map((offset, index) => {
                        const x = 600;
                        const y = 220;
                        return <g id={"s" + counter} key={"s" + counter}>
                            <text
                                x={x}
                                y={y + index * 30}
                                textAnchor="start"
                            >
                                {index}
                            </text>
                            <text
                                x={x + 30}
                                y={y + index * 30}
                                textAnchor="start"
                            >
                                {offset}
                            </text>
                            <text
                                x={x + 60}
                                y={y + index * 30}
                                textAnchor="start"
                            >
                                {props.output.source.substring(offset)}
                            </text>
                        </g>
                    })
                }
            </svg>

            {/* output control */}
            <OutputControls
                timelineRef={tlRef}
                labels={labels}
                currentStep={props.stepIndex}
                setCurrentStep={props.setStepIndex}
                stepCount={counter}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                progress={props.progress}
                setProgress={props.setProgress}
                playbackSpeed={playbackSpeed}
                onPlaybackSpeedChange={changePlaybackSpeed}
            />
            {/* step info */}
            <div className="step-info">
                <div className="step-info-grid">
                    <div><strong>Step:</strong> {props.stepIndex} / {labels.length - 1}</div>
                </div>
            </div>

            <text>{JSON.stringify(props.output)}</text>
        </div>
    );

    // return (
    //     <div className="algorithm-panel">
    //         <IOModeTabs mode={"output"}
    //                     onChangeInput={props.onChangeInput}
    //                     onSubmit={() => {
    //                     }}
    //                     canSubmit={false}/>
    //         <svg className="algorithm-canvas" viewBox="0 0 1123 500" preserveAspectRatio="xMidYMid meet">
    //             {steps.map((step, i) => (
    //                 <div id={"s" + i} key={"s" + i}>
    //                     {/*<VisualForStep step={step} data={data}/>*/}
    //                 </div>
    //             ))}
    //         </svg>
    //     </div>
    // );
}