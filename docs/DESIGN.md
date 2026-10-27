# Design principles

Read this before any UI work. When a change doesn't fit these rules, discuss it first instead of adding a one-off.

## Principles
1. **Content first.**
   - The shared screen and the notes *are* the lesson, so they get the space.
   - The interface around them is quiet: little chrome, few borders, and controls next to what they affect.
2. **Calm and warm.**
   - Light paper tones and brown accents. No pure black, no saturated colours.
   - Colour carries **meaning**, not decoration:
     - accent: the primary action or the current selection
     - danger: destructive actions or errors
     - ok: allowed or success
3. **The teacher leads, the student follows easily.**
   - Teacher-only controls sit together (in the board header) and are clearly labelled.
   - The student never has to configure anything to follow the lesson.
4. **Everyone owns their layout.**
   - Panel sizes are personal and remembered in the browser.
   - Nothing resizes or switches someone else's screen, except the teacher's explicit **(!)** nudge.
5. **Basic and consistent.**
   - One font, one radius scale, one spacing scale.
   - Reuse `components/ui/*` before adding new styles. If something is missing there, add it there.
6. **Readable and reachable.**
   - Text contrast is at least **4.5:1** (WCAG AA). All token pairs below are checked.
   - Every interactive element has a visible focus ring (`focus-visible:ring-accent`).
   - Touch targets are at least **40 px** on phones.
   - Use words for actions. Icons alone only for universally known ones (mic, camera, leave), or with a tooltip, as (!) has.
7. **Friendly, plain copy.**
   - Short sentences that say what happened and what to do next ("Your browser blocked the camera. Click…").
   - Don't use jargon such as "token", "track" or "sync" in the UI.

## Tokens
These are defined in `app/globals.css` (`@theme`) and used as Tailwind classes, e.g. `bg-paper`, `text-ink-muted`, `border-line`.

| Token | Value | Use |
|---|---|---|
| `paper` | `#FAF6F0` | page background |
| `surface` | `#FFFFFF` | panels, editor, whiteboard, cards |
| `surface-2` | `#F3EBE0` | headers, tab bars, camera strip, inputs |
| `line` | `#E6D9C8` | borders, dividers, resize handles |
| `ink` | `#3B2A1E` | main text (12.7:1 on paper) |
| `ink-muted` | `#76604F` | secondary text (≥ 5:1 on paper, surface and surface-2) |
| `accent` | `#8B5E3C` | primary buttons, active tab, focus ring (white text 5.6:1) |
| `accent-hover` | `#6F4A2E` | hover or pressed accent |
| `danger` | `#B4442F` | leave, clear, errors (white text 5.5:1) |
| `ok` | `#52703F` | "student can edit" on, success (≥ 4.7:1) |
| `video` | `#2E2620` | behind camera and screen video, so video looks natural |
| `warn` / `warn-soft` | `#8A5A12` / `#FBF0DC` | "Reconnecting…" banner (text 5.2:1 on soft) |
| `danger-soft` | `#F8E6E1` | error banner background (danger text 4.6:1) |

- **Radius:**
  - `rounded-md` (6 px) for controls
  - `rounded-panel` (10 px) for panels and cards
- **Spacing:** Tailwind's 4 px scale. Use `gap-2` inside controls, `gap-3` or `p-3` inside panels, and `gap-2` between panels in the lesson.
- **Shadow:** `shadow-soft`, only for floating things such as the phone camera overlay and popovers. Panels use a `line` border instead.
- **Font:** Geist Sans (already loaded). Body text is 16 px. The editor is 18 px (`text-lg`).
- **Theme:** light only for now.
- **LiveKit** controls and tiles get the palette through CSS variables and `.lesson-room`-prefixed rules at the end of `app/globals.css`. Camera tiles stay dark (`video`).

## Components (`components/ui/`)
- **Button.** Variants:
  - `primary`: accent background, white text. Use **one per area**.
  - `secondary`: surface with a line border.
  - `ghost`: text only, for toolbars.
  - `danger`: red text, or a red background for confirmations.
  
  Sizes `sm` and `md`. On phones the hit area is at least 40 px.
- **Field:** a labelled input on `surface`, with a line border and accent focus ring.
- **Panel:** `surface` with a `line` border, `rounded-panel` corners and an optional header bar on `surface-2`.
- **TabBar:** segmented tabs in a header. The active tab has an `accent` underline or fill, and the rest are `ink-muted`.
- **Banner** (`components/room/StatusBanner.tsx`): info on `surface-2`, warning in amber tones, error in danger tones. Can be dismissed when the user can act on it.

## Lesson layout
Desktop (md and up):
```
┌──────────────────────┬────────────────┐
│  Screen stage        │ [Text][Draw] ⓘ │  ← board header: tabs left,
│  (collapses when     │                │    teacher controls right
│   nobody shares)     │  notes / draw  │
├──────────────────────┴────────────────┤  ← drag handles (line colour,
│  [teacher cam] [student cam]           │    accent on hover)
└───────────────────────────────────────┘
  mic · camera · share screen · leave
```
- All dividers can be dragged. Sizes are saved per browser.
- The board's size never depends on the camera tiles.
- Phone: the screen share fills the stage, with the teacher's camera overlapping it in a corner. The board is hidden for now.

## Do / don't
- **Do** use the tokens. **Don't** write hex colours or `neutral-*`, `blue-*` and similar in components.
- **Do** keep teacher controls in one place. **Don't** scatter toggles across the screen.
- **Do** say what to do next in messages. **Don't** show raw error text.
- **Don't** add Tailwind size or colour classes on LiveKit `.lk-*` elements. Their CSS is unlayered and wins. Use LiveKit's CSS variables or inline `style` instead.
