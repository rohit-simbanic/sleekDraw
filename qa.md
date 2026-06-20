# sleekDraw - 150 Project Ownership Interview Questions & Answers

This document contains 150 detailed questions and answers designed to verify deep technical ownership of the `sleekDraw` application. The questions are structured around architectural decisions, rendering mechanics, mathematical calculations, collaboration synchronization, state design, and security patterns.

---

## Category 1: Application Architecture, Layout, & Simple Routing (1 - 15)

### Q1: How is the routing handled in sleekDraw? Does it use React Router or a custom mechanism?
**Answer:**
The routing in sleekDraw is a custom, lightweight hash-based router implemented directly in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L37-L80). It does not use `react-router-dom`. It monitors the `window.location.hash` and maintains a React state called `currentView` which can be `'landing'`, `'canvas'`, or `'404'`.
```typescript
const [currentView, setCurrentView] = useState<'landing' | 'canvas' | '404'>(() => {
  const pathname = window.location.pathname;
  const hash = window.location.hash;

  if (pathname !== '/' && pathname !== '/index.html') {
    return '404';
  }
  if (!hash || hash === '#' || hash === '#/') {
    return 'landing';
  }
  if (hash === '#draw' || hash.match(/#room=([a-zA-Z0-9_-]+)&key=([a-fA-F0-9]{32})/)) {
    return 'canvas';
  }
  return '404';
});
```

---

### Q2: How does the application listen to hash changes to update the view reactively?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L60-L80), an effect hook adds a listener for the `hashchange` event on the global `window` object. On change, it repeats the route matching logic and updates `currentView`. The listener is cleaned up when the component unmounts.
```typescript
useEffect(() => {
  const handleHashChange = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    // ... matching logic ...
    setCurrentView(nextView);
  };
  window.addEventListener('hashchange', handleHashChange);
  return () => window.removeEventListener('hashchange', handleHashChange);
}, []);
```

---

### Q3: Why is body overflow handled dynamically in the app based on the active view?
**Answer:**
To create an immersive canvas experience, the drawing interface needs to occupy exactly the viewport bounds without triggering standard browser scrolling. In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L83-L89), when the user is in the `'canvas'` view, `document.body.style.overflow` is set to `'hidden'`. For the `'landing'` page and `'404'` page, it is set back to `'auto'` to allow standard page scrolling.

---

### Q4: How is the random peer color selected for the active user session?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L27), a random color is selected from `PEER_COLORS` (defined in [constants.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/constants.ts)) on initialization:
```typescript
const myColor = PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)];
```
This is a static variable at the module level, meaning it is selected once per browser load session.

---

### Q5: How do the collapsable sidebar states behave when the screen is resized to mobile viewport widths?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L199-L202) and [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L548-L558), the app detects mobile status if `window.innerWidth <= 768`. It mounts an event listener on `resize` to force-collapse both the left sidebar (`setIsLeftSidebarOpen(false)`) and the right sidebar (`setIsRightSidebarOpen(false)`) to protect screen real estate on mobile devices.

---

### Q6: What determines the document cursor style when the spacebar key is pressed?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L838-L846), the canvas cursor property is set dynamically:
```typescript
cursor: isSpacePressed
  ? (action === 'panning' ? 'grabbing' : 'grab')
  : action === 'panning'
  ? 'grabbing'
  : appState.activeTool === 'selection'
  ? 'default'
  : 'crosshair'
```
Holding down the spacebar shows a `grab` cursor, indicating to the user that they can click and drag to pan the viewport.

---

### Q7: Where are the available peer colors defined, and what styling standard do they follow?
**Answer:**
The peer colors are defined in [constants.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/constants.ts#L10) as a list of hex string colors:
```typescript
export const PEER_COLORS = [
  '#ec4899', '#f43f5e', '#e11d48', '#d946ef', '#c084fc', 
  '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', 
  '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16'
];
```
They represent a selection of Tailwind-like vibrant colors designed to be visible against both dark and light canvas themes.

---

### Q8: What does the fallback route do if a user enters a path like `/about` or an invalid hash?
**Answer:**
The custom router checks if `window.location.pathname !== '/'` and if so, immediately falls back to `'404'` view, rendering the `NotFound` component. If the path is correct but the hash is unknown (not landing, solo drawing, or room collab format), it also falls back to `'404'`.

---

### Q9: Where does the app store global configuration variables like the WebSocket server URL?
**Answer:**
The server url is stored in [constants.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/constants.ts#L2-L4):
```typescript
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
```
This allows the backend target server to be configured via environmental variables during building/deployment (e.g. on Vercel).

---

### Q10: How does the application prevent browser scroll bars from flashing when transitioning between views?
**Answer:**
By wrapping the route checking and layout transitions inside standard React state updates and binding them with `useEffect` (for overflow changes) and responsive css style resets, the browser immediately swaps views and updates style attributes (`overflow: hidden` or `overflow: auto`) concurrently with mounting components.

---

### Q11: Explain the purpose of `SpacebarHint.tsx` and how it is rendered.
**Answer:**
`SpacebarHint.tsx` is a small floating UI overlay helper component that shows up on the canvas view. It instructs users that they can hold down `Space` to pan. It is rendered conditionally in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L899) and styled with glassmorphism using the `.spacebar-hint` class in CSS.

---

### Q12: How are confirmation actions structured so that modal state is clean?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L175-L186), a custom state `confirmModalConfig` is used to hold the `{ title, message, onConfirm }` callback payload. Calling `showConfirm` opens the modal. When the user selects "Confirm" inside `ConfirmModal`, `onConfirm()` is triggered and the modal state is reset to closed.

---

### Q13: Describe the structure of the CSS files in this project.
**Answer:**
The styling system consists of three main files:
1. `index.css`: Defines CSS variables, resets, custom fonts (Outfit), dark mode values, glassmorphism rules, toolbar layout, and layout overlays.
2. `landing.css`: Contains keyframe animations, CTA designs, gradient text transitions, and grid layouts for the Landing home page.
3. `App.css`: Defines general application layout wrappers.

---

### Q14: How does the header component handle mobile toggle responsiveness?
**Answer:**
In [Header.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/components/landing/Header.tsx), there is a mobile menu state `mobileMenuOpen` controlled via a toggle button. When clicked, it renders a drop-down backdrop containing links to drawing solo, rooms, and github repository details.

---

### Q15: How does the backdrop utility behave on mobile screens when any sheet sidebar is active?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L859-L869), if either the left sidebar or the right sidebar is open and the screen size is mobile (`window.innerWidth <= 768`), a full-screen div with class `sheet-backdrop` is overlayed underneath the sidebars. Clicking this backdrop closes both sidebars immediately.

---

## Category 2: Canvas Rendering Mechanics (Rough.js & 2D Context) (16 - 35)

### Q16: How is high-DPI/Retina display blurriness resolved in sleekDraw?
**Answer:**
It is resolved by scaling the canvas coordinate grid using the device pixel ratio (`window.devicePixelRatio`). In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L343-L355), the handler adjusts both the logical dimensions and CSS size:
```typescript
const dpr = window.devicePixelRatio || 1;
canvasRef.current.width = window.innerWidth * dpr;
canvasRef.current.height = window.innerHeight * dpr;
canvasRef.current.style.width = `${window.innerWidth}px`;
canvasRef.current.style.height = `${window.innerHeight}px`;
```
And inside [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L229-L230), the 2D context is scaled before drawing:
```typescript
ctx.scale(dpr, dpr);
```

---

### Q17: What does the main `drawScene` redraw cycle do to paint the frame?
**Answer:**
In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L215-L288), `drawScene` performs these steps:
1. Clears the canvas via `ctx.clearRect`.
2. Saves context state, scales by `dpr`, applies the pan offsets (`pan.x`, `pan.y`), and scales by `zoom`.
3. Filters visible elements via viewport culling bounds check.
4. Renders visible canvas elements.
5. Renders peer elements' active selections.
6. Renders user's selection outlines and drag boxes.
7. Renders peer live cursors and name tag boxes.
8. Restores context state.

---

### Q18: What is viewport culling, and how is it calculated in `drawScene`?
**Answer:**
Viewport culling prevents rendering elements that are completely outside the visible screen region. In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L236-L240), it calculates the visible world coordinate box:
```typescript
const viewportMinX = -appState.pan.x / appState.zoom;
const viewportMinY = -appState.pan.y / appState.zoom;
const viewportMaxX = (canvas.width / dpr - appState.pan.x) / appState.zoom;
const viewportMaxY = (canvas.height / dpr - appState.pan.y) / appState.zoom;
```
For each element, it gets the absolute bounding box. If the element bounds do not intersect this viewport box, `isVisible` is false, and the element render call is skipped.

---

### Q19: Why does sleekDraw use a fixed seed for Rough.js options when drawing elements?
**Answer:**
Rough.js utilizes a random jitter algorithm to make shapes look hand-drawn. If the shapes were rendered with completely random paths on every frames, the drawing lines would constantly wiggle ("shake") whenever the user zoomed, panned, or moved a peer cursor. Setting a static `seed: 42` (in [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L15)) ensures that the math coordinates jitter exactly the same way on every redraw, keeping the lines stable.

---

### Q20: How does `drawElement` apply opacity to shapes dynamically?
**Answer:**
In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L6-L7), it saves the context state and sets `ctx.globalAlpha`:
```typescript
ctx.save();
ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;
```
After drawing the element using Rough.js or standard text contexts, `ctx.restore()` is executed to reset the alpha for subsequent rendering.

---

### Q21: How are dashed and dotted lines rendered with Rough.js?
**Answer:**
They are rendered by modifying the `strokeLineDash` parameter inside Rough.js options. In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L19-L23):
```typescript
if (el.strokeStyle === 'dashed') {
  options.strokeLineDash = [8 * el.strokeWidth, 6 * el.strokeWidth];
} else if (el.strokeStyle === 'dotted') {
  options.strokeLineDash = [2 * el.strokeWidth, 4 * el.strokeWidth];
}
```
This scales the dash sizes relative to the stroke width.

---

### Q22: How is the 'hachure' fill style calculated and drawn?
**Answer:**
Hachure is a cross-hatching fill style supported natively by Rough.js. In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L29-L32), the hachure properties are defined as options passed to Rough.js:
```typescript
options.fill = el.fillColor;
options.fillStyle = el.fillStyle; // 'hachure'
if (el.fillStyle === 'hachure') {
  options.hachureAngle = 60;
  options.hachureGap = 5 + el.strokeWidth * 2;
}
```
This forces the hatching lines to run at a $60^\circ$ angle with spacing that increases proportionally with the stroke width.

---

### Q23: How are arrows rendered? Explain the calculation of arrowheads.
**Answer:**
Arrows are drawn in [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L57-L82). First, the main shaft is drawn as a linear path. Next, it identifies the last two points of the arrow points array to determine the vector angle:
```typescript
const angle = Math.atan2(y2 - y1, x2 - x1);
const headLength = 12 + el.strokeWidth * 2;
const t1x = x2 - headLength * Math.cos(angle - Math.PI / 6);
const t1y = y2 - headLength * Math.sin(angle - Math.PI / 6);
const t2x = x2 - headLength * Math.cos(angle + Math.PI / 6);
const t2y = y2 - headLength * Math.sin(angle + Math.PI / 6);
```
It then renders two hand-drawn Rough.js lines from the arrowhead tip `(x2, y2)` to the two wings `(t1x, t1y)` and `(t2x, t2y)`.

---

### Q24: Why is the freehand pencil stroke drawing setup different from other shapes in `drawElement`?
**Answer:**
Freehand lines (pencil tool) shouldn't support fills, otherwise the browser will fill the irregular, unclosed shape contours. In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L84-L93), the options are customized:
```typescript
rc.linearPath(absolutePoints, {
  ...options,
  fill: undefined, // freehand stroke shouldn't fill
  roughness: 0.5   // lower roughness looks smoother for mouse tracks
});
```

---

### Q25: How is text rendering styled on the 2D canvas context?
**Answer:**
Because Rough.js does not render font glyphs, text is rendered using standard canvas 2D API context calls in [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L95-L108):
```typescript
ctx.font = `bold ${20}px Outfit, sans-serif`;
ctx.fillStyle = el.strokeColor;
ctx.textBaseline = 'top';

const lines = el.text.split('\n');
const lineHeight = 24;
lines.forEach((line, index) => {
  ctx.fillText(line, el.x, el.y + index * lineHeight);
});
```

---

### Q26: How are multiple lines of text rendered on the canvas?
**Answer:**
Multiple lines are handled by splitting the text value by newline characters (`\n`). In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L102-L106), the code iterates through each line and calculates a cumulative vertical offset matching the line height (24px) multiplied by the line index, passing it to `ctx.fillText`.

---

### Q27: How does the application render selection boxes for active clients?
**Answer:**
In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L161-L173), selection boxes are drawn directly on the canvas context with a semi-transparent blue filling (`rgba(99, 102, 241, 0.05)`) and outline (`rgba(99, 102, 241, 0.4)`):
```typescript
const x = Math.min(box.start.x, box.end.x);
const y = Math.min(box.start.y, box.end.y);
const w = Math.abs(box.start.x - box.end.x);
const h = Math.abs(box.start.y - box.end.y);
ctx.fillRect(x, y, w, h);
ctx.strokeRect(x, y, w, h);
```

---

### Q28: How is a peer cursor drawn on the canvas, and how does its visibility scale?
**Answer:**
In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L176-L212), a peer cursor is drawn as a filled triangle path followed by a username text container. To ensure the labels and pointers remain legible at extreme zoom levels, the dimensions of the cursor components (e.g., triangle lines, label padding, text size) are divided by `zoom`:
```typescript
ctx.lineTo(cx + 12 / zoom, cy + 12 / zoom);
ctx.lineTo(cx + 4 / zoom, cy + 14 / zoom);
// ...
ctx.font = `${10 / zoom}px Outfit, sans-serif`;
```

---

### Q29: What happens when the canvas background color changes? How is the grid background painted?
**Answer:**
The grid dots background pattern is created using an inline SVG CSS variable in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L812-L821). The SVG dot fill color changes dynamically:
```typescript
backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='1.5' cy='1.5' r='1.2' fill='${
  isLightTheme(appState.canvasBackgroundColor)
    ? 'rgba(0, 0, 0, 0.12)'
    : 'rgba(255, 255, 255, 0.08)'
}'/></svg>")`
```
Dark backgrounds display translucent white dots, and light backgrounds display dark dots.

---

### Q30: How does the application trigger redrawing, and how is it optimized?
**Answer:**
The redraw is controlled by an effect hook in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L797-L799) that fires whenever elements, local appState, peer cursors, or selection box bounds change. It uses React state updates to refresh the UI immediately without blocking.

---

### Q31: How is the canvas cleared?
**Answer:**
In [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L777-L788), `clearCanvas` prompts the user. If they confirm, it updates the elements array using the `updateElementsList` callback, mapping all current elements to `isDeleted: true`. This preserves history and triggers sync updates.

---

### Q32: How are selected elements highlighted on the canvas?
**Answer:**
In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L115-L141), a dashed indigo outline box is drawn around the selected elements' outer boundaries. In addition, white resize squares are drawn at key anchor coordinates based on the bounds computed from `getResizeHandles`.

---

### Q33: How does the app display peer selection outlines?
**Answer:**
In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L144-L158), `drawPeerSelectionOutline` draws a dashed outline box colored with the peer's custom workspace color. It does not draw edit handles for peers.

---

### Q34: What is the purpose of `ctx.save()` and `ctx.restore()` in `drawElement`?
**Answer:**
Drawing elements modifies canvas properties such as `globalAlpha`, `strokeStyle`, and font declarations. Wrapping each draw operation inside `save()` and `restore()` ensures these parameters are reset so they do not interfere with subsequent elements.

---

### Q35: How does the canvas scale its drawing contexts to match zoom values?
**Answer:**
In [renderer.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/renderer.ts#L233-L234), zoom is applied directly to the 2D context matrix:
```typescript
ctx.translate(appState.pan.x, appState.pan.y);
ctx.scale(appState.zoom, appState.zoom);
```
This handles scaling automatically for all subsequent operations.

---

## Category 3: Canvas Interaction, State Machines, & Touch Support (36 - 60)

### Q36: Describe the interaction states managed in `useCanvasInteraction.ts`.
**Answer:**
The interaction state is tracked using the `action` variable, which can be:
* `'none'`: Resting state.
* `'drawing'`: Drawing a shape.
* `'panning'`: Dragging the canvas.
* `'moving'`: Moving selected elements.
* `'resizing'`: Resizing a shape.
* `'selection-box'`: Selecting multiple elements with a selection box.

---

### Q37: How is spacebar panning initiated?
**Answer:**
Spacebar panning is initiated by key down/up listeners in [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L790-L820) which update `isSpacePressed`. When mouse click triggers with `isSpacePressed = true`, `action` is set to `'panning'`.

---

### Q38: How are mouse coordinates converted to world coordinates?
**Answer:**
Coordinates must be adjusted for zoom and pan. This is handled by `screenToWorld` in [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L65-L70):
```typescript
const screenToWorld = (clientX: number, clientY: number): Point => {
  return {
    x: (clientX - appState.pan.x) / appState.zoom,
    y: (clientY - appState.pan.y) / appState.zoom
  };
};
```

---

### Q39: What triggers the `'moving'` interaction state?
**Answer:**
In [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L117-L121), clicking on an element in selection mode triggers the moving state:
```typescript
const hitElement = getElementAtPosition(worldPoint.x, worldPoint.y, elements);
if (hitElement) {
  setAction('moving');
  dragStart.current = worldPoint;
  originalElementsRef.current = JSON.parse(JSON.stringify(elements));
  // ...
}
```

---

### Q40: How does sleekDraw handle multi-selection dragging?
**Answer:**
When dragging starts, the initial positions of all elements are cloned in `originalElementsRef.current`. On mouse move, the offset delta is applied to all selected elements, updating their positions relative to their starting positions.

---

### Q41: How is a selection drag box managed during mouse moves?
**Answer:**
If the selection click hits empty space, the state is set to `'selection-box'` and `selectionBox` coordinates are updated in [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L251-L265). It then checks for intersecting elements and updates `appState.selectedElementIds`.

---

### Q42: How are click handlers structured on elements when holding control/meta keys?
**Answer:**
In [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L125-L138), holding `ctrlKey` or `metaKey` toggles selection state instead of overwriting it:
```typescript
if (e.ctrlKey || e.metaKey) {
  setAppState(prev => ({
    ...prev,
    selectedElementIds: {
      ...prev.selectedElementIds,
      [hitElement.id]: !isAlreadySelected
    }
  }));
}
```

---

### Q43: How is a shape resize operation handled?
**Answer:**
When clicking a resize handle, `action` is set to `'resizing'`. On mouse move, the dimensions of the resizing element are updated in [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L293-L370) based on the active handle (e.g., `'BR'`, `'TL'`, `'TR'`).

---

### Q44: How are freehand pencil coordinates finalized?
**Answer:**
Freehand drawings collect cursor paths relative to the starting point. When drawing ends, `finalizeElement` in [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L423-L460) calculates the bounding box, adjusts coordinate offsets, and updates the element bounds.

---

### Q45: How is text editing triggered on the canvas?
**Answer:**
Clicking on an existing text element or clicking empty canvas space with the text tool active sets `editingTextElement` to that element, which mounts a hidden text editor in the UI.

---

### Q46: Describe the text editor component.
**Answer:**
[TextEditor.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/components/TextEditor.tsx) renders a textarea input positioned over the canvas coordinates using the element's position, zoom, and pan offsets.

---

### Q47: How does text sizing adjust dynamically when text editing is committed?
**Answer:**
In [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L714-L726), a temporary 2D canvas context calculates the text dimensions:
```typescript
const ctx = canvas?.getContext('2d');
if (ctx) {
  ctx.font = 'bold 20px Outfit, sans-serif';
  const lines = trimmedValue.split('\n');
  textHeight = lines.length * 24;
  lines.forEach(l => {
    textWidth = Math.max(textWidth, ctx.measureText(l).width);
  });
}
```

---

### Q48: How are empty text inputs handled when text editing is committed?
**Answer:**
In [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L711-L713), if the trimmed value is empty, the element is filtered out of the active list.

---

### Q49: What touch events are supported?
**Answer:**
sleekDraw supports standard touch events: `onTouchStart`, `onTouchMove`, and `onTouchEnd` on the canvas element.

---

### Q50: How is pinch-to-zoom calculated for touch devices?
**Answer:**
When two touches are detected, it calculates the distance between the two touches and scales zoom accordingly:
```typescript
const scale = newDist / lastPinchDistRef.current;
const newZoom = Math.min(10, Math.max(0.05, prev.zoom * scale));
```
It then adjusts the panning offsets to keep the pinch midpoint fixed in world space.

---

### Q51: How does touch panning work?
**Answer:**
Single-finger touch on empty canvas space sets the action to `'panning'`, allowing the user to drag and pan the canvas view.

---

### Q52: What is the purpose of `e.preventDefault()` in touch handlers?
**Answer:**
It prevents browser scrolling and zooming actions from firing while interacting with the canvas drawing surface.

---

### Q53: How does the scroll wheel handle zooming?
**Answer:**
Zooming is handled by listening to canvas wheel scroll events in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L304-L336). When scroll triggers with `ctrlKey` pressed, it updates zoom level and centers zoom on the cursor position.

---

### Q54: How are keyboard listeners bound and cleaned up?
**Answer:**
Keyboard listeners are bound using standard React `useEffect` hooks in [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L790-L845). They clean up listeners on component unmount to prevent memory leaks.

---

### Q55: How does the 'Delete' shortcut remove elements?
**Answer:**
It calls `deleteSelectedElements` in [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L765-L775) which marks selected elements as `isDeleted: true` and clears the selection list.

---

### Q56: What happens when the user clicks empty space in selection mode?
**Answer:**
It clears the selected elements list (`selectedElementIds: {}`) and starts a selection box drag.

---

### Q57: How is the grab cursor managed when dragging?
**Answer:**
Clicking down sets `action = 'panning'` and updates the cursor to `grabbing`. Releasing the mouse button sets `action = 'none'` and updates the cursor to `grab` if the spacebar is still pressed.

---

### Q58: How does the toolbar prevent clicks from bubbling to the canvas?
**Answer:**
Floating UI panels are rendered outside the canvas element. Since event listeners are bound directly to the `<canvas>` element rather than global window targets, clicks on panels do not bubble down to the canvas.

---

### Q59: How are freehand pencil strokes scaled during resize actions?
**Answer:**
In [useCanvasInteraction.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCanvasInteraction.ts#L344-L351), the relative points are scaled proportionally during resizing:
```typescript
const scaleX = newW / el.width;
const scaleY = newH / el.height;
scaledPoints = el.points.map(p => ({
  x: p.x * scaleX,
  y: p.y * scaleY
}));
```

---

### Q60: How does text input handle newline inputs during typing?
**Answer:**
The Text Editor uses a standard `<textarea>` element, which supports multiline text and updates the text height based on line count when text editing is saved.

---

## Category 4: Hit Testing & Geometry Math (61 - 80)

### Q61: What is the math formula to calculate distance between two points?
**Answer:**
Calculated in [geometry.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/geometry.ts#L3-L5) using the Euclidean distance formula:
```typescript
export const distance = (a: Point, b: Point): number => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};
```

---

### Q62: How are bounds cached on elements to improve performance?
**Answer:**
In [geometry.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/geometry.ts#L9-L11), if an element has a cached `bounds` property, it is returned directly:
```typescript
if (el.bounds) {
  return el.bounds;
}
```
State modifications set the cached `bounds` property back to `undefined` to force recalculation when the shape coordinates change.

---

### Q63: How are absolute boundary boxes calculated for lines and pencils?
**Answer:**
In [geometry.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/geometry.ts#L15-L28), it iterates through the points array, finds the minimum and maximum horizontal and vertical coordinates, and adds them to the parent element's x and y starting coordinates.

---

### Q64: Explain the calculation for finding the distance from a point to a line segment.
**Answer:**
It is calculated using vector projection in [geometry.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/geometry.ts#L47-L71):
```typescript
let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
t = Math.max(0, Math.min(1, t)); // Clamped value

const projX = x1 + t * dx;
const projY = y1 + t * dy;
return distance({ x: px, y: py }, { x: projX, y: projY }) < maxDistance;
```

---

### Q65: How does hit testing work for filled versus unfilled rectangles?
**Answer:**
* Filled: checks if the coordinates are inside the bounding box coordinates.
* Unfilled: checks if the coordinates are near the borders using the point-near-line formula.

---

### Q66: Explain the ellipse hit detection formula.
**Answer:**
In [geometry.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/geometry.ts#L94-L111), the formula translates the hit point to normalized coordinates relative to the ellipse center:
```typescript
const val = ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2);
```
* Filled: hits are registered if `val <= 1.05` (inside the ellipse area).
* Unfilled: hits are registered if `Math.abs(val - 1.0) < 0.15` (close to the border).

---

### Q67: How does hit testing work for freehand lines?
**Answer:**
It iterates through all sequential segments in the pencil drawing points array and checks if the point is near the line segment using the `isPointNearLine` formula.

---

### Q68: How is the top-most element at a cursor position identified?
**Answer:**
It iterates through the elements array in reverse order (backwards) in [geometry.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/geometry.ts#L159-L173), returning the first non-deleted element that registers a valid coordinate hit.

---

### Q69: How is it determined if an element is inside a drag selection box?
**Answer:**
Calculated in [geometry.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/geometry.ts#L176-L197) by verifying that the element's bounding box is completely inside the selection box coordinates.

---

### Q70: What handles are returned for resizing a selected element?
**Answer:**
In [geometry.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/geometry.ts#L208-L243), the coordinates for corner and edge handles are calculated relative to the element bounding box:
```typescript
return [
  { name: 'TL', x: minX, y: minY },
  { name: 'TR', x: maxX, y: minY },
  { name: 'BL', x: minX, y: maxY },
  { name: 'BR', x: maxX, y: maxY },
  { name: 'T', x: midX, y: minY },
  { name: 'B', x: midX, y: maxY },
  { name: 'L', x: minX, y: midY },
  { name: 'R', x: maxX, y: midY }
];
```

---

### Q71: How does resizing work for pencils and lines?
**Answer:**
Pencils and lines return only the four corner handles (`TL`, `TR`, `BL`, `BR`) to allow uniform scaling of the shape.

---

### Q72: How are resize handles selected under a cursor coordinate?
**Answer:**
In [geometry.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/geometry.ts#L246-L262), it calculates the distance between the cursor and each handle. The first handle that is within range is returned.

---

### Q73: Why is the handle hit radius divided by the zoom level?
**Answer:**
```typescript
const handleRadius = 6 / zoom;
```
Dividing the radius by `zoom` ensures that the click targets remain consistent in screen size as the user zooms in or out.

---

### Q74: Why is a small margin added to check boundary intersections?
**Answer:**
A safety margin of 8 pixels is added to the click targets. This makes it easier for users to select thin lines and thin borders.

---

### Q75: How are boundary dimensions handled for shapes with negative height or width?
**Answer:**
Bounding box logic converts negative dimensions using absolute mathematical logic:
```typescript
minX: Math.min(x1, x2),
maxX: Math.max(x1, x2)
```
This ensures that bounds calculate correctly regardless of the drawing direction.

---

### Q76: Explain the difference between `getElementBounds` and calculating raw width and height.
**Answer:**
`getElementBounds` calculates the boundary box coordinates in world space. For lines, arrows, and pencils, this means iterating through their points array rather than using the raw `width` and `height` coordinates directly.

---

### Q77: Why does the pencil tool use a larger safety boundary radius of `margin + 2`?
**Answer:**
Freehand pencil drawings contain fine curves and jagged segments. The larger target area makes it easier to select freehand drawings.

---

### Q78: How are the center coordinates of an ellipse calculated?
**Answer:**
```typescript
const cx = el.x + el.width / 2;
const cy = el.y + el.height / 2;
```
These values represent the center point of the ellipse bounds.

---

### Q79: What is the math formula for vector projections?
**Answer:**
The formula calculates projection factor `t` using vector dot products:
```typescript
let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
```
It represents the projected coordinate point along the infinite line segment.

---

### Q80: How does the select tool verify that a handle click is valid?
**Answer:**
It checks the resize handles of the selected elements list, returning the target handle coordinates only if a valid selection exists.

---

## Category 5: State Management, Sync, & Local Storage Persistence (81 - 95)

### Q81: What state elements make up the React `appState` structure?
**Answer:**
The `AppState` interface in [types.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/types.ts#L32-L46) contains:
```typescript
export interface AppState {
  activeTool: ElementType;
  strokeColor: string;
  fillColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  zoom: number;
  pan: Point;
  selectedElementIds: Record<string, boolean>;
  theme: 'light' | 'dark';
  collaborativeRoomId: string | null;
  canvasBackgroundColor: string;
}
```

---

### Q82: How is solo drawing state persisted to the browser storage?
**Answer:**
It is persisted in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L136-L158) using a `useEffect` hook that saves the elements and appState objects to `localStorage`:
```typescript
localStorage.setItem('sleekdraw-elements', JSON.stringify(activeElements));
localStorage.setItem('sleekdraw-appstate', JSON.stringify(stateToPersist));
```

---

### Q83: Why is local storage persistence bypassed during collaboration sessions?
**Answer:**
```typescript
if (isCollabUrl() || appState.collaborativeRoomId) {
  return;
}
```
This check prevents the room's drawing state from overwriting the user's local solo drawings.

---

### Q84: How is local storage state retrieved during app load?
**Answer:**
It is retrieved during the state initialization phase in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L92-L134) using fallback logic:
```typescript
const saved = localStorage.getItem('sleekdraw-elements');
return saved ? JSON.parse(saved) : [];
```
If retrieval fails or the user is loading a collaboration URL, it initializes to an empty state.

---

### Q85: How are adjustments to left sidebar styles synced to selected elements?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L561-L582), adjusting properties in the left sidebar updates those values for all selected elements:
```typescript
updateElementsList(prev => {
  return prev.map(el => {
    if (appState.selectedElementIds[el.id]) {
      return {
        ...el,
        [key]: value,
        version: el.version + 1,
        updatedAt: Date.now(),
        bounds: undefined
      };
    }
    return el;
  });
}, true);
```

---

### Q86: How does the theme select change the canvas background?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L720-L788), changing the background updates `appState.canvasBackgroundColor`. It also adjusts default stroke colors (switching white strokes to black on light backgrounds, and vice versa) to ensure drawings remain visible.

---

### Q87: Explain the purpose of `isLightTheme` checks in style handlers.
**Answer:**
`isLightTheme` checks if the background color is white (`#ffffff`) or light grey (`#f3f4f6`). This is used to adjust stroke and grid dot colors dynamically.

---

### Q88: Why does changing the background color increment element versions?
**Answer:**
When stroke colors are adjusted for readability on background changes, incrementing the version properties ensures the changes sync correctly to collaboration peers.

---

### Q89: Why is `updateElementsList` wrapped in `useCallback`?
**Answer:**
It is wrapped in `useCallback` in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L246-L257) to prevent redundant rendering cycles for child components like the canvas, toolbars, and sidebars.

---

### Q90: What is the purpose of `isReceivingSyncRef`?
**Answer:**
It acts as a lock. When the hook receives state updates from the socket connection, it sets `isReceivingSyncRef.current = true`. This prevents the incoming state updates from triggering outgoing sync events.

---

### Q91: Explain how `showToast` displays alerts.
**Answer:**
It generates a random ID, appends the alert text to the `toasts` state, and sets a 4-second timeout to remove the alert from the screen.

---

### Q92: What properties are loaded from local storage for `appState`?
**Answer:**
It loads user preferences like `strokeColor`, `fillColor`, `fillStyle`, `strokeWidth`, `strokeStyle`, `opacity`, `zoom`, `pan`, `canvasBackgroundColor`, and `theme`.

---

### Q93: How is the canvas zoom reset?
**Answer:**
```typescript
const resetZoom = useCallback(() => setAppState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } })), []);
```
This resets the zoom factor to 1 and pan coordinates back to the center origin.

---

### Q94: How does the application scale coordinate adjustments when typing text?
**Answer:**
It renders textarea controls using CSS transforms that match the active zoom level:
```typescript
transform: `scale(${zoom})`
```
This aligns the text input box dimensions with the canvas rendering.

---

### Q95: Why are selected element IDs tracked as a map instead of an array?
**Answer:**
Using a map object (`Record<string, boolean>`) allows for $O(1)$ lookups when checking if an element is selected during redraw and hit testing loops.

---

## Category 6: History Engine (Undo/Redo Stacks) (96 - 110)

### Q96: Describe the implementation of the history engine.
**Answer:**
The history engine is implemented in [useHistory.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useHistory.ts) using two main state hooks:
```typescript
const [history, setHistory] = useState<CanvasElement[][]>([[]]);
const [historyIndex, setHistoryIndex] = useState(0);
```
It stores historical states as arrays of canvas elements and uses `historyIndex` to track the active position in the history stack.

---

### Q97: What does `saveToHistory` do when saving a new state?
**Answer:**
In [useHistory.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useHistory.ts#L11-L16), it discards any redo states ahead of the active index, filters out deleted elements, and appends the new state to the stack:
```typescript
const cleanElements = newElements.filter(e => !e.isDeleted);
const newHistory = history.slice(0, historyIndex + 1);
setHistory([...newHistory, cleanElements]);
setHistoryIndex(newHistory.length);
```

---

### Q98: How does the Undo handler step back in history?
**Answer:**
In [useHistory.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useHistory.ts#L18-L28), it checks if `historyIndex > 0`, updates the element state to match the target history index, and triggers a sync update if collaboration is active.

---

### Q99: How does the Redo handler step forward in history?
**Answer:**
In [useHistory.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useHistory.ts#L30-L40), it checks if the current index is less than the history length, updates the active canvas state, and triggers a sync update if collaboration is active.

---

### Q100: How is history updated during collaboration updates?
**Answer:**
When receiving initial state updates from collaboration peers, `history` is reset to contain only the received state, and `historyIndex` is reset to 0:
```typescript
setElements(parsed);
setHistory([parsed]);
setHistoryIndex(0);
```
This resets the undo history to align with the synced room state.

---

### Q101: Why does history store deep copies of element states?
**Answer:**
Using deep copies prevents changes to the active elements from modifying past states stored in the history stack.

---

### Q102: How does the delete command interact with history?
**Answer:**
Deleting elements flags them as `isDeleted: true` and calls `saveToHistory`. This saves the deletion state, allowing it to be undone or redone.

---

### Q103: Why are deleted elements filtered out of history?
**Answer:**
```typescript
const cleanElements = newElements.filter(e => !e.isDeleted);
```
Filtering out deleted elements prevents them from accumulating in the history stack, optimizing memory usage.

---

### Q104: How is history state synced during draw updates?
**Answer:**
History is saved when drawing actions are completed (on mouse up or touch end) to prevent intermediate drawing states from cluttering the undo stack.

---

### Q105: How does the history hook handle browser reloads?
**Answer:**
On page reload, the history stack is initialized using the state saved in local storage.

---

### Q106: Why does `useHistory` accept an `onSyncElements` callback?
**Answer:**
```typescript
onSyncElements?: (elements: CanvasElement[]) => void
```
This callback updates the collaboration server when undo/redo actions are triggered.

---

### Q107: What is the maximum size of the history stack?
**Answer:**
The history stack grows dynamically with user actions. In-memory arrays of elements are light, meaning memory is generally not an issue during a single session.

---

### Q108: What happens to the history stack when the canvas is cleared?
**Answer:**
Clearing the canvas flags all elements as deleted, saving the empty state to the history stack so the action can be undone if needed.

---

### Q109: How is the undo/redo button UI state managed?
**Answer:**
The buttons are disabled if the user is at the boundaries of the history stack, checked using the active history index:
```typescript
const undoDisabled = historyIndex === 0;
const redoDisabled = historyIndex === history.length - 1;
```

---

### Q110: How does text editing affect history states?
**Answer:**
History states are saved only when text editing is committed (on blur or enter), saving the final text value to the history stack.

---

## Category 7: Real-Time Sync & Socket.io Operations (111 - 125)

### Q111: Describe the socket events used for real-time collaboration.
**Answer:**
The real-time collaboration system uses the following socket events:
* `join-room`: Sent by clients to join a room.
* `init-state`: Sent by the server to send the current canvas state to new users.
* `update-state`: Sent by clients to broadcast drawing changes to the room.
* `state-changed`: Sent by the server to update clients with changes from peers.
* `cursor-move` / `peer-cursor`: Syncs peer cursor positions.
* `disconnecting` / `peer-disconnected`: Handles user disconnects.

---

### Q112: How does the backend store room states?
**Answer:**
The backend in [index.js](file:///c:/Users/rohit/Downloads/sleekDraw/server/index.js#L24) stores room states in an in-memory Map:
```javascript
const rooms = new Map();
```
States are saved when receiving `update-state` events and retrieved when users join.

---

### Q113: What happens on the server when a user joins a room?
**Answer:**
In [index.js](file:///c:/Users/rohit/Downloads/sleekDraw/server/index.js#L30-L38), the socket joins the room. If the room has an active drawing state, it sends the state back to the user:
```javascript
socket.on('join-room', ({ roomId }) => {
  currentRoomId = roomId;
  socket.join(roomId);
  if (rooms.has(roomId)) {
    socket.emit('init-state', rooms.get(roomId));
  }
});
```

---

### Q114: How does the server handle canvas state updates?
**Answer:**
In [index.js](file:///c:/Users/rohit/Downloads/sleekDraw/server/index.js#L41-L47), the server updates the room state map and broadcasts the changes to all other clients in the room:
```javascript
socket.on('update-state', ({ roomId, encryptedElements, encryptedAppState }) => {
  rooms.set(roomId, { encryptedElements, encryptedAppState });
  socket.to(roomId).emit('state-changed', { encryptedElements, encryptedAppState });
});
```

---

### Q115: How are peer cursor movements synchronized?
**Answer:**
Clients send cursor positions using `cursor-move` events. The server broadcasts these positions to other room members using the `peer-cursor` event.

---

### Q116: How are disconnected peer cursors removed from the canvas?
**Answer:**
When a user disconnects, the server broadcasts a `peer-disconnected` event with the user's socket ID. Clients listen for this event and filter out the disconnected user's cursor:
```javascript
socket.on('peer-disconnected', (socketId) => {
  setPeerCursors(prev => prev.filter(c => c.socketId !== socketId));
});
```

---

### Q117: What does the backend health check endpoint do?
**Answer:**
In [index.js](file:///c:/Users/rohit/Downloads/sleekDraw/server/index.js#L10-L12), the `/health` endpoint returns a status object with the server uptime:
```javascript
app.get('/health', (req, res) => {
  res.send({ status: 'ok', uptime: process.uptime() });
});
```
This is useful for hosting services to monitor server health.

---

### Q118: Explain the CORS configuration used in the Socket server.
**Answer:**
The Socket server is configured to allow connections from any origin:
```javascript
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
```
This enables frontend applications hosted on other domains to connect to the backend server.

---

### Q119: What is the default port used by the backend?
**Answer:**
```javascript
const PORT = process.env.PORT || 4000;
```
It defaults to port 4000, or uses the port specified in environment variables.

---

### Q120: How are socket instances cleaned up on the client?
**Answer:**
Client-side socket connections are cleaned up using a `useEffect` return cleanup hook in [useCollaboration.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCollaboration.ts#L182-L188):
```typescript
useEffect(() => {
  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
}, []);
```

---

### Q121: How are cursor coordinates synchronized?
**Answer:**
Cursor coordinates are synchronized in world space. This ensures cursor positions align correctly regardless of individual zoom levels or pan offsets.

---

### Q122: Why does the backend server use `socket.to(roomId).emit` instead of `io.to(roomId).emit`?
**Answer:**
Using `socket.to(roomId).emit` broadcasts events to all sockets in the room *except* the sender. This prevents the sender from receiving redundant copies of their own updates.

---

### Q123: What does the socket disconnect listener do?
**Answer:**
The socket listener updates `collabConnected` state to false, updating the UI connection status indicators.

---

### Q124: How does the frontend handle backend connection failures?
**Answer:**
If the socket connection fails, the frontend updates `collabConnected` to false, displaying a connection alert to the user.

---

### Q125: How are cursor states managed on the client?
**Answer:**
Cursor states are stored in a `peerCursors` state array. The array is updated with incoming cursor events, and disconnected cursors are filtered out:
```typescript
socket.on('peer-cursor', (cursor: PeerCursor) => {
  setPeerCursors(prev => {
    const index = prev.findIndex(c => c.socketId === cursor.socketId);
    if (index > -1) {
      const next = [...prev];
      next[index] = cursor;
      return next;
    }
    return [...prev, cursor];
  });
});
```

---

## Category 8: End-to-End Encryption (E2EE) Mechanics (126 - 135)

### Q126: What encryption algorithm does sleekDraw use for E2EE?
**Answer:**
sleekDraw uses AES-GCM (128-bit key length) symmetric encryption provided by the browser's Web Crypto API (`crypto.subtle`).

---

### Q127: How are encryption keys generated?
**Answer:**
Encryption keys are generated in [crypto.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/crypto.ts#L15-L25) using `crypto.subtle.generateKey`:
```typescript
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 128 },
  true,
  ['encrypt', 'decrypt']
);
const exported = await crypto.subtle.exportKey('raw', key);
return Array.from(new Uint8Array(exported))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
```
The raw key bytes are exported and converted to a 32-character hexadecimal string.

---

### Q128: How does the application import hex keys?
**Answer:**
In [crypto.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/crypto.ts#L1-L12), the key hex string is converted to byte array segments and imported using `crypto.subtle.importKey`:
```typescript
const bytes = keyHex.match(/.{1,2}/g);
const rawKey = new Uint8Array(bytes.map(byte => parseInt(byte, 16)));
return crypto.subtle.importKey(
  'raw',
  rawKey,
  { name: 'AES-GCM' },
  false,
  ['encrypt', 'decrypt']
);
```

---

### Q129: Explain the encryption process.
**Answer:**
In [crypto.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/crypto.ts#L28-L55), the string data is encrypted using the imported key and a generated 12-byte initialization vector (IV):
```typescript
const cryptoKey = await importKey(keyHex);
const iv = crypto.getRandomValues(new Uint8Array(12));
const encoder = new TextEncoder();
const encodedData = encoder.encode(dataText);

const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  cryptoKey,
  encodedData
);
```
It returns the IV and ciphertext as a JSON string.

---

### Q130: Explain the decryption process.
**Answer:**
In [crypto.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/utils/crypto.ts#L58-L86), the encrypted data is parsed to extract the IV and ciphertext:
```typescript
const { iv: ivHex, ciphertext: ciphertextHex } = JSON.parse(encryptedDataStr);
const cryptoKey = await importKey(keyHex);
// ... byte array conversions ...
const decrypted = await crypto.subtle.decrypt(
  { name: 'AES-GCM', iv },
  cryptoKey,
  ciphertext
);
return new TextDecoder().decode(decrypted);
```

---

### Q131: How is the encryption key shared between users securely?
**Answer:**
The encryption key is appended to the room URL hash parameter:
```typescript
const url = `${window.location.origin}${window.location.pathname}#room=${roomId}&key=${key}`;
```
Because hash parameters are not sent to the server in HTTP requests, the key remains local to the clients, keeping the connection end-to-end encrypted.

---

### Q132: How is the URL parsed to extract the room ID and encryption key?
**Answer:**
The hash parameter is parsed using a regular expression match in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L358-L370):
```typescript
const match = hash.match(/#room=([a-zA-Z0-9_-]+)&key=([a-fA-F0-9]{32})/);
if (match) {
  const roomId = match[1];
  const encryptionKey = match[2];
  await joinCollaborativeRoom(roomId, encryptionKey);
}
```

---

### Q133: What is the length of the Web Crypto AES initialization vector (IV)?
**Answer:**
The initialization vector is 12 bytes long:
```typescript
const iv = crypto.getRandomValues(new Uint8Array(12));
```
This is the standard recommended IV length for AES-GCM.

---

### Q134: How is text data prepared for encryption?
**Answer:**
The text data is encoded to bytes using the `TextEncoder` API before encryption:
```typescript
const encoder = new TextEncoder();
const encodedData = encoder.encode(dataText);
```

---

### Q135: What happens if decryption fails?
**Answer:**
If decryption fails, an error is caught in [useCollaboration.ts](file:///c:/Users/rohit/Downloads/sleekDraw/src/hooks/useCollaboration.ts#L109-L113) and logged to the console, and the incoming update is ignored to prevent corrupted states.

---

## Category 9: Library Catalog Browsing & Export System (136 - 150)

### Q136: How does the Excalidraw library importer fetch shape catalogs?
**Answer:**
When the library tab is selected, the catalog is fetched from the official Excalidraw libraries repository using a `useEffect` hook in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L373-L394):
```typescript
const res = await fetch('https://raw.githubusercontent.com/excalidraw/excalidraw-libraries/main/libraries.json');
```

---

### Q137: How are `.excalidrawlib` library files loaded?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L397-L420), shape library items are fetched from the source URL:
```typescript
const res = await fetch(`https://raw.githubusercontent.com/excalidraw/excalidraw-libraries/main/libraries/${lib.source}`);
const data = await res.json();
const items = data.library || data.libraryItems || [];
setLoadedShapes(items);
```

---

### Q138: How are imported shapes converted to sleekDraw formats?
**Answer:**
In [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L422-L465), imported shapes are mapped to sleekDraw element structures:
```typescript
return {
  id: Math.random().toString(36).substring(2, 9),
  type: el.type || 'rectangle',
  x: el.x ?? 0,
  y: el.y ?? 0,
  width: el.width ?? 100,
  height: el.height ?? 100,
  strokeColor: el.strokeColor || '#ffffff',
  fillColor: el.fillColor || el.backgroundColor || 'transparent',
  fillStyle: el.fillStyle || 'hachure',
  strokeWidth: el.strokeWidth ?? 2,
  strokeStyle: el.strokeStyle || 'solid',
  opacity: opacity,
  points,
  text: el.text || '',
  version: el.version || 1,
  updatedAt: el.updatedAt || Date.now()
} as CanvasElement;
```

---

### Q139: How are imported shapes centered in the viewport?
**Answer:**
The bounding box of the shape group is calculated. The shape group coordinates are shifted by the difference between the shape center and the logical viewport center in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L520-L531):
```typescript
const viewportCenterX = (window.innerWidth / 2 - appState.pan.x) / appState.zoom;
const viewportCenterY = (window.innerHeight / 2 - appState.pan.y) / appState.zoom;
const shiftX = viewportCenterX - newGroupCenterX;
const shiftY = viewportCenterY - newGroupCenterY;
```

---

### Q140: How does the importer scale large shapes to fit the screen?
**Answer:**
If the bounds of the imported shapes exceed 75% of the visible viewport dimensions, a scale factor is calculated in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L489-L514) to fit the shapes to the screen area:
```typescript
const maxAllowedWidth = (window.innerWidth * 0.75) / appState.zoom;
const maxAllowedHeight = (window.innerHeight * 0.75) / appState.zoom;
// ...
let scale = 1.0;
if (groupWidth > maxAllowedWidth || groupHeight > maxAllowedHeight) {
  const scaleX = maxAllowedWidth / groupWidth;
  const scaleY = maxAllowedHeight / groupHeight;
  scale = Math.min(scaleX, scaleY);
}
```

---

### Q141: Explain how drawings are exported to SVG.
**Answer:**
Drawings are exported to SVG in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L589-L657). It calculates the bounding box of all active elements, generates the SVG nodes as a string, creates a Blob URL, and triggers a browser download.

---

### Q142: How are rectangles represented in generated SVGs?
**Answer:**
```typescript
svgContent += `<rect x="${rx1}" y="${ry1}" width="${rw}" height="${rh}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="${el.fillColor === 'transparent' ? 'none' : el.fillColor}" />`;
```

---

### Q143: How are lines, arrows, and pencils represented in generated SVGs?
**Answer:**
They are represented as `<polyline>` nodes using space-separated point coordinates:
```typescript
const pathPoints = el.points.map(p => `${el.x + p.x},${el.y + p.y}`).join(' ');
svgContent += `<polyline points="${pathPoints}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="none" />`;
```

---

### Q144: Explain how drawings are exported to PNG.
**Answer:**
PNG export is handled in [App.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/App.tsx#L659-L714) using a temporary offscreen canvas:
```typescript
const tempCanvas = document.createElement('canvas');
tempCanvas.width = width;
tempCanvas.height = height;

const tempCtx = tempCanvas.getContext('2d')!;
tempCtx.fillStyle = appState.canvasBackgroundColor;
tempCtx.fillRect(0, 0, width, height);
```
Elements are rendered onto this temporary canvas, which is then converted to a PNG data URL and downloaded.

---

### Q145: How is spacing handled during SVG/PNG exports?
**Answer:**
A safety margin is subtracted from the boundary box coordinates before exporting. For example, a 24-pixel margin is added to PNG exports to prevent elements from touching the canvas border:
```typescript
const margin = 24;
minX -= margin;
minY -= margin;
maxX += margin;
maxY += margin;
```

---

### Q146: What does the copy action in `ShareModal` do?
**Answer:**
It copies the collaboration invite URL to the clipboard using the `navigator.clipboard` API:
```typescript
navigator.clipboard.writeText(shareUrl);
```

---

### Q147: Describe the confirmation modal component.
**Answer:**
[ConfirmModal.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/components/ConfirmModal.tsx) displays confirmation messages for destructive actions like clearing the canvas. It renders a modal overlay with confirm and cancel buttons.

---

### Q148: How does the catalog search input filter shapes?
**Answer:**
The catalog search input filters catalog items using case-insensitive matches against the `name` and `description` properties.

---

### Q149: How is the shape preview generated for catalog items?
**Answer:**
[LibraryShapePreview.tsx](file:///c:/Users/rohit/Downloads/sleekDraw/src/components/LibraryShapePreview.tsx) draws simplified mock shape vectors on canvas preview elements.

---

### Q150: Why is `URL.revokeObjectURL(url)` used in the SVG exporter?
**Answer:**
`URL.revokeObjectURL` releases the reference to the created Blob object, freeing up system memory after the download starts.
