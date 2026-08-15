# AlgoTraceViewer

**AlgoTraceViewer** is an interactive web application for exploring algorithms step by step through visual animations.

Instead of only showing the final result of an algorithm, the application exposes relevant intermediate states and 
visualizes how the algorithm progresses from its input to its result. In the adjacent pseudocode panel the user also see the relevant code lines highlighted.
Users can navigate through individual steps, play the complete execution as an animation, change the playback speed, or move freely through the timeline.
Furthermore, a user can share the current state of an animation using an export string that can be imported by other users.
Inputs can also be saved as presets. 

The project currently contains visualizations for:

- **Closest Pair:** finds the closest pair of points in two dimensions using a sweep-line algorithm.
- **Vertex Cover:** visualizes different approaches for computing a vertex cover of a graph.
- **Ehrlich Swaps:** generates permutations of distinct elements using Ehrlich's swap method.
- **Suffix Array / SA-IS:** visualizes the construction of a suffix array using induced sorting.

---

## Technologies

AlgoTraceViewer consists of a React frontend and a Spring Boot backend.


| Frontend                        | Backend                     | Deployment                                                                              |
|---------------------------------|-----------------------------|-----------------------------------------------------------------------------------------|
| **React 19**                    | **Java 25**                 | **Docker**                                                                              |
| **TypeScript**                  | **Spring Boot 4**           | Multi-stage Docker build                                                                |
| **Vite**                        | **Spring Web / Spring MVC** | The production frontend is served as static content <br/>by the Spring Boot application |
| **GSAP** for animations         | **Maven**                   |                                                                                         |
| **React Router** for navigation | **Lombok**                  |                                                                                         |
| **Lucide React** for icons      |                             |                                                                                         |

---
# General Application Flow

Although the algorithms operate on very different data structures, they follow a similar general flow.

```text
User Input
    │
    ▼
Frontend Input Component
    │
    │ HTTP request
    ▼
Spring Boot Controller
    │
    ▼
Algorithm / Service
    │
    │ records relevant intermediate states
    ▼
Steps / Animation Response
    │
    │ JSON response
    ▼
Frontend Output Component
    │
    ▼
Build GSAP Timeline
    │
    ▼
Interactive Visualization
```

The backend therefore does not simply return the final result of an algorithm.

Instead, it records intermediate states that contain the information required to reconstruct and visualize the execution.

The frontend converts these states into animations and connects them to common controls for playback and step-by-step navigation.

---

# Frontend
## Algorithm Modules

An algorithm module generally contains several responsibilities:

```text
algorithm/
├── Algorithm.tsx
├── Api.ts
│
├── input/
│   └── Input.tsx
│
├── output/
│   ├── Output.tsx
│   ├── PseudoCode.ts
│   └── ...
│
└── shared/
    ├── Types.ts
    └── ...
```

The exact structure differs slightly between algorithms because their inputs, intermediate states, and visualizations are different.

### Algorithm Component

The main algorithm component (located in Algorithm.tsx) acts as the connection between input and output. 
A generic Algorithm.tsx example can be found at the end. 

It typically manages state such as:

- the current input,
- the response received from the backend,
- whether the input or output view is active,
- the current animation step,
- the current animation progress.

When the user starts an algorithm, the component sends the input to the corresponding backend endpoint and stores the returned animation data.

The application then switches from the input view to the output visualization.

---

# Animation and Output Logic

The output components are responsible for translating the data returned by the backend into a visual animation.

For the GSAP-based visualizations, a timeline is created from the intermediate algorithm states. After that the timeline becomes the central object... siehe output controls. 

Conceptually:

```text
Backend States
      │
      ▼
Output Component
      │
      ▼
GSAP Timeline
      │
      ├── animation
      ├── label
      ├── animation
      ├── label
      ├── animation
      └── label
```

Timeline labels represent discrete semantic steps of the visualization.

This allows the continuous GSAP timeline to be connected to the discrete steps of an algorithm.

```text
Timeline

0s              1.4s              3.1s
│                 │                 │
▼                 ▼                 ▼
Label 0         Label 1           Label 2
│                 │                 │
▼                 ▼                 ▼
Step 0          Step 1            Step 2
```

A backend state does not necessarily correspond to exactly one timeline step. 
For example, Vertex Cover and Ehrlich Swaps create multiple timeline steps for each intermediate state returned by the backend. 
In contrast, Closest Pair receives a sequence of timeline steps directly from the backend.  

---

## Timeline Synchronization

The current GSAP timeline position is synchronized with React state.

The important shared states are: `progress`

for the continuous position in the complete animation, and: `currentStepIndex`

for the currently reached discrete visualization step.

During timeline updates, the current time is compared with the timeline labels.

```text
GSAP Timeline
      │
      │ onUpdate
      ▼
current timeline time
      │
      ▼
find latest reached label
      │
      ▼
currentStepIndex
```

The resulting step index is then used by other parts like the stepinfo or the Pseudocode.
This keeps the animation, textual explanation, and highlighted pseudocode synchronized.

---

# Output Controls

Reusable animation controls. They provide common functionality such as:

- Play / Pause
- Previous step
- Next step
- Reset
- Timeline scrubbing
- Playback speed

The controls are intentionally independent of a specific algorithm.
Instead of directly manipulating algorithm data, they operate on the GSAP timeline.
For example, moving to the next step conceptually works as follows:

```text
Next
 │
 ▼
Determine next timeline label
 │
 ▼
GSAP tweenTo(label)
 │
 ▼
Timeline moves to that position
 │
 ▼
onUpdate
 │
 ▼
currentStepIndex + progress
 │
 ▼
React UI updates
```
This makes the timeline the central source for the current temporal state of the visualization.

---

# Shared Frontend Components

Reusable UI and visualization infrastructure. Important components include:

```text
AlgorithmOverviewBox.tsx
ControlsHelpDialog.tsx
IOModeTabs.tsx
ImportExportDialog.tsx
OutputControls.tsx
PresetSelect.tsx
PseudoCodePanel.tsx
Types.tsx
Utils.tsx
```

The goal is to provide infrastructure that can also be used when additional algorithms are added.

Algorithm-specific rendering and algorithm-specific data should remain inside the corresponding algorithm module.

# Backend
It is a Spring Boot application that exposes REST endpoints for the different algorithms.
A typical request follows this structure:

```text
HTTP Request
     │
     ▼
Controller
     │
     ▼
Algorithm / Service
     │
     ▼
Intermediate States
     │
     ▼
DTO / AnimationResponse
     │
     ▼
JSON Response
```

---

## Controllers

The main algorithm controllers are:

```text
ClosestPairController
EhrlichSwapsController
SaisController
VertexCoverController
```

There is also a separate: `PresetController`

for loading and storing presets.

The controllers should mainly handle the HTTP-facing part of the application. The actual algorithm logic is kept in the corresponding services or algorithm classes.

---
# Presets and Import / Export

The application supports presets as well as importing and exporting visualization states.

Presets are handled through the backend using:

```text
GET  /api/presets/{algorithm}
POST /api/presets/{algorithm}
```

Preset data is stored in: `backend/data/presets.json`

Import/export functionality allows a visualization configuration to be restored later.

Besides the algorithm input, the animation progress can be stored so that the timeline can be reconstructed at approximately the same position.

---

# Building and Running

## Frontend Development

From the `frontend` directory:

```bash
npm install
npm run dev
```

Vite starts the development server. The backend controllers currently allow requests from the local Vite development origin.

A production frontend build can be created with:`npm run build`

The resulting files are written to: `frontend/dist/`

---

## Backend Development

From the `backend` directory, the Spring Boot application can be built with Maven:`./mvnw clean package`

and started with: `./mvnw spring-boot:run`

---

# Docker

The repository contains a `Dockerfile` as well as helper scripts for building and running the complete application.

The provided:`build.sh`

first builds the React frontend:

```bash
cd frontend
npm run build
```

The generated frontend is then copied into the Spring Boot static resources:

```text
frontend/dist
        │
        ▼
backend/src/main/resources/static
```

Afterwards, the Docker image is built: `docker build -t my-app .`

The provided helper script: `./run.sh`

runs the image with: `docker run -p 8080:8080 my-app`

The complete application can then be accessed through port `8080`.

In production, React therefore does **not** run as a separate server. The built frontend files are bundled into the Spring Boot application and served as static resources.

---

# Adding or Understanding an Algorithm

When working on an existing algorithm or adding a new one, the easiest way to understand the architecture is to follow the complete data flow:

```text
1. Input Component
        │
        ▼
2. Main Algorithm Component
        │
        ▼
3. Frontend API request
        │
        ▼
4. Backend Controller
        │
        ▼
5. Algorithm / Service
        │
        ▼
6. Intermediate states / DTOs
        │
        ▼
7. Frontend Output Component
        │
        ▼
8. GSAP timeline and labels
        │
        ▼
9. OutputControls
        │
        ▼
10. Step information and pseudocode
```

The most important distinction is between **shared visualization components** and **algorithm-specific behavior**.

Shared infrastructure handles common concepts such as navigation, playback, progress, pseudocode presentation, presets, and import/export.

Each algorithm is responsible for defining its own input, computing or receiving its intermediate states, and translating those states into an appropriate visualization.

This structure allows new algorithms to reuse the general visualization framework without forcing fundamentally different algorithms into the same internal representation.

```tsx
function Algorithm() {
    // State that tracks whether the input or output mode/tab is active
    const [modeState, setModeState] = useState<"input" | "output">("input");
    // State that holds the input from the user
    const [input, setInput] = useState<ExampleInput>(...);
    // State that holds the calculated algorithm intermediate states
    const [steps, setSteps] = useState<ExampleStep[]>([]);
    // States that hold the discrete and continuous animation progress
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Requests the backend to calculate the intermediate states for the given input
    const fetchIntermediateAlgorithmStates =
        async (input: ExampleInput) => {
            const steps = await getExampleSteps(input);
            setSteps(steps);
        };

    // Handles the switch from the input to the output tab
    const handleSubmit = async () => {
        setProgress(0);
        setCurrentStepIndex(0);
        await fetchIntermediateAlgorithmStates(input);
        setModeState("output");
    };

    // Similar to handleSubmit, but restores input and progress from an export string
    const handleImport = async (encoded: string) => {
        try {
            const imported: ExportState = decodeExportState(encoded);
            if (imported.algorithm !== "exampleAlgorithm") return;
            setProgress(imported.progress);
            await fetchIntermediateAlgorithmStates(imported.input);
            setModeState("output");
        } catch (error) {
            console.error("Invalid import string", error);
        }
    };

    // Props that are shared by common output subcomponents
    const cProps: CommonOutputProps = {
        progress,
        setProgress,
        currentStepIndex,
        setCurrentStepIndex,
        onChangeInput:
            () => setModeState("input"),
        ...
    };

    // Renders either the input or output component depending on the active mode
    return modeState === "input"
        ? <Input ... />
        : <Output
            steps={steps}
            cProps={cProps}
        />;
}
```

```tsx
function ExampleOutput(props: OutputProps) {
    // State that tracks whether the animation is currently auto-playing
    const [isPlaying, setIsPlaying] = useState(false);

    // Reference to the GSAP timeline used by the animation and the shared OutputControls
    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());

    // In this example, one timeline step corresponds directly to one backend intermediate state
    const labels = useMemo(
        () => createStepLabels(props.steps.length),
        [props.steps.length]
    );

    useGSAP(() => {
        // The GSAP timeline contains all algorithm animations in their execution order
        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut"
            },

            /*
             * onUpdate runs whenever the timeline position changes, for example
             * during autoplay, scrubbing, or step navigation.
             *
             * progress stores the continuous position in the complete animation.
             * getCurrentTimelineStepIndex maps the current timeline time to the
             * latest reached label and therefore to a discrete visualization step.
             *
             * This keeps continuous and discrete animation progress synchronized.
             */
            onUpdate: () => {
                const tl = timelineRef.current;

                props.cProps.setProgress(tl.progress());

                const currentStepIndex =
                    getCurrentTimelineStepIndex(tl, labels);

                props.cProps.setCurrentStepIndex(currentStepIndex);
            },

            // Synchronizes the React state when the animation reaches its end
            onComplete: () => {
                props.cProps.setProgress(1);
                setIsPlaying(false);
                timelineRef.current.pause();
            }
        });
        
        /*
         * Add the algorithm-specific transitions to the timeline.
         *
         * Each backend step describes a stable target state.
         * The animation transforms the previous state into the target state.
         */
        timelineSteps.forEach((targetStep, stepIndex) => {
            //... 
            
            /*
             * The label marks the point at which the target visualization state
             * has been fully reached.
             *
             * Labels connect the continuous GSAP timeline with the discrete
             * algorithm steps and are also used by OutputControls for navigation.
             */
            timeline.addLabel(labels[stepIndex]);
        });

        // Store the timeline so callbacks and shared OutputControls can access it
        timelineRef.current = timeline;

        /*
         * Restore the animation position.
         *
         * Normally progress is 0. After importing a saved state, it contains the
         * previously exported animation progress.
         *
         * Moving the timeline to this position triggers onUpdate, which derives
         * the corresponding discrete currentStepIndex.
         */
        timeline.progress(props.cProps.progress).pause();

        setIsPlaying(false);

        // Clean up the timeline when new output is loaded or the component unmounts
        return () => {
            timeline.kill();
            timelineRef.current = gsap.timeline({paused: true});
        };
    }, {
        dependencies: [props.steps]
    });

    // Backend step representing the currently reached stable visualization state
    const currentTimelineStep = timelineSteps[props.cProps.currentStepIndex];
    return (
        <div className="algorithm-panel">
            {/* Shared navigation between the input and output views */}
            <IOModeTabs
                mode="output"
                onChangeInput={props.cProps.onChangeInput}
                onSubmit={() => {}}
                canSubmit={false}
            />

            {/* Algorithm-specific SVG elements manipulated by the GSAP timeline */}
            <svg
                className="algorithm-canvas"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Algorithm-specific visualization elements ... */}
            </svg>

            {/*
             * Shared controls operate on the GSAP timeline.
             *
             * Play/Pause controls timeline playback.
             * Next/Previous navigate to timeline labels.
             * The scrubber changes timeline.progress().
             *
             * Any resulting timeline movement is synchronized back to React
             * through the timeline's onUpdate callback.
             */}
            <OutputControls
                timelineRef={timelineRef}
                labels={labels}
                currentStep={props.cProps.currentStepIndex}
                setCurrentStep={props.cProps.setCurrentStepIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                progress={props.cProps.progress}
                setProgress={props.cProps.setProgress}
            />

            <div className="step-layout">
                <div className="step-layout-side">
                    {/* Algorithm-specific information about the current step */}
                    <Legend
                        step={currentTimelineStep}
                        currentStepIndex={props.cProps.currentStepIndex}
                        totalSteps={props.steps.length - 1}
                    />

                    <div className="step-layout-actions">
                        <ImportExportDialog
                            onImport={props.cProps.onImport}
                            createExportString={props.cProps.createExportString}
                        />
                    </div>
                </div>

                {/*
                 * The panel itself is shared.
                 * Only the pseudocode and the mapping from algorithm steps to
                 * highlighted line IDs are algorithm-specific.
                 */}
                <PseudoCodePanel
                    lines={EXAMPLE_PSEUDOCODE}
                    activeLineIds={
                        getActivePseudoCodeLineIds(
                            pseudoCodeStep.stepType
                        )
                    }
                />
            </div>
        </div>
    );
}
```