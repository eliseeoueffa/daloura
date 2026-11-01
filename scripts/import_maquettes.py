#!/usr/bin/env python3
"""Convertit les maquettes validées (design/maquettes/*.dc.html) en écrans React.

Chaque maquette devient src/screens/<Nom>.tsx : même structure, mêmes classes
(src/styles/daloura.css), liens internes en <Link>, images en assets locaux.
Ces écrans sont statiques (fausses données) : on les rend dynamiques étape
par étape. Relancer le script écrase les fichiers générés.

Usage : python3 scripts/import_maquettes.py
"""
from __future__ import annotations

import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design" / "maquettes"
OUT = ROOT / "src" / "screens"

# Images du canevas de maquettes -> assets du dépôt
BLOBS = {
    "1256d9436cf3a94f9ce38866b1a3e1a0": "fulani",
    "980afcc3aeaa7f368928238c85e7b5f0": "knots",
    "3ae7835cd76617bcc8c9539765e16470": "knotless",
    "0d9e4bf95aafa160ba825e551ce02903": "selfie",
    "11b32333f4f128846ddb2b7a51373b0f": "perruque",
    "105e3623df0e3fb360732f931406c631": "afro",
    "7f3912bee644738bfcb2d660b8922085": "locs",
    "beb8e6ca24911f9e6b87f82a931fc6f1": "logo",
    "ab80fb77058a7fb1a9428fc9b12a6fe4": "logoInv",
    "21cdbea27871cc142d05e37334af6bd5": "raies",
}

# Écrans rendus dynamiques à la main : le script ne les écrase plus (il garde leur route).
EXCLUS = {
    # Étape 2 : comptes
    "Connexion", "Code-nouveau", "Code-confirmation", "Consentement", "Code-saisie",
    "Code-oublie", "Code-mail-envoye", "Code-erreur", "Code-bloque", "Code-different",
    "Email-existant",
}

# Écrans sans maquette, ajoutés au registre : (route, titre, composant).
EXTRAS = [
    ("/email-a-verifier", "Vérifie ton email", "EmailAVerifier"),
    ("/email-verifie", "Email vérifié", "EmailVerifie"),
]

NUMERIC = {"maxLength", "aria-valuenow", "aria-valuemin", "aria-valuemax", "tabIndex", "rows", "cols"}
VOID = {"img", "input", "br", "hr", "meta", "link", "source"}

ATTR = {
    "class": "className",
    "for": "htmlFor",
    "maxlength": "maxLength",
    "autocomplete": "autoComplete",
    "inputmode": "inputMode",
    "enterkeyhint": "enterKeyHint",
    "autocapitalize": "autoCapitalize",
    "autocorrect": "autoCorrect",
    "spellcheck": "spellCheck",
    "tabindex": "tabIndex",
    "readonly": "readOnly",
    "viewbox": "viewBox",
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "fill-rule": "fillRule",
    "clip-rule": "clipRule",
    "stroke-dasharray": "strokeDasharray",
}


def route_of(stem: str) -> str:
    return "/" if stem == "Main" else "/" + stem.lower()


def comp_of(stem: str) -> str:
    name = "".join(part[:1].upper() + part[1:] for part in stem.split("-"))
    return "Accueil" if name == "Main" else name


def blob_ref(value: str) -> str | None:
    m = re.search(r"/_blob/([0-9a-f]{32})", value)
    return BLOBS.get(m.group(1)) if m else None


def js_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def style_obj(css: str) -> str:
    parts = []
    for decl in css.split(";"):
        if ":" not in decl:
            continue
        k, v = decl.split(":", 1)
        k, v = k.strip(), v.strip()
        if not k:
            continue
        if k.startswith("--"):
            key = js_str(k)
        else:
            key = re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)
        ref = blob_ref(v)
        if ref:
            val = "`" + re.sub(r"/_blob/[0-9a-f]{32}", "${IMG." + ref + "}", v).replace('"', "") + "`"
        else:
            val = js_str(v)
        parts.append(f"{key}: {val}")
    return "{{ " + ", ".join(parts) + " }}"


class Conv(HTMLParser):
    def __init__(self, stems: set[str]):
        super().__init__(convert_charrefs=True)
        self.stems = stems
        self.out: list[str] = []
        self.depth = 0  # profondeur à l'intérieur de <x-dc>
        self.inside = False
        self.skip = 0  # <helmet> et ses enfants
        self.stack: list[str] = []
        self.uses_link = False
        self.title = ""
        self._in_title = False
        self.links: set[str] = set()

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self._in_title = True
        if tag == "x-dc":
            self.inside = True
            return
        if not self.inside:
            return
        if tag == "helmet" or self.skip:
            self.skip += 1 if tag not in VOID else 0
            return
        a = dict(attrs)
        name = tag
        out_attrs = []
        if tag == "a":
            href = a.get("href", "")
            m = re.fullmatch(r"([A-Za-z0-9-]+)\.dc\.html", href)
            if m and m.group(1) in self.stems:
                name = "Link"
                self.uses_link = True
                self.links.add(m.group(1))
                a.pop("href")
                out_attrs.append(f'to="{route_of(m.group(1))}"')
            elif m:
                a["href"] = "#"
        for k, v in a.items():
            if k == "style":
                out_attrs.append("style=" + style_obj(v or ""))
                continue
            if k == "src" and v and blob_ref(v):
                out_attrs.append("src={IMG." + blob_ref(v) + "}")
                continue
            if tag == "input" and k == "value":
                out_attrs.append("defaultValue=" + js_str(v or ""))
                continue
            if tag == "input" and k == "checked":
                out_attrs.append("defaultChecked")
                continue
            key = ATTR.get(k, k)
            if key in NUMERIC and v is not None and re.fullmatch(r"-?\d+(\.\d+)?", v):
                out_attrs.append(f"{key}={{{v}}}")
                continue
            if v is None:
                out_attrs.append(key)
            else:
                out_attrs.append(f"{key}={js_str(v)}")
        attr_s = (" " + " ".join(out_attrs)) if out_attrs else ""
        if tag in VOID:
            self.out.append(f"<{name}{attr_s} />")
        else:
            self.out.append(f"<{name}{attr_s}>")
            self.stack.append(name)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.inside and not self.skip and tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "x-dc":
            self.inside = False
            return
        if not self.inside:
            return
        if self.skip:
            if tag != "helmet" or self.skip > 1:
                self.skip -= 1 if tag not in VOID else 0
                return
            self.skip = 0
            return
        if tag in VOID:
            return
        name = self.stack.pop()
        self.out.append(f"</{name}>")

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if not self.inside or self.skip:
            return
        if not data.strip():
            if self.out and self.stack:
                self.out.append('{" "}\n')
            return
        text = re.sub(r"\s+", " ", data)
        if re.search(r"[{}<>]", text):
            self.out.append("{" + js_str(text) + "}")
        else:
            self.out.append(text)


def convert(path: Path, stems: set[str]) -> tuple[str, Conv]:
    conv = Conv(stems)
    conv.feed(path.read_text(encoding="utf-8"))
    body = "".join(conv.out).strip()
    blk = r"(?:div|p|h1|h2|nav|ol|li|svg|g|path|rect|circle|ellipse)"
    body = re.sub(r"(</?" + blk + r"\b[^>]*>)\{\" \"\}\n", r"\1\n", body)
    body = re.sub(r"\{\" \"\}\n(?=</?" + blk + r"\b)", "\n", body)
    comp = comp_of(path.name.replace(".dc.html", ""))
    imports = ['import { IMG } from "../assets/images";']
    if conv.uses_link:
        imports.insert(0, 'import { Link } from "react-router";')
    uses_img = "IMG." in body
    if not uses_img:
        imports = [i for i in imports if "IMG" not in i]
    src = (
        "// Généré depuis design/maquettes/" + path.name + " par scripts/import_maquettes.py.\n"
        "// Écran statique (fausses données) : à rendre dynamique dans les prochaines étapes.\n"
        + "\n".join(imports)
        + ("\n\n" if imports else "\n")
        + f"export default function {comp}() {{\n  return (\n"
        + body
        + "\n  );\n}\n"
    )
    return src, conv


def main() -> None:
    files = sorted(SRC.glob("*.dc.html"))
    stems = {f.stem.replace(".dc", "") for f in files}
    files_by_stem = {f.name.replace(".dc.html", ""): f for f in files}
    stems = set(files_by_stem)
    OUT.mkdir(parents=True, exist_ok=True)
    entries = []
    for stem, f in sorted(files_by_stem.items()):
        src, conv = convert(f, stems)
        if stem not in EXCLUS:
            (OUT / f"{comp_of(stem)}.tsx").write_text(src, encoding="utf-8")
        entries.append((stem, conv.title.strip()))
    reg = [
        "// Généré par scripts/import_maquettes.py : liste des écrans et de leurs routes.",
        'import { lazy } from "react";',
        "",
        "export type ScreenEntry = { path: string; title: string; Component: React.LazyExoticComponent<React.ComponentType> };",
        "",
        "export const SCREENS: ScreenEntry[] = [",
    ]
    for stem, title in entries:
        comp = comp_of(stem)
        reg.append(
            f"  {{ path: {js_str(route_of(stem))}, title: {js_str(title or stem)}, Component: lazy(() => import(\"./{comp}\")) }},"
        )
    for path, title, comp in EXTRAS:
        reg.append(
            f"  {{ path: {js_str(path)}, title: {js_str(title)}, Component: lazy(() => import(\"./{comp}\")) }},"
        )
    reg.append("];")
    (OUT / "registry.ts").write_text("\n".join(reg) + "\n", encoding="utf-8")
    print(f"{len(entries) - len(EXCLUS)} écrans générés dans {OUT.relative_to(ROOT)} ({len(EXCLUS)} exclus, rendus dynamiques)")


if __name__ == "__main__":
    main()
