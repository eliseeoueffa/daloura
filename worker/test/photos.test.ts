import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "../index";
import { TAILLE_MAX } from "../photos";

const appareil = () => crypto.randomUUID().replace(/-/g, "");
const JPEG = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 2, 3,
]);
const PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
]);

function appel(chemin: string, init: RequestInit & { appareil?: string } = {}) {
  const headers = new Headers(init.headers);
  if (init.appareil) headers.set("x-daloura-appareil", init.appareil);
  const req = new Request(`https://daloura.test/api/photos${chemin}`, {
    ...init,
    headers,
  });
  return worker.fetch(
    req as Request<unknown, IncomingRequestCfProperties>,
    env as never,
  );
}

describe("photos dans R2", () => {
  it("refuse sans identifiant d'appareil valide", async () => {
    expect((await appel("", {})).status).toBe(401);
    expect((await appel("", { appareil: "pas-bon" })).status).toBe(401);
  });

  it("enregistre, liste, relit puis supprime un selfie", async () => {
    const a = appareil();
    const put = await appel("/selfie", {
      method: "PUT",
      body: JPEG,
      appareil: a,
      headers: { "x-photo-id": "photo-1" },
    });
    expect(put.status).toBe(201);
    expect(await (await appel("", { appareil: a })).json()).toEqual({
      selfie: { id: "photo-1" },
      inspirations: [],
    });
    const get = await appel("/selfie", { appareil: a });
    expect(get.headers.get("content-type")).toBe("image/jpeg");
    expect(new Uint8Array(await get.arrayBuffer())).toEqual(JPEG);
    expect(
      (await appel("/selfie", { method: "DELETE", appareil: a })).status,
    ).toBe(200);
    expect((await appel("/selfie", { appareil: a })).status).toBe(404);
  });

  it("range une inspiration dans la case de sa coiffure", async () => {
    const a = appareil();
    expect(
      (
        await appel("/inspirations/fulani", {
          method: "PUT",
          body: PNG,
          appareil: a,
          headers: { "x-photo-id": "f" },
        })
      ).status,
    ).toBe(201);
    expect(
      (
        await appel("/inspirations/locks", {
          method: "PUT",
          body: JPEG,
          appareil: a,
          headers: { "x-photo-id": "l" },
        })
      ).status,
    ).toBe(201);
    const liste = (await (await appel("", { appareil: a })).json()) as {
      inspirations: { style: string; id: string }[];
    };
    expect(
      liste.inspirations.sort((x, y) => x.style.localeCompare(y.style)),
    ).toEqual([
      { style: "fulani", id: "f" },
      { style: "locks", id: "l" },
    ]);
    expect(
      (await appel("/inspirations/fulani", { appareil: a })).headers.get(
        "content-type",
      ),
    ).toBe("image/png");
  });

  it("refuse une coiffure inconnue", async () => {
    expect(
      (
        await appel("/inspirations/mohawk", {
          method: "PUT",
          body: JPEG,
          appareil: appareil(),
        })
      ).status,
    ).toBe(404);
  });

  it("refuse ce qui n'est pas une image, même annoncé comme JPEG", async () => {
    const r = await appel("/selfie", {
      method: "PUT",
      body: new TextEncoder().encode("<script>alert(1)</script>"),
      appareil: appareil(),
      headers: { "content-type": "image/jpeg" },
    });
    expect(r.status).toBe(415);
  });

  it("refuse une photo trop lourde et une photo vide", async () => {
    const gros = new Uint8Array(TAILLE_MAX + 1);
    gros.set(JPEG);
    expect(
      (
        await appel("/selfie", {
          method: "PUT",
          body: gros,
          appareil: appareil(),
        })
      ).status,
    ).toBe(413);
    expect(
      (
        await appel("/selfie", {
          method: "PUT",
          body: new Uint8Array(),
          appareil: appareil(),
        })
      ).status,
    ).toBe(400);
  });

  it("un appareil ne voit pas les photos d'un autre", async () => {
    const a = appareil();
    const b = appareil();
    await appel("/selfie", { method: "PUT", body: JPEG, appareil: a });
    expect((await appel("/selfie", { appareil: b })).status).toBe(404);
    expect(await (await appel("", { appareil: b })).json()).toEqual({
      selfie: null,
      inspirations: [],
    });
  });

  it("l'identifiant de l'appareil n'apparaît jamais dans R2", async () => {
    const a = appareil();
    await appel("/selfie", { method: "PUT", body: JPEG, appareil: a });
    const tout = await env.MEDIA.list();
    expect(tout.objects.some((o) => o.key.includes(a))).toBe(false);
  });

  it("tout supprimer efface toutes ses photos", async () => {
    const a = appareil();
    await appel("/selfie", { method: "PUT", body: JPEG, appareil: a });
    await appel("/inspirations/knotless", {
      method: "PUT",
      body: JPEG,
      appareil: a,
    });
    expect(
      await (await appel("", { method: "DELETE", appareil: a })).json(),
    ).toEqual({ ok: true, supprimees: 2 });
    expect(await (await appel("", { appareil: a })).json()).toEqual({
      selfie: null,
      inspirations: [],
    });
  });
});
