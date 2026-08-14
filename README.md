# AlgoTraceViewer

**AlgoTraceViewer** is an interactive web application for exploring algorithms step by step through visual animations.

Instead of only showing the final result of an algorithm, the application exposes relevant intermediate states and visualizes how the algorithm progresses from its input to its result. Users can navigate through individual steps, play the complete execution as an animation, change the playback speed, or move freely through the timeline.

The project currently contains visualizations for:

- **Closest Pair** – finds the closest pair of points in two dimensions using a sweep-line algorithm.
- **Vertex Cover** – visualizes different approaches for computing a vertex cover of a graph.
- **Ehrlich Swaps** – generates permutations of distinct elements using Ehrlich's swap method.
- **Suffix Array / SA-IS** – visualizes the construction of a suffix array using induced sorting.

---

## Technologies

AlgoTraceViewer consists of a React frontend and a Spring Boot backend.

### Frontend

- **React 19**
- **TypeScript**
- **Vite**
- **GSAP** and `@gsap/react` for animations
- **React Router** for navigation
- **Lucide React** for icons
- CSS for styling and algorithm-specific visualizations

### Backend

- **Java 25**
- **Spring Boot 4**
- **Spring Web / Spring MVC**
- **Jakarta Validation**
- **Maven**
- **Lombok**

### Deployment

- **Docker**
- Multi-stage Docker build
- The production frontend is served as static content by the Spring Boot application

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

The main algorithm component acts as the connection between input and output.

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

For the GSAP-based visualizations, a timeline is created from the intermediate algorithm states.

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

For example, a single algorithm iteration can be divided into several visual phases. This is used in Vertex Cover and Ehrlich Swaps to show individual operations of an iteration separately.

---

## Timeline Synchronization

The current GSAP timeline position is synchronized with React state.

The important shared states are:

```text
progress
```

for the continuous position in the complete animation, and:

```text
currentStepIndex
```

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

There is also a separate:

```text
PresetController
```

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

Preset data is stored in:

```text
backend/data/presets.json
```

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

A production frontend build can be created with:

```bash
npm run build
```

The resulting files are written to:

```text
frontend/dist/
```

---

## Backend Development

From the `backend` directory, the Spring Boot application can be built with Maven:

```bash
./mvnw clean package
```

and started with:

```bash
./mvnw spring-boot:run
```

---

# Docker

The repository contains a `Dockerfile` as well as helper scripts for building and running the complete application.

The provided:

```text
build.sh
```

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

Afterwards, the Docker image is built:

```bash
docker build -t my-app .
```

The provided helper script:

```bash
./run.sh
```

runs the image with:

```bash
docker run -p 8080:8080 my-app
```

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
