import React, {useState} from "react";
import ClosestPair from "./closestPair/ClosestPair.tsx";
import EhrlichSwaps from "./ehrlichSwaps/EhrlichSwaps.tsx";
import {VertexCover} from "./vertexCover/VertexCover.tsx";
import type {HomepageProps, Tab} from "./shared/Types.tsx";
import {Link} from "react-router-dom";
import SuffixArrayInducedSorting from "./sais/SuffixArrayInducedSorting.tsx";

export function Homepage(props: HomepageProps) {
    const [activeTab, setActiveTab] = useState<Tab>(props.activeTab);
    return (
        <div className="app-page">
            <Header activeTab={activeTab} setActiveTab={setActiveTab}/>

            <main className="app-main">
                {activeTab === "homepage" && <HomeContent onTabChange={setActiveTab}/>}
                {activeTab === "closestPair" && <ClosestPair/>}
                {activeTab === "vertexCover" && <VertexCover/>}
                {activeTab === "suffixArray" && <SuffixArrayInducedSorting/>}
                {activeTab === "ehrlichSwaps" && <EhrlichSwaps/>}
            </main>
        </div>
    );
}

type HeaderProps = { activeTab: Tab; setActiveTab: React.Dispatch<React.SetStateAction<Tab>>; };

function Header(props: HeaderProps) {
    return (
        <header className="home-header">
            <AlgoTraceLogo/>

            <NavigationBar
                activeTab={props.activeTab}
                onTabChange={props.setActiveTab}
            />
        </header>
    );
}

type NavigationBarProps = { activeTab: Tab; onTabChange: (tab: Tab) => void; };

function NavigationBar(props: NavigationBarProps) {
    return (
        <nav className="home-nav">
            <NavButton tab="homepage" label="Home" activeTab={props.activeTab} onTabChange={props.onTabChange} linkTo={"/"}/>
            <NavButton tab="closestPair" label="Closest Pair" activeTab={props.activeTab} onTabChange={props.onTabChange} linkTo={"/closestPair"}/>
            <NavButton tab="suffixArray" label="Suffix Array" activeTab={props.activeTab} onTabChange={props.onTabChange} linkTo={"/suffixArray"}/>
            <NavButton tab="vertexCover" label="Vertex Cover" activeTab={props.activeTab} onTabChange={props.onTabChange} linkTo={"/vertexCover"}/>
            <NavButton tab="ehrlichSwaps" label="Ehrlich Swaps" activeTab={props.activeTab} onTabChange={props.onTabChange} linkTo={"/ehrlichSwaps"}/>
        </nav>
    );
}

type NavButtonProps = { tab: Tab; label: string; activeTab: Tab; onTabChange: (tab: Tab) => void; linkTo: string };

function NavButton(props: NavButtonProps) {
    const isActive = props.activeTab === props.tab;

    return (
        <Link to={props.linkTo} style={{alignContent: "center"}}>
            <button
                type="button"
                onClick={() => props.onTabChange(props.tab)}
                className={`home-nav-button ${isActive ? "is-active" : ""}`}
            >
                {props.label}
            </button>
        </Link>
    );
}

function SuffixArray() {
    return <h1>suffixarray</h1>;
}


type HomeContentProps = {
    onTabChange: (tab: Tab) => void;
};

function HomeContent(props: HomeContentProps) {
    return (
        <section>
            <h1 className="home-headline">Welcome to the Algo Trace Viewer</h1>
            <p className="home-text">
                <p>Select an algorithm to explore its execution step by step through an interactive visualization.</p>
            </p>

            <div className="algorithm-card-grid">
                <AlgorithmCard
                    title="Closest Pair"
                    description="Finds the closest pair of points in 2D using a left-to-right sweep-line algorithm."
                    onClick={() => props.onTabChange("closestPair")}
                />

                <AlgorithmCard
                    title="Suffix Array"
                    description="bla bla blup"
                    onClick={() => props.onTabChange("suffixArray")}
                />

                <AlgorithmCard
                    title="Vertex Cover"
                    description="bup lup schup"
                    onClick={() => props.onTabChange("vertexCover")}
                />

                <AlgorithmCard
                    title="Ehrlich Swaps"
                    description="Generates all permutations of distinct elements."
                    onClick={() => props.onTabChange("ehrlichSwaps")}
                />
            </div>
        </section>
    );
}

type AlgorithmCardProps = {
    title: string; description: string; onClick: () => void;
};

function AlgorithmCard(props: AlgorithmCardProps) {
    return (
        <button
            type="button"
            onClick={props.onClick}
            className="algorithm-card"
        >
            <h2 className="algorithm-card-title">{props.title}</h2>
            <p className="algorithm-card-text">{props.description}</p>
        </button>
    );
}


function AlgoTraceLogo() {
    return (
        <svg
            className="home-logo"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-2 0 370 110"
            role="img"
            aria-labelledby="title desc"
        >
            <title id="title">Algo Trace Viewer icon</title>
            <desc id="desc">Graph path with play and pause and title Algo Trace Viewer.</desc>

            <g transform="translate(5,20)">
                <circle cx="0" cy="0" r="6" fill="#BE3D2A"/>
                <circle cx="40" cy="0" r="6" fill="#102E50"/>
                <circle cx="40" cy="40" r="6" fill="#102E50"/>
                <circle cx="80" cy="40" r="6" fill="#102E50"/>

                <path
                    d="M0 0 L40 0 L40 40 L80 40"
                    fill="none"
                    stroke="#102E50"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                <polygon points="56,14 56,26 66,20" fill="#BE3D2A"/>

                <line x1="16" y1="15" x2="16" y2="25" stroke="#102E50" strokeWidth="3" strokeLinecap="round"/>
                <line x1="24" y1="15" x2="24" y2="25" stroke="#102E50" strokeWidth="3" strokeLinecap="round"/>
            </g>

            <g transform="translate(125,45)">
                <text
                    x="-20"
                    y="0"
                    fontFamily="Arial"
                    fontSize="28"
                    fontWeight="600"
                    fill="#102E50"
                >
                    AlgoTraceViewer
                </text>
            </g>
        </svg>
    );
}
/*
const pageStyle: React.CSSProperties = {
    padding: 24,
    //fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    fontFamily: "Arial",
};

const headerStyle: React.CSSProperties = {
    //marginBottom: 16,
    display: "flex",
    alignItems: "center", //vertikal gleiche Höhe
    justifyContent: "space-between", //maximal auseinander
    gap: 40,
    padding: 20,
};

const navStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    gap: 7,
    padding: 9,
    margin: "0 auto 32px auto",
    maxWidth: 700,
    border: "3px solid #102E50",
    borderRadius: 999,
    background: "white",
};

const navButtonStyle: React.CSSProperties = {
    border: "none",
    borderRadius: 999,
    padding: "10px 20px",
    fontSize: 20,
    fontWeight: 700,
    cursor: "pointer",
};

const mainStyle: React.CSSProperties = {
    maxWidth: 1000,
    margin: "0 auto",
};

const headlineStyle: React.CSSProperties = {
    color: "#102E50",
    fontSize: 36,
    marginBottom: 8,
    fontWeight: 500
};

const textStyle: React.CSSProperties = {
    color: "#333",
    fontSize: 18,
    marginBottom: 28,
};

const cardGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
};

const cardStyle: React.CSSProperties = {
    textAlign: "left",
    border: "2px solid #102E50",
    borderRadius: 18,
    padding: 20,
    background: "white",
    cursor: "pointer",
};

const cardTitleStyle: React.CSSProperties = {
    color: "#BE3D2A", // frabe vom logo wieder aufgenommen
    marginTop: 0,
    marginBottom: 10,
    fontWeight: 700,
};

const cardTextStyle: React.CSSProperties = {
    color: "#333",
    fontSize: 15,
    lineHeight: 1.5,
};

 */