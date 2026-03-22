import * as React from "react";
import {type KeyboardEvent, useState} from "react";
import './App.css'
import type {BubbleSortResponseDto} from "./data/BubbleSortResponseDto.ts";
import type {BubbleSortState} from "./data/BubbleSortState.ts";

function App() {
    const [count, setCount] = useState(0)
    const [response, setResponse] = useState('')
    const [numbers, setNumbers] = useState<number[]>([])
    const [bubbleSortResponse, setBubbleSortResponse] = useState<BubbleSortResponseDto>()
    const [bubbleSortStates, setBubbleSortStates] = useState<React.JSX.Element[]>([])
    const [currentSvgIndex, setCurrentSvgIndex] = useState<number>(0)
    const [maxSvgIndex, setMaxSvgIndex] = useState<number>(0)

    const createBubbleSortSvgs = () => {
        let states: React.JSX.Element[] = []
        bubbleSortResponse?.states.forEach((state) => {
            states.push(parseBubbleSortState(state))
        })
        setBubbleSortStates(states)
    }

    const parseBubbleSortState = (data: BubbleSortState) => {
        return (<svg width={startX * 2 + numbers.length * cellWidth} height="70">
                {data.numbers.map((num, index) => {
                    const x = startX + index * cellWidth;

                    return (
                        <g key={num}>
                            <rect
                                x={x}
                                y={startY}
                                width={cellWidth}
                                height={cellHeight}
                                fill={cellFill(index)}
                                stroke="black"
                            />
                            <text
                                x={x + cellWidth / 2}
                                y={startY + cellHeight / 2 + 6}
                                textAnchor="middle"
                                fontSize="18"
                                fontFamily="Arial"
                                fill="black"
                            >
                                {num}
                            </text>
                        </g>
                    )
                })}
            </svg>
        )
    }

    const svgGoForward = () => {
        setCurrentSvgIndex((prev) => prev < bubbleSortStates.length - 1 ? prev + 1 : prev)
    }

    const svgGoBackward = () => {
        setCurrentSvgIndex((prev) => prev > 0 ? prev - 1 : prev)
    }

    const [inputText, setInputText] = useState('')
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            addNumber()
        }
    }

    const addNumber = () => {
        if (inputText.trim() === "") return;

        let num = Number(inputText)
        if (num) {
            setNumbers([...numbers, num])
        } else {
            alert('input was not a number: \'' + inputText + '\'')
        }
    }

    const generateNumbers = () => {
        const nums: number[] = []
        for (let i = 0; i < 20; i++) {
            nums.push(randomIntFromInterval(0, 10_000))
        }
        setNumbers(nums)
    }

    const deleteNumber = (indexToDelete: number) => {
        setNumbers((prevNumbers) => prevNumbers.filter((_, index) => index !== indexToDelete))
    }

    // useEffect(() => {
    //     fetch('http://localhost:8080/algo?name=world')
    //         .then(res => res.json())
    //         .then(data => setResponse(JSON.stringify(data)))
    // })

    // consts for test svg
    const testNumbers = Array.from({length: 20}).map((_, i) => i + 1)
    const cellWidth = 60;
    const cellHeight = 50;
    const startX = 10;
    const startY = 10;
    const cellFill = (index: number) => {
        if ((index % 2) === 0) {
            return "white"
        }
        return "yellow"
    }

    return (
        <>
            <div>
                <p>Hello world</p>
            </div>
            <section id="add-numbers">
                <div>
                    <p>
                        Add number: <input
                        type="number"
                        placeholder="enter some numbers here"
                        name="numbers-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}/>
                        <button onClick={addNumber}>add</button>
                        <button onClick={generateNumbers}>random numbers</button>
                    </p>
                </div>
            </section>

            <section id="numbers">
                <div>
                    <h3>Numbers ({numbers.length}):</h3>
                    <ul>
                        {numbers.map((number, index) => (
                            <li key={index}>
                                <span>{number}</span>
                                <button type="button" onClick={() => deleteNumber(index)}>
                                    delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <button className="counter" onClick={() => {
                        fetch('http://localhost:8080/bubblesort', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({'numbers': numbers})
                        })
                            .then(res => res.json())
                            .then(data => {
                                alert(data)
                                setBubbleSortResponse(data)
                                createBubbleSortSvgs()
                                setCurrentSvgIndex(0)
                                setMaxSvgIndex(bubbleSortStates.length)
                            })
                    }}>
                        SEND IT!
                    </button>
                </div>
                <div>
                    <h3>response:</h3>
                    <code>{JSON.stringify(bubbleSortResponse)}</code>
                </div>
            </section>

            <section id="svg-test">
                <h4>States ({bubbleSortStates.length}):</h4>
                {/*<div>*/}
                {/*    {bubbleSortStates.map((state, index) => {*/}
                {/*        return (*/}
                {/*            <div key={index}>*/}
                {/*                {state}*/}
                {/*                <hr/>*/}
                {/*            </div>*/}
                {/*        )*/}
                {/*    })}*/}
                {/*</div>*/}

                <div>
                    {bubbleSortStates[currentSvgIndex]}
                </div>

                <button onClick={svgGoBackward} disabled={currentSvgIndex === 0}>
                    Previous
                </button>

                <button
                    onClick={svgGoForward}
                    disabled={currentSvgIndex === bubbleSortStates.length - 1}
                >
                    Next
                </button>
                <div>
                    <p>
                        Graphic {currentSvgIndex + 1} of {bubbleSortStates.length}
                    </p>
                </div>
            </section>
        </>
    )
}

function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

export default App
