#!/usr/bin/env python3
"""NOT PART OF THE BUILD. Kept for reference only.

The voice atlas this generated was removed on 2026-09-03: a map needs
language-geography data, we hold none, so every marker position was an invention,
and a language is not a point (Hindi is a belt of states, Sindhi in India is a
diaspora, Sanskrit has no speech community). A gradient or a state choropleth would
be a larger invented claim, not a smaller one. The voices section now uses a plot of
register against pace, which is measured and makes no territorial claim.

Restoring this needs the 13 MB India point-of-view boundary re-downloaded; the path
below will not exist in a new session. What is worth keeping from it: the
point-in-polygon assert, the self-intersection check, and the greedy label placement,
which now lives in page.js for the voice plot.

Generates the voice atlas geometry: an India outline plus one marker per language,
both projected with the same transform so every marker lands on land.

Boundary: Natural Earth 10m admin-0, **India point-of-view edition**
(ne_10m_admin_0_countries_ind). The default edition draws the line of control, which
for a map published from India is the wrong boundary; the POV edition carries the
claimed boundary (it reaches 37.05N against 35.50N) and includes the island
territories. Islands are kept as separate subpaths, so Andaman, Nicobar and
Lakshadweep are on the map rather than cropped out.

    python3 src/mapgen.py            # writes src/map.json
"""
import json
import math
from pathlib import Path

SRC = Path(__file__).parent
NE = Path("/tmp/claude-1004/-projects-data-ttsteam-ashwin-gemma-tts/"
          "601b3aa5-696a-4ed0-b711-925eb92173a5/scratchpad/ne10_ind.json")

# Where each language is spoken: (lon, lat). Languages whose homeland lies outside
# India are placed at the Indian region that speaks them -- Sindhi in Kutch, Nepali
# in the Darjeeling-Sikkim belt, Kashmiri in the Valley. Sanskrit has no modern
# speech community, so it sits on the Ganga plain where its literature was compiled.
LANGS = {
    "as":  (92.9, 26.2),   # Assamese  - Brahmaputra valley
    "bn":  (88.4, 23.0),   # Bengali   - Gangetic West Bengal
    "brx": (90.3, 26.4),   # Bodo      - Kokrajhar
    "doi": (74.9, 32.7),   # Dogri     - Jammu
    "gu":  (71.8, 22.3),   # Gujarati  - Saurashtra
    "hi":  (79.0, 26.8),   # Hindi     - upper Doab
    "kn":  (76.2, 14.5),   # Kannada   - central Karnataka
    "ks":  (74.8, 34.1),   # Kashmiri  - the Valley
    "kok": (74.0, 15.4),   # Konkani   - Goa
    "mai": (86.0, 26.2),   # Maithili  - Mithila
    "ml":  (76.4, 10.2),   # Malayalam - Kerala
    "mni": (93.9, 24.7),   # Manipuri  - Imphal
    "mr":  (75.5, 19.3),   # Marathi   - Marathwada
    "ne":  (88.3, 27.2),   # Nepali    - Darjeeling-Sikkim
    "or":  (85.0, 20.6),   # Odia      - Odisha
    "pa":  (75.4, 30.9),   # Punjabi   - Malwa
    "sa":  (82.0, 25.4),   # Sanskrit  - Kashi
    "sat": (86.7, 23.6),   # Santali   - Santal Parganas
    "sd":  (70.2, 23.2),   # Sindhi    - Kutch
    "ta":  (78.4, 10.9),   # Tamil     - Tamil Nadu interior
    "te":  (79.2, 16.6),   # Telugu    - coastal Andhra
    "ur":  (78.5, 17.4),   # Urdu      - Deccan
}

W, PAD, TOL = 100.0, 2.5, 0.22
MIN_ISLAND_PTS = 5           # below this a ring is a rock
MIN_DRAW = 1.1               # a ring smaller than this across is drawn as a mark
ISLET_R = 0.42               # radius of that mark
ISLET_MERGE = 1.3            # marks closer than this are one group


def perp(p, a, b):
    (px, py), (ax, ay), (bx, by) = p, a, b
    dx, dy = bx - ax, by - ay
    if dx == dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def rdp(pts, tol):
    """Ramer-Douglas-Peucker on an OPEN chain with distinct endpoints."""
    if len(pts) < 3:
        return pts
    i = max(range(1, len(pts) - 1), key=lambda k: perp(pts[k], pts[0], pts[-1]))
    if perp(pts[i], pts[0], pts[-1]) <= tol:
        return [pts[0], pts[-1]]
    return rdp(pts[:i + 1], tol)[:-1] + rdp(pts[i:], tol)


def simplify_ring(ring, tol):
    """Simplify a closed ring without mangling it.

    Running RDP over the ring as one chain whose endpoints are the same point makes
    the first perpendicular distance degenerate, and the result can lose a whole lobe
    and self-intersect -- which is how Jammu and Kashmir disappeared from an earlier
    version of this map while an even-odd point-in-polygon test still called the
    Kashmir marker "inside". Splitting at the two extremes gives two open chains with
    distinct endpoints, keeps the extremes as vertices, and cannot cross itself.
    """
    n = len(ring)
    if n < 8:
        return ring
    top = min(range(n), key=lambda i: ring[i][1])
    bot = max(range(n), key=lambda i: ring[i][1])
    lo, hi = sorted((top, bot))
    a, b = ring[lo:hi + 1], ring[hi:] + ring[:lo + 1]
    return rdp(a, tol)[:-1] + rdp(b, tol)[:-1]


def inside(pt, poly):
    """Ray casting, even-odd. Valid only for a simple (non-self-intersecting) ring."""
    x, y = pt
    hit = False
    for i in range(len(poly)):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % len(poly)]
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) / (y2 - y1) * (x2 - x1):
            hit = not hit
    return hit


def segments_cross(p1, p2, p3, p4):
    def o(a, b, c):
        v = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        return 0 if abs(v) < 1e-12 else (1 if v > 0 else -1)
    return o(p1, p2, p3) != o(p1, p2, p4) and o(p3, p4, p1) != o(p3, p4, p2)


def crossings(poly):
    n = len(poly)
    out = []
    for i in range(n):
        for j in range(i + 2, n):
            if i == 0 and j == n - 1:
                continue
            if segments_cross(poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n]):
                out.append((i, j))
    return out


def declick(poly, span=4):
    """Remove the spikes simplification leaves behind.

    RDP can pick two near-collinear vertices whose segments cross by a fraction of a
    unit, giving a three-segment bowtie. Dropping the vertex between them removes it
    without moving the coastline visibly. A crossing between segments that are far
    apart in the ring is a different animal -- that is a real topology error, so it
    raises instead of being silently patched.
    """
    for _ in range(12):
        cs = crossings(poly)
        if not cs:
            return poly
        far = [(i, j) for i, j in cs if min(j - i, len(poly) - (j - i)) > span]
        if far:
            raise AssertionError(f"outline self-intersects across the ring at {far[:3]}")
        drop = {(i + 1) % len(poly) for i, _ in cs}
        poly = [p for k, p in enumerate(poly) if k not in drop]
    raise AssertionError("could not remove all self-intersections in 12 passes")


def main():
    feat = next(f for f in json.load(NE.open())["features"] if f["properties"]["NAME"] == "India")
    geom = feat["geometry"]
    raw = [geom["coordinates"][0]] if geom["type"] == "Polygon" else [c[0] for c in geom["coordinates"]]
    raw = [[(float(x), float(y)) for x, y in r] for r in raw]
    raw.sort(key=len, reverse=True)
    rings = [r for r in raw if len(r) >= MIN_ISLAND_PTS]

    pts = [p for r in rings for p in r]
    lons = [p[0] for p in pts]; lats = [p[1] for p in pts]
    lon0, lon1, lat0, lat1 = min(lons), max(lons), min(lats), max(lats)
    # Equirectangular with the x axis scaled by cos(mean latitude): honest at this
    # size, and one line, so markers and outline cannot drift apart.
    kx = math.cos(math.radians((lat0 + lat1) / 2))
    sx = (W - 2 * PAD) / ((lon1 - lon0) * kx)
    H = (lat1 - lat0) * sx + 2 * PAD

    def proj(lon, lat):
        return (PAD + (lon - lon0) * kx * sx, PAD + (lat1 - lat) * sx)

    # Lakshadweep and the smaller Nicobar islands are real territory but measure a
    # fraction of a unit across at this scale, so their true outline renders as
    # nothing. Anything below MIN_DRAW becomes a mark at its centroid instead, which
    # is how a schematic map shows a small island group -- omitting them is not an
    # option on a map of India.
    subpaths, islets, mainland = [], [], None
    for r in rings:
        pr = [proj(*p) for p in r]
        xs = [q[0] for q in pr]; ys = [q[1] for q in pr]
        if mainland is not None and math.hypot(max(xs) - min(xs), max(ys) - min(ys)) < MIN_DRAW:
            cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
            if not any(math.hypot(cx - a, cy - b) < ISLET_MERGE for a, b, _ in islets):
                islets.append((round(cx, 1), round(cy, 1), ISLET_R))
            continue
        s = [(round(x, 2), round(y, 2)) for x, y in simplify_ring(pr, TOL)]
        if len(s) < 3:
            continue
        if mainland is None:
            before = len(s)
            s = declick(s)
            mainland = s
            if len(s) != before:
                print(f"  declick: removed {before - len(s)} spike vertex/vertices from the mainland")
        subpaths.append("M" + " L".join(f"{x},{y}" for x, y in s) + " Z")
    outline = " ".join(subpaths)

    # Markers, then labels. Eight candidate directions, first non-overlapping wins.
    R, LH, CW = 1.7, 2.7, 1.4
    dots, boxes = [], []
    for code, (lon, lat) in LANGS.items():
        x, y = proj(lon, lat)
        assert inside((x, y), mainland), f"{code} projects outside the outline at ({x:.1f}, {y:.1f})"
        dots.append({"code": code, "x": round(x, 1), "y": round(y, 1)})
        boxes.append((x - R, y - R, x + R, y + R))

    order = sorted(range(len(dots)), key=lambda i: -dots[i]["x"] if dots[i]["x"] > 60 else 0)
    GAP = 0.6
    for i in order:
        d = dots[i]
        w = len(d["code"]) * CW
        placed = None
        for dx, dy, anchor in [(R + 0.9, 0.9, "start"), (-(R + 0.9), 0.9, "end"),
                               (R + 0.6, -1.5, "start"), (-(R + 0.6), -1.5, "end"),
                               (R + 0.6, 3.2, "start"), (-(R + 0.6), 3.2, "end"),
                               (0, -2.4, "middle"), (0, 4.1, "middle")]:
            lx, ly = d["x"] + dx, d["y"] + dy
            x0 = lx if anchor == "start" else (lx - w if anchor == "end" else lx - w / 2)
            box = (x0 - GAP, ly - LH + GAP, x0 + w + GAP, ly + GAP)
            if not any(box[0] < b[2] and b[0] < box[2] and box[1] < b[3] and b[1] < box[3] for b in boxes):
                placed = (lx, ly, anchor, box)
                break
        if placed is None:
            lx, ly, anchor = d["x"] + R + 0.9, d["y"] + 0.9, "start"
            placed = (lx, ly, anchor, (lx, ly - LH, lx + w, ly))
        d["lx"], d["ly"], d["anchor"] = round(placed[0], 1), round(placed[1], 1), placed[2]
        boxes.append(placed[3])

    out = {"w": round(W, 1), "h": round(H, 1), "r": R, "outline": outline,
           "islets": [{"x": x, "y": y, "r": r} for x, y, r in islets],
           "rings": len(subpaths), "source": "Natural Earth 10m, India point-of-view edition",
           "dots": sorted(dots, key=lambda d: d["code"])}
    (SRC / "map.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
    print(f"viewBox 0 0 {W:.0f} {H:.1f} | {len(subpaths)} subpaths "
          f"({len(mainland)} points on the mainland) + {len(islets)} island marks "
          f"| {len(outline)} chars | {len(dots)} markers")
    print(f"lat {lat0:.2f}..{lat1:.2f}  lon {lon0:.2f}..{lon1:.2f}")


main()
