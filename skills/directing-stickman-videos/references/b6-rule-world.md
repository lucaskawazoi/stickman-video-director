# B6 · Rule-World 2D (vertical "in this world…" series)

A vertical 1080×1920 fiction series where the world has one rule with a number ("in this world, every debt has a
clock"), a counter floats above the characters, and one-to-three-word captions sit at the top. Built for explainers
that turn a concept (a legal deadline, a health metric) into the literal rule of a world. Select `style: B6`
explicitly; it shares B3's declarative artwork layers and B4's native-rate audio tracks, nothing else.

## What the runtime adds
- `counter` layer: `x`/`y` = badge centre; `size` (value font, design units); `label` (default `PRAZO`); either
  `value` in **months** (keyframable via `keys[].value`; shown as `5 ANOS`, `4A 11M`, `1 MÊS`, `ZEROU` at 0) or fixed
  `text`; `unit: "dias"` shows days instead; `spin` = clock-hand turns per second (negative rewinds); colour follows
  urgency (green > 24 months, yellow ≤ 24, red ≤ 6, grey at zero) unless `color` is given.
- `bubble` layer: `x`/`y` = centre; `text`; `style` `speech` (condensed caps, tail `down-left`/`down-right`) or
  `chat` / `chat-out` (phone-message bubble); `size`, `w` (wrap width).
- `blur` on any layer or group, keyframable (`keys[].blur`), for the opening focus pull and soft inserts.
- `group` with `pivotX`/`pivotY`, `scaleX`/`scaleY` keys (as B3): cut-out puppets (body + head pivoting at the neck +
  blink overlay) and a per-shot camera group (snap-out entrance, slow push-in).
- Top captions: Anton (OFL) caps, white with a dark outline, at 11% of the height, pop-in over 0.1 s; `*word*` paints
  a keyword yellow, `!word!` red. One line only; `captionSize` up to 200 design units.
- Audio: `ambience` (used for the music bed with fades), `sfx` with `kind: "file"`, `dialogue`, `audio_cuts`, as in B4,
  but without B4's Brian lock or mandatory continuous bed.

## Production rules (measured on the reference format; see the my-hub skill `rule-world-2d-series`)
- One cut about every 3 s, with a picture change inside long shots; 25 of 28 reference shots move the camera.
- The world rule is spoken whole in the first shot, without a cut. Narration covers the film (~180–190 wpm).
- Counter on screen whenever the rule acts; captions are 1–3 words; music bed ~15 dB under the voice; a whoosh on
  roughly half of the cuts.
- Characters are generated on white with a fixed identity reference, cut out (`scripts/recorte_2d.py` in my-hub),
  and animated as cut-outs: pose swaps between shots, head tilt at the neck, code-drawn blinks.
- Fiction narrated, never an AI professional giving advice; close with "each case has its details".
