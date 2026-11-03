"""Génère la collection de stickers de coiffure Daloura (SVG 100x110)."""
import math, json, os

INK = "#2B1D19"      # contour et cheveux noirs
CREAM = "#F5EFE6"
GOLD = "#E8A93A"
GOLD_HI = "#F6D58F"
ROSE = "#E8C3CB"
WINE = "#702D43"
BROWN = "#49332F"
LIP = "#7A2E3E"

def f(x): return ("%.1f" % x).rstrip("0").rstrip(".")

def braid(x0, y0, x1, y1, w, col, hi, n=None, cuffs=()):
    """Tresse en chevrons de (x0,y0) à (x1,y1)."""
    L = math.hypot(x1-x0, y1-y0); ang = math.degrees(math.atan2(y1-y0, x1-x0)) - 90
    n = n or max(3, int(L / 3.6))
    out = [f'<g transform="translate({f(x0)} {f(y0)}) rotate({f(ang)})">',
           f'<rect x="{f(-w/2)}" y="0" width="{f(w)}" height="{f(L)}" rx="{f(w/2)}" fill="{col}"/>']
    step = L / n
    for i in range(1, n):
        y = i*step
        out.append(f'<path d="M{f(-w/2+0.6)} {f(y-1.4)} L0 {f(y)} L{f(w/2-0.6)} {f(y-1.4)}" fill="none" stroke="{hi}" stroke-width="0.8" stroke-linecap="round"/>')
    for c in cuffs:
        y = L*c
        out.append(f'<rect x="{f(-w/2-0.4)}" y="{f(y-1.3)}" width="{f(w+0.8)}" height="2.6" rx="0.8" fill="{GOLD}"/>')
        out.append(f'<rect x="{f(-w/2+0.2)}" y="{f(y-0.9)}" width="{f(w*0.35)}" height="0.8" rx="0.4" fill="{GOLD_HI}"/>')
    out.append('</g>')
    return "".join(out)

def loc(x0, y0, x1, y1, w, col, hi, wraps=()):
    L = math.hypot(x1-x0, y1-y0); ang = math.degrees(math.atan2(y1-y0, x1-x0)) - 90
    n = max(3, int(L / 4.2)); step = L/n
    out = [f'<g transform="translate({f(x0)} {f(y0)}) rotate({f(ang)})">',
           f'<rect x="{f(-w/2)}" y="0" width="{f(w)}" height="{f(L)}" rx="{f(w/2)}" fill="{col}"/>']
    for i in range(1, n):
        y = i*step
        out.append(f'<path d="M{f(-w/2+0.5)} {f(y)} Q0 {f(y+1.3)} {f(w/2-0.5)} {f(y)}" fill="none" stroke="{hi}" stroke-width="0.8" stroke-linecap="round"/>')
    for c in wraps:
        y = L*c
        for k in range(3):
            out.append(f'<path d="M{f(-w/2)} {f(y+k*1.3)} L{f(w/2)} {f(y+k*1.3-0.9)}" stroke="{GOLD}" stroke-width="0.8"/>')
    out.append('</g>')
    return "".join(out)

def bead(x, y, r=2.4):
    return (f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{GOLD}" stroke="{INK}" stroke-width="0.5"/>'
            f'<circle cx="{f(x-r*0.35)}" cy="{f(y-r*0.35)}" r="{f(r*0.32)}" fill="{GOLD_HI}"/>')

# ---------- base commune ----------
def body(skin, shade, top, deco=None):
    s = [f'<path d="M11 110 Q13 85 50 82 Q87 85 89 110 Z" fill="{top}" stroke="{INK}" stroke-width="1"/>']
    if deco == "wax":   # petit motif wax doré
        for x, y in ((22, 100), (32, 94), (44, 104), (58, 100), (70, 94), (80, 103), (26, 108), (66, 108), (50, 96)):
            s.append(f'<circle cx="{x}" cy="{y}" r="2.1" fill="none" stroke="{GOLD}" stroke-width="0.9"/><circle cx="{x}" cy="{y}" r="0.7" fill="{GOLD}"/>')
    if deco == "stripe":
        s.append(f'<path d="M15 98 Q50 92 85 98" fill="none" stroke="{CREAM}" stroke-width="2.2" opacity=".85"/>')
    s.append(f'<path d="M41 83.5 Q50 92 59 83.5" fill="{shade}" stroke="{INK}" stroke-width="0.9"/>')
    s.append(f'<path d="M43 62 L43 84 Q50 90 57 84 L57 62 Z" fill="{shade}" stroke="{INK}" stroke-width="0.9"/>')
    s.append(f'<path d="M44.2 70.4 Q50 74.4 55.8 70.4" fill="none" stroke="{INK}" stroke-width="0.6" opacity=".35"/>')
    if deco == "cowries":   # collier de cauris
        for i, x in enumerate((42.4, 46.2, 50, 53.8, 57.6)):
            y = 86.2 + (0 if i in (0, 4) else 1.6 if i in (1, 3) else 2.2)
            s.append(f'<ellipse cx="{x}" cy="{f(y)}" rx="1.5" ry="2" fill="{CREAM}" stroke="{INK}" stroke-width="0.45"/><path d="M{x} {f(y-1.1)} L{x} {f(y+1.1)}" stroke="{INK}" stroke-width="0.4"/>')
    if deco == "chain":
        s.append(f'<path d="M42 84.8 Q50 92.4 58 84.8" fill="none" stroke="{GOLD}" stroke-width="0.9"/><circle cx="50" cy="89.8" r="1.6" fill="{GOLD}" stroke="{INK}" stroke-width="0.4"/>')
    return "".join(s)

def head(skin, shade, eyes="open", mouth="open", face=(15.6, 18.6), brow="arch", extra=()):
    rx, ry = face
    s = [f'<ellipse cx="34.6" cy="54" rx="2.7" ry="3.8" fill="{skin}" stroke="{INK}" stroke-width="0.8"/>',
         f'<ellipse cx="65.4" cy="54" rx="2.7" ry="3.8" fill="{skin}" stroke="{INK}" stroke-width="0.8"/>',
         f'<ellipse cx="50" cy="52.5" rx="{rx}" ry="{ry}" fill="{skin}" stroke="{INK}" stroke-width="1"/>',
         # ombre peinte côté droit (aplat, pas de dégradé)
         f'<path d="M{f(50+rx*0.5)} {f(52.5-ry*0.86)} Q{f(50+rx*1.06)} {f(52.5-ry*0.2)} {f(50+rx*0.86)} {f(52.5+ry*0.5)} Q{f(50+rx*0.5)} {f(52.5+ry*0.95)} {f(50+rx*0.05)} {f(52.5+ry*0.99)} Q{f(50+rx*0.62)} {f(52.5+ry*0.6)} {f(50+rx*0.74)} {f(52.5+ry*0.06)} Q{f(50+rx*0.8)} {f(52.5-ry*0.5)} {f(50+rx*0.5)} {f(52.5-ry*0.86)} Z" fill="{shade}" opacity=".38"/>',
         f'<ellipse cx="40.6" cy="59.2" rx="3.3" ry="2" fill="{ROSE}" opacity=".6"/>',
         f'<ellipse cx="59.4" cy="59.2" rx="3.3" ry="2" fill="{ROSE}" opacity=".5"/>']
    if brow == "arch":
        s.append(f'<path d="M40.4 47.4 Q43.6 44.6 47.4 46.4" fill="none" stroke="{INK}" stroke-width="1.4" stroke-linecap="round"/>')
        s.append(f'<path d="M52.6 46.4 Q56.4 44.6 59.6 47.4" fill="none" stroke="{INK}" stroke-width="1.4" stroke-linecap="round"/>')
    else:  # sourcils droits, un peu relevés : l'air sûr de soi
        s.append(f'<path d="M40.6 47 L47.2 46.2" fill="none" stroke="{INK}" stroke-width="1.6" stroke-linecap="round"/>')
        s.append(f'<path d="M52.8 46.2 L59.4 45.4" fill="none" stroke="{INK}" stroke-width="1.6" stroke-linecap="round"/>')
    if eyes == "open":
        for cx in (44, 56):
            s.append(f'<ellipse cx="{cx}" cy="52.2" rx="1.95" ry="2.35" fill="{INK}"/>')
            s.append(f'<circle cx="{cx+0.65}" cy="51.35" r="0.7" fill="{CREAM}"/>')
        s.append(f'<path d="M41.2 50.7 Q44 49 46.9 50.4 M53.1 50.4 Q56 49 58.8 50.7" fill="none" stroke="{INK}" stroke-width="1" stroke-linecap="round"/>')
        s.append(f'<path d="M41.3 50.8 l-1.2 -0.9 M58.7 50.8 l1.2 -0.9" stroke="{INK}" stroke-width="0.8" stroke-linecap="round"/>')
    elif eyes == "wink":
        s.append(f'<ellipse cx="44" cy="52.2" rx="1.95" ry="2.35" fill="{INK}"/><circle cx="44.65" cy="51.35" r="0.7" fill="{CREAM}"/>')
        s.append(f'<path d="M41.2 50.7 Q44 49 46.9 50.4" fill="none" stroke="{INK}" stroke-width="1" stroke-linecap="round"/><path d="M41.3 50.8 l-1.2 -0.9" stroke="{INK}" stroke-width="0.8" stroke-linecap="round"/>')
        s.append(f'<path d="M53.2 52.8 Q56 50 58.8 52.8" fill="none" stroke="{INK}" stroke-width="1.5" stroke-linecap="round"/><path d="M58.6 52.4 l1.1 -0.9" stroke="{INK}" stroke-width="0.9" stroke-linecap="round"/>')
    else:  # yeux rieurs
        s.append(f'<path d="M41.2 52.8 Q44 49.8 46.8 52.8 M53.2 52.8 Q56 49.8 58.8 52.8" fill="none" stroke="{INK}" stroke-width="1.5" stroke-linecap="round"/>')
        s.append(f'<path d="M41.4 52.4 l-1.1 -0.9 M58.6 52.4 l1.1 -0.9" stroke="{INK}" stroke-width="0.9" stroke-linecap="round"/>')
    s.append(f'<path d="M49.4 54.4 Q47.8 58 50.8 58.6" fill="none" stroke="{shade}" stroke-width="1.15" stroke-linecap="round"/>')
    if mouth == "open":
        s.append(f'<path d="M44.2 61.6 Q50 68.8 55.8 61.6 Q50 63.2 44.2 61.6 Z" fill="{LIP}" stroke="{INK}" stroke-width="0.7" stroke-linejoin="round"/>')
        s.append(f'<path d="M45.5 62.2 Q50 63.7 54.5 62.2 Q50 64.7 45.5 62.2 Z" fill="{CREAM}"/>')
        s.append(f'<path d="M47.6 66.2 Q50 67.2 52.4 66.2" fill="none" stroke="{ROSE}" stroke-width="0.8" stroke-linecap="round" opacity=".7"/>')
    else:
        s.append(f'<path d="M44.6 61.8 Q47.4 60.6 50 61.6 Q52.6 60.6 55.4 61.8 Q50 66.4 44.6 61.8 Z" fill="{LIP}" stroke="{INK}" stroke-width="0.6" stroke-linejoin="round"/>')
        s.append(f'<path d="M45.4 62.2 Q50 63.6 54.6 62.2" fill="none" stroke="{INK}" stroke-width="0.7" stroke-linecap="round"/>')
        s.append(f'<path d="M47.6 64 Q50 64.8 52.4 64" fill="none" stroke="{ROSE}" stroke-width="0.7" stroke-linecap="round" opacity=".7"/>')
    if "mark" in extra:
        s.append(f'<circle cx="58.4" cy="62.2" r="0.6" fill="{INK}"/>')
    if "freckles" in extra:
        for x, y in ((41, 56.8), (42.6, 57.6), (39.6, 57.8), (59, 56.8), (57.4, 57.6), (60.4, 57.8)):
            s.append(f'<circle cx="{x}" cy="{y}" r="0.42" fill="{shade}"/>')
    if "stud" in extra:
        s.append(f'<circle cx="52.4" cy="57.6" r="0.75" fill="{GOLD}" stroke="{INK}" stroke-width="0.3"/>')
    return "".join(s)

def edges(left=True, right=True):
    """Baby hairs plaqués en vagues sur les tempes."""
    out = []
    if left:
        out.append(f'<path d="M34.4 47.4 Q35.4 44.6 38 44.8 Q36.4 45.6 37.2 47 Q38.4 46 39.6 46.6" fill="none" stroke="{INK}" stroke-width="0.75" stroke-linecap="round"/>')
    if right:
        out.append(f'<path d="M65.6 47.4 Q64.6 44.6 62 44.8 Q63.6 45.6 62.8 47 Q61.6 46 60.4 46.6" fill="none" stroke="{INK}" stroke-width="0.75" stroke-linecap="round"/>')
    return "".join(out)

def jewel(kind):
    if kind == "hoops":
        return (f'<circle cx="34.6" cy="60.6" r="2.9" fill="none" stroke="{GOLD}" stroke-width="1.35"/>'
                f'<circle cx="65.4" cy="60.6" r="2.9" fill="none" stroke="{GOLD}" stroke-width="1.35"/>'
                f'<path d="M32.6 59.4 Q33 58.2 34 57.8" stroke="{GOLD_HI}" stroke-width="0.6" fill="none"/>')
    if kind == "drops":
        return "".join(f'<path d="M{x} 57.6 L{x} 60.4" stroke="{GOLD}" stroke-width="0.8"/><path d="M{x} 60 Q{x-2.2} 63 {x} 65 Q{x+2.2} 63 {x} 60 Z" fill="{GOLD}" stroke="{INK}" stroke-width="0.4"/>' for x in (34.6, 65.4))
    if kind == "studs":
        return "".join(f'<circle cx="{x}" cy="57.8" r="1.4" fill="{GOLD}" stroke="{INK}" stroke-width="0.4"/>' for x in (34.6, 65.4))
    return ""

def _old_hoops():
    return (f'<circle cx="34.6" cy="60.4" r="2.8" fill="none" stroke="{GOLD}" stroke-width="1.3"/>'
            f'<circle cx="65.4" cy="60.4" r="2.8" fill="none" stroke="{GOLD}" stroke-width="1.3"/>')

def shine(d):
    return f'<path d="{d}" fill="none" stroke="{CREAM}" stroke-width="1.3" stroke-linecap="round" opacity=".55"/>'

CAP = "M33.2 50.5 Q32.6 30 50 28.8 Q67.4 30 66.8 50.5 Q63.6 39.2 57.2 36.2 Q50 33.6 42.8 36.2 Q36.4 39.2 33.2 50.5 Z"

# ---------- coiffures ----------
def fulani(skin, shade):
    hi = "#5E4034"
    back = f'<ellipse cx="50" cy="47" rx="20.5" ry="22" fill="{INK}"/>'
    front = [f'<path d="{CAP}" fill="{INK}"/>']
    # cornrows : rangées qui partent du front vers l'arrière
    for x0, x1 in ((39.5, 42.5), (44.5, 46.4), (55.5, 53.6), (60.5, 57.5)):
        front.append(f'<path d="M{x0} {37.5 if x0<42 or x0>58 else 35.4} Q{(x0+x1)/2} 31.5 {x1} 29.6" fill="none" stroke="{hi}" stroke-width="1.6" stroke-linecap="round"/>')
        front.append(f'<path d="M{x0} {37.5 if x0<42 or x0>58 else 35.4} Q{(x0+x1)/2} 31.5 {x1} 29.6" fill="none" stroke="{INK}" stroke-width="0.5" stroke-dasharray="1 1.2"/>')
    front.append(f'<path d="M50 34.2 L50 28.6" stroke="{shade}" stroke-width="0.9"/>')
    front.append(bead(50, 30.6, 1.8)); front.append(bead(41.2, 33.2, 1.5)); front.append(bead(58.8, 33.2, 1.5))
    # tresses latérales devant les oreilles, avec perles
    front.append(braid(34.6, 44, 31.6, 101, 4.4, INK, hi, cuffs=(0.42,)))
    front.append(braid(65.4, 44, 68.4, 101, 4.4, INK, hi, cuffs=(0.42,)))
    front.append(bead(31.7, 99.5, 2.9)); front.append(bead(68.3, 99.5, 2.9))
    front.append(bead(32.9, 76, 2.3)); front.append(bead(67.1, 76, 2.3))
    # tresses arrière qui passent derrière les épaules
    back += (braid(27.5, 52, 23, 108, 4.2, INK, hi) + braid(72.5, 52, 77, 108, 4.2, INK, hi)
             + braid(31, 50, 27.6, 110, 4.2, INK, hi) + braid(69, 50, 72.4, 110, 4.2, INK, hi))
    # tresse couronne sur le dessus
    back += f'<path d="M31.4 40 Q50 15.6 68.6 40" fill="none" stroke="{INK}" stroke-width="5.2" stroke-linecap="round"/>'
    back += f'<path d="M31.4 40 Q50 15.6 68.6 40" fill="none" stroke="{hi}" stroke-width="0.8" stroke-dasharray="1.6 1.8"/>'
    back += bead(50, 27.6, 2.2)
    front.append(shine("M38.8 41 Q41.5 36 46 34.6"))
    front.append(edges())
    return back, "".join(front)

def knots(skin, shade):
    hi = "#6E4C3E"
    back = ""
    front = [f'<path d="M33.4 50.6 Q33 31.2 50 30.2 Q67 31.2 66.6 50.6 Q62.4 40.4 50 39.8 Q37.6 40.4 33.4 50.6 Z" fill="{INK}"/>']
    # raies (triangles de cuir chevelu)
    front.append(f'<path d="M50 39.8 L50 31 M41.5 42 L38.5 33.5 M58.5 42 L61.5 33.5 M36 46 L31 42 M64 46 L69 42" stroke="{shade}" stroke-width="1" stroke-linecap="round"/>')
    for (x, y, r) in ((50, 21.8, 7.6), (36.4, 27.8, 6.8), (63.6, 27.8, 6.8), (29.2, 40.6, 6), (70.8, 40.6, 6)):
        front.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{INK}"/>')
        # spirale du nœud
        a = r*0.62
        front.append(f'<path d="M{f(x-a)} {f(y)} A{f(a)} {f(a)} 0 1 1 {f(x)} {f(y+a)} A{f(a*0.62)} {f(a*0.62)} 0 1 1 {f(x-a*0.3)} {f(y-a*0.3)} A{f(a*0.3)} {f(a*0.3)} 0 1 1 {f(x+a*0.15)} {f(y+a*0.2)}" fill="none" stroke="{hi}" stroke-width="1.15" stroke-linecap="round"/>')
        front.append(shine(f"M{f(x-r*0.55)} {f(y-r*0.45)} Q{f(x-r*0.2)} {f(y-r*0.8)} {f(x+r*0.2)} {f(y-r*0.78)}"))
    front.append(edges())
    return back, "".join(front)

def knotless(skin, shade):
    hi = "#5E4034"
    back = (f'<ellipse cx="50" cy="46" rx="21" ry="22.5" fill="{INK}"/>'
            + braid(29, 50, 24.5, 109, 4.4, INK, hi) + braid(71, 50, 75.5, 109, 4.4, INK, hi)
            + braid(33, 54, 30.5, 110, 4.4, INK, hi) + braid(67, 54, 69.5, 110, 4.4, INK, hi))
    front = [f'<path d="{CAP}" fill="{INK}"/>',
             f'<path d="M50 35 L50 28.8" stroke="{shade}" stroke-width="1"/>',
             f'<path d="M44 36 L42 30.4 M56 36 L58 30.4 M38.6 39.6 L36 34.4 M61.4 39.6 L64 34.4" stroke="{shade}" stroke-width="0.7" opacity=".8"/>']
    # tresses devant les épaules
    front.append(braid(34.2, 45, 36.6, 106, 4.2, INK, hi, cuffs=(0.62,)))
    front.append(braid(65.8, 45, 63.4, 106, 4.2, INK, hi, cuffs=(0.62,)))
    front.append(braid(37.6, 46, 41.4, 103, 3.8, INK, hi))
    front.append(braid(62.4, 46, 58.6, 103, 3.8, INK, hi))
    front.append(shine("M39 41 Q42 35.5 47 34.4"))
    front.append(edges())
    return back, "".join(front)

def locs(skin, shade):
    hi = "#6B4A3A"
    back = (f'<ellipse cx="50" cy="45" rx="22" ry="22" fill="{INK}"/>'
            + loc(28, 46, 23, 104, 7, INK, hi) + loc(72, 46, 77, 104, 7, INK, hi))
    front = [f'<ellipse cx="50" cy="23.5" rx="12.5" ry="8" fill="{INK}"/>',
             f'<path d="M39 24 Q44 19 50 18.5 M41 28 Q46 22.6 55 21 M45 30 Q53 25 61 25" fill="none" stroke="{hi}" stroke-width="1.1" stroke-linecap="round"/>',
             f'<path d="M37.6 27.6 Q50 31.6 62.4 27.6" fill="none" stroke="{GOLD}" stroke-width="1.8"/>',
             f'<path d="M33 49.5 Q32.6 29.4 50 28.4 Q67.4 29.4 67 49.5 Q58.4 37.2 50 37 Q41.6 37.2 33 49.5 Z" fill="{INK}"/>',
             f'<path d="M42 36.8 L40 30.6 M50 37 L50 29 M58 36.8 L60 30.6" stroke="{hi}" stroke-width="1" stroke-linecap="round"/>']
    front.append(loc(34.4, 45, 35.6, 98, 6.4, INK, hi, wraps=(0.5,)))
    front.append(loc(65.6, 45, 64.4, 98, 6.4, INK, hi))
    front.append(shine("M41 22.4 Q45 19.8 49 19.6"))
    return back, "".join(front)

def perruque(skin, shade):
    col, mid, hi = "#5B3522", "#633A26", "#C08A55"
    back = (f'<path d="M50 24.5 C29 24.5 22.4 39 23.6 56 C24.4 67 19 75 20.8 88 C22 97 26.4 103 31 104.6 C29.6 101 31.6 98.4 30.4 94 '
            f'C33.6 96.6 36.4 96 37.6 93 L37.6 78 L62.4 78 L62.4 93 C63.6 96 66.4 96.6 69.6 94 C68.4 98.4 70.4 101 69 104.6 '
            f'C73.6 103 78 97 79.2 88 C81 75 75.6 67 76.4 56 C77.6 39 71 24.5 50 24.5 Z" fill="{col}"/>')
    front = [f'<path d="M50 28.4 C38.4 28.6 32.4 36.6 31.8 48.4 C31.2 58.6 28.6 67 27.4 78 C32.6 73 35.6 64 36.4 53 C37 43 42 35.2 50 32.8 Z" fill="{mid}"/>',
             f'<path d="M50 28.4 C61.6 28.6 67.6 36.6 68.2 48.4 C68.8 58.6 71.4 67 72.6 78 C67.4 73 64.4 64 63.6 53 C63 43 58 35.2 50 32.8 Z" fill="{mid}"/>',
             f'<path d="M50 27.6 L50 33" stroke="{shade}" stroke-width="0.9"/>',
             f'<path d="M30.4 58 Q34.4 64.5 30.6 71.5 M69.6 58 Q65.6 64.5 69.4 71.5 M25.2 80 Q30 88 25.8 97 M74.8 80 Q70 88 74.2 97 M28 44 Q30.6 50 27.6 56 M72 44 Q69.4 50 72.4 56" fill="none" stroke="{hi}" stroke-width="1.5" stroke-linecap="round"/>',
             f'<path d="M35.4 40.4 Q37.8 34.4 44.6 31.6" fill="none" stroke="{hi}" stroke-width="2" stroke-linecap="round"/>',
             f'<path d="M64.6 40.4 Q62.2 34.4 55.4 31.6" fill="none" stroke="{hi}" stroke-width="1.2" stroke-linecap="round" opacity=".75"/>',
             shine("M38 37 Q40.4 33.2 45 31.6")]
    return back, "".join(front)

def afro(skin, shade):
    hi = "#5E4034"
    pts = []
    R = 31.5; cx, cy = 50, 41
    puffs = "".join(f'<circle cx="{f(cx+R*math.cos(a))}" cy="{f(cy+R*0.92*math.sin(a))}" r="6.2" fill="{INK}"/>'
                    for a in [i*2*math.pi/22 for i in range(22)] if math.sin(a) < 0.62)
    back = f'<ellipse cx="{cx}" cy="{cy}" rx="{R}" ry="{R*0.92}" fill="{INK}"/>' + puffs
    # texture : petites boucles
    import random
    random.seed(4)
    coils = []
    for _ in range(26):
        a = random.uniform(0, 2*math.pi); rr = random.uniform(8, 29)
        x = cx + rr*math.cos(a); y = cy + rr*0.9*math.sin(a)
        if 34 < x < 66 and y > 36: continue
        coils.append(f'<path d="M{f(x-1.4)} {f(y)} a1.4 1.4 0 1 1 1.4 1.4" fill="none" stroke="{hi}" stroke-width="0.9" stroke-linecap="round"/>')
    back += "".join(coils)
    front = [f'<path d="M33.6 50 Q33.8 34 50 33 Q66.2 34 66.4 50 Q62 40.4 50 39.6 Q38 40.4 33.6 50 Z" fill="{INK}"/>',
             f'<path d="M23 38 Q50 18 77 38" fill="none" stroke="{ROSE}" stroke-width="4.4" stroke-linecap="round"/>',
             f'<path d="M23 38 Q50 18 77 38" fill="none" stroke="{WINE}" stroke-width="1" stroke-dasharray="2.2 2.4" stroke-linecap="round"/>',
             shine("M27 28 Q33 18 43 14.6"), shine("M62 14 Q66 15.6 69 18")]
    return back, "".join(front)

def selfie_hair(skin, shade):
    back = f'<ellipse cx="50" cy="40" rx="19.5" ry="17" fill="{INK}"/><circle cx="50" cy="22" r="8.5" fill="{INK}"/>'
    front = [f'<path d="M33.6 49 Q33.6 33 50 32.4 Q66.4 33 66.4 49 Q60 39.4 50 38.8 Q40 39.4 33.6 49 Z" fill="{INK}"/>',
             f'<path d="M42.4 27.6 Q50 31 57.6 27.6" fill="none" stroke="{GOLD}" stroke-width="1.6"/>',
             shine("M45 18 Q49 15.6 53 16.4"), shine("M38.6 42.6 Q41.6 37.6 47 36")]
    return back, "".join(front)

STYLES = {
    # nom : coiffure, peau, ombre, haut, motif, yeux, bouche, visage (rx, ry), sourcils, bijoux, détails, inclinaison
    "fulani":   dict(fn=fulani,   skin="#6B3E2E", shade="#4E2C21", top=WINE,   deco="wax",     eyes="open",  mouth="open",  face=(15.2, 18.8), brow="arch",     jewel="drops", extra=("stud",),     tilt=-3),
    "knots":    dict(fn=knots,    skin="#A06A4F", shade="#7E5039", top=BROWN,  deco="stripe",  eyes="smile", mouth="open",  face=(16, 18.2),   brow="arch",     jewel="hoops", extra=("freckles",), tilt=4),
    "knotless": dict(fn=knotless, skin="#8A5A44", shade="#6A4232", top=ROSE,   deco="chain",   eyes="open",  mouth="smile", face=(15.4, 18.8), brow="straight", jewel="studs", extra=("mark",),     tilt=-2),
    "locs":     dict(fn=locs,     skin="#5A3426", shade="#3F2318", top=WINE,   deco="cowries", eyes="smile", mouth="open",  face=(15.8, 18.4), brow="arch",     jewel="hoops", extra=(),             tilt=3),
    "perruque": dict(fn=perruque, skin="#7A4A35", shade="#5C3526", top=ROSE,   deco="chain",   eyes="wink",  mouth="open",  face=(15.2, 18.9), brow="arch",     jewel="drops", extra=("mark",),     tilt=-4),
    "afro":     dict(fn=afro,     skin="#6B3E2E", shade="#4E2C21", top=BROWN,  deco="cowries", eyes="smile", mouth="smile", face=(16.2, 18.2), brow="straight", jewel="hoops", extra=(),             tilt=2),
    "selfie":   dict(fn=selfie_hair, skin="#7A4A35", shade="#5C3526", top=WINE, deco=None,     eyes="open",  mouth="smile", face=(15.6, 18.6), brow="arch",     jewel="hoops", extra=(),             tilt=0),
}

def svg(name, skin=None, shade=None, tilt=None):
    st = STYLES[name]
    skin = skin or st["skin"]; shade = shade or st["shade"]
    t = st["tilt"] if tilt is None else tilt
    b, fr = st["fn"](skin, shade)
    rot = f' transform="rotate({t} 50 84)"' if t else ""
    inner = (f'<g{rot}>{b}</g>' + body(skin, shade, st["top"], st["deco"])
             + f'<g{rot}>' + head(skin, shade, st["eyes"], st["mouth"], st["face"], st["brow"], st["extra"]) + jewel(st["jewel"]) + fr + '</g>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">{inner}</svg>'

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "out"); os.makedirs(out, exist_ok=True)
    for n in STYLES:
        open(os.path.join(out, f"portrait-{n}.svg"), "w").write(svg(n))
    print({n: len(svg(n)) for n in STYLES})
