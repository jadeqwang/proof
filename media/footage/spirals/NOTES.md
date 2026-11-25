# Spirals: three phyllotaxis plates with a gold count (work in progress)

Progress log (newest last). The finished notes replace this when the clips are done.

- 2026-11-25: read Hold Fire (spiraltrace.js, seedspiral.js, phyllo.js: gold [1, .8, .42], counted arms, Fibonacci
  families), the three Proof plates (frost, neuron: code-drawn on one sheet; artichoke: image-model stages), the plan's
  market rows and `layout/sets/market93/phyllo.js`. Decision: draw all three plants by code from a phyllotaxis model
  (golden angle, logarithmic lattice, so each family is the same everywhere), rasterised from 3D in a z-buffer seen
  from directly overhead, engraved from the buffers (shading, cast shadow, hatching along each bract / leaf / cone,
  outlines at occluding edges), hand-coloured with washes, on frost's sheet. Botanical facts are being checked.
- Research (subagent, sources to be listed in the final notes): artichoke bracts 5 and 8 (Pick, "The uneaten
  artichoke", Princeton UP blog; Redwood Science Project), not 8 and 13; romanesco head 8 and 13 (popular, low-moderate
  confidence), floret 5 and 8 or 8 and 13; Aloe polyphylla about 150 leaves in a 5-ranked spiral (Glen & Hardy 2000,
  Flora of Southern Africa; PlantZAfrica), both hands (Durrington et al. 2021: 28 cw / 22 acw). Counts changed to fit.
- Aloe: a divergence near 2/5 (142.2 deg) is what makes five ranks that twist only gently over ~150 leaves (with the
  golden angle the ranks would wind ~2.7 turns). The drawing's neighbours are then 5 (along a rank) and 38 / 43 (across
  ranks): no counter-rotating Fibonacci family exists, so the aloe counts the five ranks only.
- Romanesco: head 8/13 verified on the drawing (93% of Delaunay neighbour pairs differ by 8 or 13). The enlarged floret
  (inset, detached and seen from its point) is built on a 5/8 surface lattice, but its pointed cone foreshortens the
  radial spacing seen from above, and the drawing's neighbours are 8 and 13: the inset counts 8 and 13.
- Artichoke code drawing is the weakest; trying a Codex repaint from the code plate as guide (work/codex/).
