
import { useState } from "react";
import {btnStyle} from "./Utils"
import App from "./App";
type Tab = "homepage" | "sweepline" | "suffixarray" |"vertexcover";

export function Homepage(){
    const [activeTab, setActiveTab] = useState<Tab>("homepage");

    return (
        <div>
            <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />

            <main>
                {activeTab === "homepage" && <HomeContent />}
                {activeTab === "sweepline" && <App />}
                {activeTab === "vertexcover" && <VertexCover />}
                {activeTab === "suffixarray" && <SuffixArray />}
            </main>
        </div>
    );
}

type NavigationBarProps = {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

function NavigationBar(props: NavigationBarProps) {
    return (
        <nav>
            <button style={{...btnStyle, fontFamily: "monospace", fontSize: 20, width:"20%"}} onClick={() => props.onTabChange("homepage")}> <strong>Homepage</strong></button>
            <button style={{...btnStyle, fontFamily: "monospace", fontSize: 20, width:"20%"}} onClick={() => props.onTabChange("sweepline")}> <strong>sweepline</strong></button>
            <button style={{...btnStyle, fontFamily: "monospace", fontSize: 20, width:"20%"}} onClick={() => props.onTabChange("suffixarray")}> <strong>suffixarray</strong></button>
            <button style={{...btnStyle, fontFamily: "monospace", fontSize: 20, width:"20%"}} onClick={() => props.onTabChange("vertexcover")}> <strong>vertexcover</strong></button>
        </nav>
    );
}


function VertexCover(){
    return (
        <h1>VertexCover</h1>
    );
}


function HomeContent() {

    return <h1>Homepage</h1>;

}

function SuffixArray() {

    return <h1>suffixarray</h1>;

}