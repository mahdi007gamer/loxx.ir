# LOXX role illustration assets — revised team scene

The website uses six explicitly fictional named characters to illustrate complementary project roles. The short visible image credit identifies fictional characters and AI illustration; these assets are not an actual employee directory or evidence of premises. Do not add employee Person schema, credentials, years of experience or testimonials for these characters.

## Final image and character map

Order is left to right in the group scene, matching the six role cards.

| Website character name | Role | Visual identity | Active asset |
| --- | --- | --- | --- |
| علی رضایی | Product and project definition | Older bald man, glasses, gray beard, blue checked shirt | `/images/team-role-01-v2.webp` |
| مریم احمدی | UI / UX | Young woman, taupe scarf, thin glasses, tailored gray jacket | `/images/team-role-02-v3.webp` |
| محمد کریمی | Frontend | Man with receding hairline, navy polo | `/images/team-role-03-v2.webp` |
| نرگس حسینی | Backend | Woman with thin glasses, black scarf, gray cardigan | `/images/team-role-04-v2.webp` |
| رضا صادقی | Quality assurance | Man with gray hair, stubble and olive overshirt | `/images/team-role-05-v2.webp` |
| امیر محمدی | Content and SEO | Young man, tidy dark hair and stubble, brown knitwear and off-white collar | `/images/team-role-06-v3.webp` |
| All six characters | Collaboration scene | Ordinary Iranian office, candid discussion | `/images/team-workroom-v3.webp` |

The final group asset is 1600 × 900. Each portrait is 480 × 480. All are lazy-loaded WebP files. Versioned filenames avoid serving the previous artwork from an existing browser cache. Unreferenced original `team-01.webp` to `team-06.webp` and `team-studio.webp` are retained as legacy source assets.

## Generation and revision sequence

Built-in ImageGen was used throughout; no external API or CLI fallback. An entirely new natural scene replaced the original uniformly young, posed composition. The first revision used four men and two women with ages 35–53, ordinary bodies, bald/receding hairlines and natural skin texture. Six separate portraits were generated from that scene. The user then supplied crops identifying the taupe-scarf woman and the mustached far-right man for a younger, smart engineering appearance. Only those two identities were replaced in the group scene; the approved other four portraits are unchanged. The two revised portraits were generated using that final group as the identity reference.

Resizing and WebP compression are mechanical export steps. All face, clothing and scene changes were performed with ImageGen.

## Base scene prompt

```text
Use case: photorealistic-natural.
Asset type: wide 16:9 website illustration of fictional Iranian software-studio coworkers at work, not a documentary photograph or an actual employee directory.
Primary request: A completely new, believable everyday Iranian product-development workroom with exactly SIX ADULT coworkers, FOUR MEN and TWO WOMEN, ages 35–54. Ordinary individually distinctive people, mature faces, uneven hairlines, normal bodies and lived-in skin. The user specifically needs older men with BALDING and fully BALD heads, rather than a uniformly young attractive model cast.
People, left-to-right: (1) a 53-year-old Iranian man, fully bald head with a little gray hair at the sides, short salt-and-pepper beard, rectangular reading glasses, broad nose, slightly heavyset build, faded blue small-check shirt; (2) a 44-year-old Iranian woman, ordinary mature face with visible smile lines and a slightly long nose, muted taupe headscarf, charcoal loose blouse; (3) a 38-year-old Iranian man with short dark hair and a noticeable receding hairline, clean-shaven round face, heavier build, plain navy polo; (4) a 35-year-old Iranian woman with an unretouched natural face and subtle under-eye shadows, small thin-frame glasses, simple dark headscarf and gray cardigan; (5) a 43-year-old Iranian man with graying slightly unkempt short hair, broad eyebrows, stubble, olive overshirt, average build; (6) a 49-year-old Iranian man with an unmistakably BALD crown and sparse gray side hair, slim build, narrow face, gray mustache and light stubble, dark brown crewneck sweater. All look like ordinary experienced Iranian engineers and creative workers, with individual facial asymmetry, small wrinkles and natural skin texture. No fashion models, no beauty retouching, no caricature of aging or ugliness.
Scene: a clean but modest, real small rented Iranian studio, practical cream walls, a window with simple roller blind, ordinary desks, mixed everyday monitors, office chairs, a couple of modest plants, cables managed but visible, a Persian tea glass and handwritten paper sketches. Real lived-in workspace, not a luxury co-working showroom, not a fantasy office. One discreet teal accent can relate to the LOXX website, but no brand logos or readable text.
Action and composition: candid eye-level 35mm-equivalent PHONE SNAPSHOT taken by a colleague from a few meters away, all six faces clearly visible and separated across a shared working table. Some people seated and one or two standing or leaning nearby. They are discussing an actual screen or sketch, looking between each other, not all posing toward the camera. Natural imperfect posture, attentive expressions, one restrained smile, not six beaming smiles. Medium-wide horizontal composition, leave headroom, include real office context. Nobody overlaps another face. Exactly six people and six distinct faces.
Lighting: normal soft window daylight mixed with regular room illumination; believable slightly imperfect white balance, soft shadows, gentle sensor grain, useful realistic depth of field so all faces remain readable. Natural ordinary photography, not a cinematic advertising shot.
Constraints: fully clothed modest professional everyday dress; accurate anatomy and normal hands; no text, no watermarks, no logos; no duplicate faces; no plastic skin, perfect Hollywood teeth, fashion styling, youthful glamour, neon lighting or staged uniform smiles.
```

## Final two-person scene edit prompt

Inputs: the base six-person group as the edit target, then the user's two crops to identify the far-right man and taupe-scarf woman.

```text
Use case: precise-object-edit / identity-preserve. Image1 is the EDIT TARGET: the wide illustration of six fictional Iranian coworkers around a desk. Images2 and3 ONLY identify the TWO OLD CHARACTERS to replace; do not copy their screenshots or Preview badges.
Replace EXACTLY TWO people in image1, all other people and the office stay unchanged:
A) The old bald MUSTACHED MAN at the FAR RIGHT, wearing a dark brown sweater, identified in image2. Replace him with a 31-year-old Iranian male software engineer, natural good-looking and well groomed, thick short dark hair neatly styled with a modest side part, dark brown eyes, natural masculine face and short tidy stubble. Smart ordinary engineer look: keep his existing dark brown fine-knit crewneck, add a discreet off-white shirt collar. Keep the same seated position, torso scale, hand-at-chin pose and gaze toward the discussion. No suit, tie or flashy accessories.
B) The mature WOMAN in the TAUPE SCARF standing second from LEFT, identified in image3. Replace her with a 29-year-old Iranian female design engineer, natural good-looking face, healthy unretouched skin, dark eyes, neat dark hair subtly visible at the front of the same taupe scarf, thin tasteful glasses, smart charcoal blouse with a simple tailored stone-gray jacket. Keep the same standing/leaning location, body scale, hands, gaze and expression of attention toward the laptop.
STRICT INVARIANTS: Keep the bald gray-bearded man WITH GLASSES at the FAR LEFT exactly the same and visibly older. Keep the receding-hairline navy-polo man in CENTER-LEFT exactly the same. Keep the black-scarf woman WITH GLASSES in CENTER-RIGHT exactly the same. Keep the gray-haired OLIVE-OVERSHIRT man standing toward the RIGHT exactly the same. Exactly six people total, FOUR MEN and TWO WOMEN. Do not replace or beautify those other four people. Preserve all desk objects, screens, tea glasses, plants, window, room layout, daylight, camera position and candid working atmosphere of image1.
Natural realistic phone photograph aesthetic, real pores, believable anatomy, no beauty filter, no fashion-ad polish. Both replacements should look youthful, professional and approachable, dressed like engineers. No text, labels, logos or watermarks. Keep the horizontal 16:9 composition.
```

## Portrait prompt for the two revised identities

Applied separately with the final group as the reference. Subject substitution:

- 02: `the YOUNG WOMAN standing SECOND FROM LEFT, age29, thin metal-frame glasses, taupe headscarf, dark top and tailored gray jacket`
- 06: `the YOUNG MAN seated at FAR RIGHT, age31, neatly styled thick short dark hair, tidy stubble, brown crewneck sweater and off-white shirt collar`

```text
Use case: identity-preserve. Create a single square 1:1 head-and-shoulders portrait of ONLY {subject}, from the provided fictional coworkers illustration. Preserve exactly their face, age, hair, glasses if present, outfit and modest clean engineer style from this reference. Fully visible head, modest headroom, chest and shoulders centered in frame. One person only, no other faces, no collages. Background: the same ordinary softly blurred Iranian software office and natural window daylight, consistent with the existing six role portraits. Camera: colleague's natural phone snapshot at eye level, realistic skin texture and slight asymmetry, warm restrained expression, no glamour lighting or beauty filter, no fashion-model pose, no age change. Professional and approachable, real-world ordinary workplace photography aesthetic. This is a named fictional role illustration, not documentation of a real employee. No text, no labels, no logos, no watermark.
```

## Portrait prompt for the four retained identities

Applied separately to the base group with the relevant subject description: far-left bald man in checked shirt (01); center-left receding-hairline man in navy polo (03); center-right woman in glasses, black scarf and cardigan (04); standing gray-haired man in olive overshirt (05).

```text
Use case: identity-preserve. Asset: one square 1:1 natural editorial head-and-shoulders portrait for a website role illustration, not an actual staff directory. Reference: a generated illustration of six fictional adult Iranian coworkers. Subject: ONLY {subject}. Preserve this exact person's identity, age, facial shape, hairline or baldness, glasses if present, body build, ordinary clothing, and natural skin texture from the reference. One person, head fully visible with generous headroom and upper chest, centered at eye level. Their face should be readable in a small website card. Photograph style: ordinary colleague's PHONE camera snapshot in the same modest Iranian software office, soft window daylight, gently blurred practical office background, lived-in skin with pores and fine wrinkles, natural facial asymmetry, relaxed neutral expression or slight restrained smile. Not a fashion headshot. No beauty retouch, no age reduction, no hair restoration, no glam makeup, no perfect model teeth, no cinematic spotlight. Fully clothed modest workwear. Square image, one face only, no text, no logos, no borders, no watermark. No other people or inset images.
```

## Supplied LOXX logo and icon

The supplied transparent branding pack is the source of the logo and symbol. These assets were mechanically extracted without redrawing or regenerating the logo. Coordinates are from the supplied 2048 × 682 PNG.

| File | Crop coordinates | Encoding |
| --- | --- | --- |
| `/brand/loxx-wordmark.webp` | 710 × 252 at x1120/y0, white/teal upper-right wordmark with tagline | Lossless WebP with original alpha |
| `/brand/loxx-symbol.webp` | 180 × 155 at x547/y510, standalone teal/dark X | Lossless WebP with original alpha |
| `/brand/loxx-icon.png` | 220 × 195 at x1790/y485, dark rounded app icon; resized to256² with transparent padding | PNG with alpha |

The edge detail and transparent white halo in the supplied raster pack are part of that source. A future supplied vector master can improve edge quality without redrawing the brand.

### Navigation logo derivative

`/brand/loxx-wordmark-nav.webp` is a purely mechanical resize of the unchanged full wordmark to426×151px, encoded as WebP quality87 with alpha quality90 (17,468bytes). It retains the source transparent logo and tagline; it is intended for the approximately148px header display at about3× resolution. The full-size lossless wordmark remains unchanged.

