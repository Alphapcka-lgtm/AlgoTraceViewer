# AlgoTraceViewer

**AlgoTraceViewer** is an interactive web application for exploring algorithms step by step through visual animations.

Instead of only showing the final result, the application exposes relevant intermediate states and visualizes how the algorithm progresses from its input to its result. In the adjacent pseudocode panel, the currently relevant code lines are highlighted. Users can navigate through individual steps, play the complete execution, change the playback speed, or move freely through the timeline.

Animation states can be shared through export strings and restored through the import function. Inputs can also be saved as presets.

The project currently contains visualizations for:

- **Closest Pair:** finds the closest pair of points in two dimensions using a sweep-line algorithm.
- **Vertex Cover:** visualizes different approaches for computing a vertex cover of a graph.
- **Ehrlich Swaps:** generates permutations of distinct elements using Ehrlich's swap method.
- **Suffix Array / SA-IS:** visualizes the construction of a suffix array using induced sorting.

---

## Technologies

| Frontend | Backend |
|---|---|
| React 19 | Java 25 |
| TypeScript | Spring Boot 4 |
| Vite | Spring Web / Spring MVC |
| GSAP | Maven |
| React Router | Lombok |
| Lucide React | |

The application can be built and deployed as a Docker image. In production, the compiled frontend is served as static content by Spring Boot.

---

## Project Structure

```text
.
├── frontend/
│   └── src/
│       ├── closestPair/
│       ├── vertexCover/
│       ├── ehrlichSwaps/
│       ├── sais/
│       └── shared/
├── backend/
│   └── src/main/java/
├── Dockerfile
├── build.sh
└── run.sh
```

Algorithm-specific frontend code is grouped by algorithm. Reusable UI and animation infrastructure is located in `frontend/src/shared`.

A frontend algorithm module usually follows this structure:

```text
algorithm/
├── Algorithm.tsx
├── Api.ts
├── input/
│   └── Input.tsx
├── output/
│   ├── Output.tsx
│   ├── PseudoCode.ts
│   └── ...
└── shared/
    ├── Types.ts
    └── ...
```

The exact structure differs slightly between algorithms because their inputs, intermediate states, and visualizations are different.

---

## Architecture

### General Application Flow

Although the algorithms operate on different data structures, they follow the same basic flow:

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

The backend computes the algorithm and records relevant intermediate states. The frontend turns these states into an interactive visualization.

### Frontend

A frontend algorithm module is usually split into four main responsibilities:

- `Algorithm.tsx` coordinates input, output, backend requests, and shared animation state.
- `input/` contains the algorithm-specific input UI.
- `Api.ts` communicates with the corresponding backend endpoint.
- `output/` converts the returned intermediate states into a visual animation.

The main algorithm component typically stores the current input, backend output, active input/output tab, discrete animation step, and continuous animation progress.

When the user starts an algorithm, the frontend sends the input to the backend, stores the returned intermediate states, resets the animation state, and switches to the output view.

### Backend

The backend is a Spring Boot application that exposes REST endpoints for the different algorithms.

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
DTO / Animation Response
     │
     ▼
JSON Response
```

Controllers handle the HTTP request and pass the input to the algorithm-specific service or implementation. The algorithm performs the computation and records intermediate states that are needed by the frontend.

The backend intentionally returns more than the final result because the frontend needs these states to reconstruct the execution visually.

### Animation Model

For the GSAP-based visualizations, the output component builds a timeline from the intermediate states. Once created, this timeline becomes the central source for animation playback and navigation.

```text
Backend States
      │
      ▼
Output Component
      │
      ▼
GSAP Timeline
      │
      ├────────────► OutputControls
      │
      └─ onUpdate
            │
            ├── progress
            └── currentStepIndex
                    │
                    ├── Legend / Step Info
                    └── Pseudocode
```

Timeline labels connect the continuous GSAP timeline with discrete visualization steps.

```text
0s              1.4s              3.1s
│                 │                 │
▼                 ▼                 ▼
Label 0         Label 1           Label 2
│                 │                 │
▼                 ▼                 ▼
Step 0          Step 1            Step 2
```

A **timeline step** represents a discrete, stable visualization state. One backend state may map to one or multiple timeline steps.

For Closest Pair, the backend intermediate states already have the same granularity as the frontend timeline steps, so the mapping is one-to-one. Vertex Cover and Ehrlich Swaps split one backend state into multiple visualization steps when several operations should be shown separately.

### Timeline Synchronization

Two React states connect the GSAP timeline with the rest of the UI:

- `progress` represents the continuous position of the complete timeline in the range `[0, 1]`.
- `currentStepIndex` represents the latest discrete visualization step reached by the timeline.

Whenever the timeline position changes, GSAP runs `onUpdate`.

```text
timeline.progress()
        │
        ▼
     progress

timeline.time()
        │
        ▼
compare with labels
        │
        ▼
currentStepIndex
```

`getCurrentTimelineStepIndex` compares the current timeline time with the label positions and returns the latest reached step. This keeps the animation, step information, and highlighted pseudocode synchronized.

### Output Controls

`OutputControls` is shared between algorithms and does not need to understand algorithm-specific data. It operates on the GSAP timeline and its labels.

- Play / Pause → starts or pauses the timeline.
- Next / Previous → moves to the neighboring timeline label.
- Scrubbing → changes `timeline.progress(...)`.
- Reset → moves the timeline back to the beginning.

For example, moving to the next step works like this:

```text
Next
 │
 ▼
Determine next label
 │
 ▼
GSAP tweenTo(label)
 │
 ▼
Timeline moves
 │
 ▼
onUpdate
 │
 ▼
progress + currentStepIndex
 │
 ▼
React UI updates
```

The controls change the timeline first. The timeline then updates the React state through `onUpdate`.

### Shared Frontend Components

Important shared components include:

- `OutputControls.tsx` – controls playback and timeline navigation.
- `IOModeTabs.tsx` – switches between input and output views.
- `PseudoCodePanel.tsx` – renders pseudocode and highlighted lines.
- `ImportExportDialog.tsx` – shares and restores visualization states.
- `PresetSelect.tsx` – loads and stores reusable inputs.
- `AlgorithmOverviewBox.tsx` – shows general information about an algorithm.

Algorithm-specific rendering, animation logic, and data should stay inside the corresponding algorithm module.

---

## Presets and Import / Export

### Presets

Presets store reusable algorithm inputs and are persisted by the backend.

```text
GET  /api/presets/{algorithm}
POST /api/presets/{algorithm}
```

Preset data is stored in `backend/data/presets.json`.

### Import / Export

Export strings store the algorithm input together with the current animation progress. Importing the string restores the input, recalculates the intermediate states, and moves the new timeline to the saved progress.

```text
Export
  │
  ├── algorithm
  ├── input
  └── progress
```

This allows users to share a visualization state without storing the complete GSAP timeline.

---

## Development

### Frontend

From the `frontend` directory:

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

The generated files are written to `frontend/dist/`.

### Backend

From the `backend` directory:

```bash
./mvnw clean package
```

Start the backend with:

```bash
./mvnw spring-boot:run
```

### Docker

The repository contains a `Dockerfile` and helper scripts for building and running the complete application.

```text
Frontend build
      │
      ▼
frontend/dist
      │
      ▼
Spring Boot static resources
      │
      ▼
Backend build
      │
      ▼
Docker image
```

Build the application and Docker image with:

```bash
make build
```

Run the image with:

```bash
make run
```

The application is then available on port `8080`.

In production, React does not run as a separate server. The built frontend files are included in the Spring Boot application and served as static resources.

---
## Adding a New Algorithm

A new algorithm usually requires these steps:

1. Define the frontend input and output types.
2. Implement the backend algorithm and record relevant intermediate states.
3. Add the backend endpoint.
4. Add the frontend API request.
5. Implement the algorithm-specific input component.
6. Map backend states to timeline steps if needed.
7. Build the GSAP timeline in the output component.
8. Reuse the shared controls, pseudocode panel, presets, and import/export infrastructure.

The main distinction is between **shared visualization infrastructure** and **algorithm-specific behavior**. Shared components handle navigation, playback, progress, pseudocode rendering, presets, and import/export. Each algorithm defines its own input, backend states, visual elements, and transitions.

### Example Algorithm Component

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

### Example Output Component
This simplified example uses a one-to-one mapping between backend states and timeline steps. Some algorithms create several timeline steps from one backend state instead.

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