# fl_turnaround: 3D guide for first love's turnaround sheet (A)

Not a film set: a reference rig for cast/first_love/_prompts/v10 (sheet A, take A_t2.jpg). Faceless body
(firstlove27.glb, faceKind 'none'); every view is from behind or a lost profile. Feet-only shots (toecheck_*) are the
only front views, with nothing above the shin in frame.

Render:
    node layout/render.mjs --set fl_turnaround --shots A_guide --modes form,contour,lit --w 3072 --h 1728 --nojson --out <dir>
    node layout/render.mjs --set fl_turnaround --prefix A_feet_ --modes form,contour,lit --w 1500 --h 760 --nojson --out <dir>
    node layout/render.mjs --set fl_turnaround --prefix toecheck_ --modes form,contour,lit --nojson --out <dir>
Outputs copied/stitched into cast/first_love/_prompts/v10/guide/ (A_guide_*.png; A_guide_feet_*.png = the five
A_feet_N tiles side by side, same camera direction as A_guide).

## 2026-11-26: first build
- Five figures left to right as A_t2: yaw 180 (back), -135 (back 3/4 to our left), 135 (back 3/4 to our right),
  112 (lost profile facing right), 140 with head nod 32 / turn -18 (bowed). Camera 135 mm at 14.2 m, ~9.6 deg down at
  the floor (nearly orthographic, like the sheet).
- FLAG: the A prompt says figure 4's near arm is his LEFT; facing right-and-away, the near arm is his RIGHT (the drawn
  sheet agrees). Matched the sheet: right hand in the front pocket, left hanging.
- Hands: front pockets on figures 1-4 (target inside the hip so the fingers vanish into the trousers); figure 5 both
  hanging. The sheet's figure-3 right hand reads as a back pocket; the engine hand would not go into one (it stayed
  splayed on the buttock), so it is in the front pocket too.
- Costume: slate-blue tee 0x56667f, sleeves 'pushed'; BLACK SLACKS 0x1b1b1e (Jade 2026-11-26: "first love in black
  pants in every scene ... normal black slacks", replacing the sheet's indigo jeans). The engine's trouser garment
  ends above the ankle: sandal.js slacksHem() stretches the lowest 14 cm of each trouser leg down so the hem rests on
  the rear strap in front and stops ~3 cm above the footbed behind (garment vertices only). No crease / belt loops
  (the engine garment has none).
- Hair: the engine's hair mesh, tinted #3f342e in the colour passes (the engine gives hair no form tint). Its shape is
  the generic short hair, not the sheet's stepped cut: the painter keeps the hair from the approved sheet.
- FEET (finding): the engine's 1.78 m body has 217 mm feet (12 % of height; a man's is ~15 %; mortongrove07's note
  says 248 mm). MakeHuman's foot itself is good: five separate toes, the big toe the largest, graduated, small nails,
  gaps between toes (toecheck_bare). sandal.js realFeet() stretches each foot about its ankle to 251 mm (Jade: identical to hers, they shared shoes) (x1.08 across),
  blended out 5-11 cm above the sole, set-local (engine untouched). Engine fix to consider: PROP foot length for
  adultFirstLove (humanMesh fS clamps the mesh foot to the solver's heel-toe length).
- SANDALS: Arizona-type, built from the measured foot (sandal.js). No CC0/CC-BY Arizona model found: Poly Haven has
  no footwear but rubber boots; the Objaverse 1.0 (Sketchfab) metadata (54 of 160 shards cached) gave a textureless
  Birkenstock scan on its ground plane, a child's back-strap sandal, cross-strap slides with a brand logo and broken
  scans. Built instead: footbed 276 mm (>= EU 42 / US 9, 27 cm), sole 10 mm dark brown, cork 16 mm, suede liner;
  two 28 mm dark-brown leather straps (front at 66 % of the foot, slanted 14 deg back on the outer side; rear at
  47 %), each a taut band over the foot's own vertices (convex hull + rounded corners, >= 2.5 mm clear), a metal
  buckle on the outer side. Toe tips 74 mm ahead of the front strap's front edge: all five toes show.
- Physics: the figures are lifted so the lowest sole vertex sits exactly on the footbed top (0.0 mm); Rapier clip
  check (layout/engine/clipcheck.mjs --set fl_turnaround --shots A_guide): body vs world none, body vs body none,
  joints in range: pass.

## 2026-11-27: the engine's feet are real size now (engine agent)
- humanMesh scales every mesh foot to PROP.foot x H (his = hers = 251 mm). build.js no longer calls realFeet() by
  default (it would re-apply its 8 % widening); footFloor() just finds the sole. shot.realFeet === true restores it.
  The sandals are still built from the measured foot. Re-rendered guides: cast/first_love/_prompts/v10/guide_r7_feet/.
