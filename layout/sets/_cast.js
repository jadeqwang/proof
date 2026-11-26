// THE CAST TABLE for "Proof" (integration pass). Every recurring person is defined ONCE here, with one height and one
// key; every set imports this file instead of registering its own figures. The table is recorded in layout/CAST.md.
// Set-specific extras (guests, grandmother, uncle, aunt, social worker, partner, toddler) stay in their set's build.js.
//
// The engine's own entries are part of the table and are NOT redefined: mama (1.60), littleJade (age 5, 1.08),
// jade (adult, 1.65), daughter. Mama's costume variants are derived from the engine's `mama`, so her height lives
// in one place. A per-shot costume change that does not deserve a key goes through the figure spec:
//   figs: { jade7: { ..., costume: { sock: 0xe6b996, sleeves: 'short' } } }      (engine/mannequin.js, spec.costume)
import { CAST, PROP } from '../engine/mannequin.js';

// child proportions (fractions of height), following the engine's child5 / child4 entries
export const CHILD_PROP = {
  child3: { hip: 0.43, sh: 0.76, head: 0.198, shW: 0.112, hipW: 0.052, ua: 0.166, fa: 0.134, hand: 0.112, foot: 0.155, wk: 0.82, chestW: 0.195, chestD: 0.15 },
  child7: { hip: 0.48, sh: 0.795, head: 0.158, shW: 0.114, hipW: 0.053, ua: 0.176, fa: 0.142, hand: 0.107, foot: 0.155, wk: 0.78, chestW: 0.185, chestD: 0.13 },
  child10: { hip: 0.50, sh: 0.80, head: 0.152, shW: 0.112, hipW: 0.054, ua: 0.18, fa: 0.142, hand: 0.106, foot: 0.152, wk: 0.76, chestW: 0.19, chestD: 0.13 },
};
Object.assign(PROP, CHILD_PROP);

// Hands and feet, from Jade (2026-11-25): her hands are larger than typical for a woman of her height (she reaches a
// tenth, an octave plus a third, on the piano: a thumb-to-little-finger span of about 21.5-22 cm, which goes with a hand
// about 18.7 cm long, wrist crease to fingertip; typical woman of 1.65 m ~17.8). She wears US women's 8.5 shoes
// (Brannock foot length about 25.1 cm). First love's hands and feet are the same size as hers, much smaller than
// typical for a man of 1.78 m (hand ~19.2, foot ~26.7). Each kind is the engine's adult proportions with only hand/foot changed.
const JADE_HAND = 0.187, JADE_FOOT = 0.251;
const adultWith = (h) => ({ ...PROP.adult, hand: +(JADE_HAND / h).toFixed(4), foot: +(JADE_FOOT / h).toFixed(4) });

// Mama's hair (Jade 2026-11-26: "The jaw-length perm throughout"): a jaw-length, side-parted perm at every age
// (cast/mama/mama_R_rest_heads_v1; mama.glb hair_perm), never a bun or a straight bob.
CAST.mama.hairStyle = 'perm';
// first love's hair colour (Jade 2026-11-26, v7: "that color hair" of her reference): a rich dark brown with warm
// undertones, not black, not medium brown (was 0x352219). The body GLBs carry no materials: this is the only place.
const FL_HAIR = 0x3d2819;
const MAMA_H = CAST.mama.h, FIRST_LOVE_H = 1.78;   // first love: about 5'10", lean (Jade)
PROP.adultJade19 = adultWith(1.63); PROP.adultJade27 = adultWith(1.65); PROP.adultFirstLove = adultWith(FIRST_LOVE_H);
const JADE_KID = { skin: 0xe6b996, hair: 0x14110f, legs: 0x4b5a7a, hairStyle: 'bob' };
const mamaAs = (o) => ({ ...CAST.mama, apron: undefined, ...o, h: MAMA_H, kind: 'adult' });

export const SHARED_CAST = {
  // ---- Jade, by age (age 5 = engine `littleJade` 1.08, adult = engine `jade` 1.65)
  jade3: { name: 'little Jade (3)', h: 0.95, kind: 'child3', ...JADE_KID, top: 0xe9dcc0, legs: 0x5a6a8a, sleeves: 'short' },
  jade7: { name: 'little Jade (7)', h: 1.22, kind: 'child7', ...JADE_KID, top: 0xb8c4d8, sleeves: 'long' },
  jade10: { name: 'little Jade (10)', h: 1.38, kind: 'child10', ...JADE_KID, top: 0xf1efe8, band: 0xe8792c, sleeves: 'pushed' },
  jade19: { name: 'Jade (about 19)', h: 1.63, kind: 'adultJade19', skin: 0xe3b692, hair: 0x0e0d0f, top: 0x8a94a8, legs: 0x2c3140, hairStyle: 'long', sleeves: 'long' },
  jade27: { name: 'Jade (27)', h: 1.65, kind: 'adultJade27', skin: 0xe3b692, hair: 0x0e0d0f, top: 0xd9543a, legs: 0x2c3140, hairStyle: 'long', sleeves: 'short' },
  // ---- Mama: one person, one height (the engine's `mama`, restaurant apron, 1988); costume variants by year
  mama86: mamaAs({ name: 'Mama (1986, Shanghai)', top: 0x6f7f9a, hairStyle: 'perm', sleeves: 'short' }),
  mama90: mamaAs({ name: 'Mama (1990, Decatur)', top: 0x8a5a52, hairStyle: 'perm', sleeves: 'pushed' }),
  mama91: mamaAs({ name: 'Mama (1991, school office)', top: 0x8a5a6a, hairStyle: 'perm', sleeves: 'long' }),
  // ---- Dad
  dad: { name: 'Dad', h: 1.72, kind: 'adult', skin: 0xd2a07a, hair: 0x15110f, top: 0xc8ccd0, legs: 0x3a3e48, hairStyle: 'short', sleeves: 'long' },
  // ---- first love: one height, two costumes (never shot face-on)
  firstLove19: { name: 'first love (19)', h: FIRST_LOVE_H, kind: 'adultFirstLove', skin: 0xd9ab88, hair: FL_HAIR, top: 0x5a6a58, legs: 0x3a3c44, hairStyle: 'short', sleeves: 'long' },
  firstLove27: { name: 'first love (27, never face-on)', h: FIRST_LOVE_H, kind: 'adultFirstLove', skin: 0xd9ab88, hair: FL_HAIR, top: 0x4a5a6a, legs: 0x2a2a30, hairStyle: 'short', sleeves: 'long' },
};
Object.assign(CAST, SHARED_CAST);          // authoritative: overwrites anything registered under these keys

// set-local extras: additive only, and never over a shared key
export function addCast(cast, prop = {}) {
  for (const [k, v] of Object.entries(prop)) if (!PROP[k]) PROP[k] = v;
  for (const [k, v] of Object.entries(cast)) { if (SHARED_CAST[k] || ['mama', 'littleJade', 'jade', 'daughter'].includes(k)) throw new Error(`cast key "${k}" belongs to the shared table (sets/_cast.js)`); if (!CAST[k]) CAST[k] = v; }
}
export { CAST, PROP };
