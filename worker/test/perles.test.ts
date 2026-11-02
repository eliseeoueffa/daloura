import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import {
  COUT_GENERATION,
  MAX_COIFFURES,
  PERLES_BIENVENUE,
  RECAPS,
  SACHETS,
  coutEssai,
  formatPerles,
} from "../../src/lib/perles";
import {
  acheterRecap,
  creerPaiement,
  crediterAchat,
  lancerEssai,
  offrirBienvenue,
  ouvrirVote,
  rembourserGeneration,
  solde,
} from "../perles";

const db = env.DB;
let userId: string;

async function nouveauCompte(perles = 0): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();
  await db
    .prepare("INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)")
    .bind(id, `${id}@test.daloura`, now, now)
    .run();
  if (perles > 0) {
    await db.batch([
      db
        .prepare("INSERT INTO perle_ledger (id, user_id, delta, reason, created_at) VALUES (?, ?, ?, 'admin', ?)")
        .bind(crypto.randomUUID(), id, perles, now),
      db.prepare("UPDATE users SET perles = perles + ? WHERE id = ?").bind(perles, id),
    ]);
  }
  return id;
}

/** Le solde en cache doit toujours être égal à la somme du journal. */
async function soldeCoherent(id: string): Promise<number> {
  const r = await db
    .prepare("SELECT u.perles AS cache, COALESCE(SUM(l.delta), 0) AS journal FROM users u LEFT JOIN perle_ledger l ON l.user_id = u.id WHERE u.id = ? GROUP BY u.id")
    .bind(id)
    .first<{ cache: number; journal: number }>();
  expect(r!.cache).toBe(r!.journal);
  return r!.cache;
}

const coiffures = (n: number) =>
  ["knotless", "fulani", "bantu-knots", "locks"].slice(0, n).map((styleSlug) => ({ styleSlug }));

beforeEach(async () => {
  userId = await nouveauCompte();
});

describe("règles de perles.ts", () => {
  it("sachets en multiples du coût d'une génération", () => {
    for (const s of SACHETS) expect(s.perles % COUT_GENERATION).toBe(0);
  });
  it("accords : 0 perle, 1 perle, 2 perles", () => {
    expect([0, 1, 2, 21].map(formatPerles)).toEqual(["0 perle", "1 perle", "2 perles", "21 perles"]);
  });
});

describe("essais", () => {
  it.each([1, 2, 3])("essai de %i coiffure(s) coûte 3 perles par coiffure", async (n) => {
    const id = await nouveauCompte(21);
    const r = await lancerEssai(db, id, coiffures(n));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.cout).toBe(n * COUT_GENERATION);
    expect(r.cout).toBe([3, 6, 9][n - 1]);
    expect(r.generations).toHaveLength(n);
    expect(await soldeCoherent(id)).toBe(21 - coutEssai(n));
    const lignes = await db
      .prepare("SELECT COUNT(*) AS n FROM perle_ledger WHERE user_id = ? AND reason = 'generation' AND delta = ?")
      .bind(id, -COUT_GENERATION)
      .first<{ n: number }>();
    expect(lignes!.n).toBe(n);
  });

  it("refuse un essai de 4 coiffures (et de 0), sans débit", async () => {
    const id = await nouveauCompte(21);
    expect(await lancerEssai(db, id, coiffures(MAX_COIFFURES + 1))).toEqual({ ok: false, raison: "nombre_de_coiffures" });
    expect(await lancerEssai(db, id, [])).toEqual({ ok: false, raison: "nombre_de_coiffures" });
    expect(await soldeCoherent(id)).toBe(21);
  });

  it("solde insuffisant : refus, aucun débit, aucun essai créé", async () => {
    const id = await nouveauCompte(8);
    const r = await lancerEssai(db, id, coiffures(3));
    expect(r).toEqual({ ok: false, raison: "solde_insuffisant", manque: 1 });
    expect(await soldeCoherent(id)).toBe(8);
    const t = await db.prepare("SELECT COUNT(*) AS n FROM trials WHERE user_id = ?").bind(id).first<{ n: number }>();
    expect(t!.n).toBe(0);
  });

  it("deux essais simultanés ne font jamais passer le solde sous 0", async () => {
    const id = await nouveauCompte(9);
    const rs = await Promise.all([lancerEssai(db, id, coiffures(3)), lancerEssai(db, id, coiffures(3))]);
    expect(rs.filter((r) => r.ok)).toHaveLength(1);
    expect(await soldeCoherent(id)).toBe(0);
  });
});

describe("vote du cercle", () => {
  it("refusé avec 1 seule coiffure", async () => {
    const id = await nouveauCompte(3);
    const r = await lancerEssai(db, id, coiffures(1));
    if (!r.ok) throw new Error("essai refusé");
    expect(await ouvrirVote(db, r.trialId, Date.now() + 86_400_000)).toEqual({ ok: false, raison: "pas_assez_de_coiffures" });
  });

  it("possible et gratuit dès 2 coiffures", async () => {
    const id = await nouveauCompte(6);
    const r = await lancerEssai(db, id, coiffures(2));
    if (!r.ok) throw new Error("essai refusé");
    const v = await ouvrirVote(db, r.trialId, Date.now() + 86_400_000);
    expect(v.ok).toBe(true);
    expect(await soldeCoherent(id)).toBe(0);
  });
});

describe("génération ratée", () => {
  it("rend les 3 perles de cette génération seulement, une seule fois", async () => {
    const id = await nouveauCompte(9);
    const r = await lancerEssai(db, id, coiffures(3));
    if (!r.ok) throw new Error("essai refusé");
    expect(await soldeCoherent(id)).toBe(0);
    expect(await rembourserGeneration(db, r.generations[1], "timeout")).toEqual({ ok: true, perles: COUT_GENERATION });
    expect(await soldeCoherent(id)).toBe(COUT_GENERATION);
    expect(await rembourserGeneration(db, r.generations[1])).toEqual({ ok: false, raison: "deja_rembourse" });
    expect(await soldeCoherent(id)).toBe(COUT_GENERATION);
    const p = await db.prepare("SELECT status FROM previews WHERE id = ?").bind(r.generations[1]).first<{ status: string }>();
    expect(p!.status).toBe("failed");
    const refund = await db
      .prepare("SELECT ref_id FROM perle_ledger WHERE user_id = ? AND reason = 'refund'")
      .bind(id)
      .first<{ ref_id: string }>();
    expect(refund!.ref_id).toBe(r.generations[1]);
  });
});

describe("génération réussie", () => {
  it("n'est jamais remboursée", async () => {
    const id = await nouveauCompte(3);
    const r = await lancerEssai(db, id, coiffures(1));
    if (!r.ok) throw new Error("essai refusé");
    await db.prepare("UPDATE previews SET status = 'ready', photo_key = 'k' WHERE id = ?").bind(r.generations[0]).run();
    expect(await rembourserGeneration(db, r.generations[0])).toEqual({ ok: false, raison: "generation_reussie" });
    expect(await soldeCoherent(id)).toBe(0);
    const p = await db.prepare("SELECT status FROM previews WHERE id = ?").bind(r.generations[0]).first<{ status: string }>();
    expect(p!.status).toBe("ready");
  });
});

describe("achat d'un sachet", () => {
  it("double notification Itaja : un seul crédit", async () => {
    const era = SACHETS.find((s) => s.id === "hair-era")!;
    const p = await creerPaiement(db, userId, era.id);
    if (!p.ok) throw new Error("paiement refusé");
    expect(p.montantXof).toBe(era.prixXof);
    const [a, b] = await Promise.all([
      crediterAchat(db, p.paymentId, "itaja_123"),
      crediterAchat(db, p.paymentId, "itaja_123"),
    ]);
    expect([a.ok, b.ok].sort()).toEqual([false, true]);
    expect(await crediterAchat(db, p.paymentId, "itaja_123")).toEqual({ ok: false, raison: "deja_credite" });
    expect(await soldeCoherent(userId)).toBe(era.perles);
  });

  it("deux notifications simultanées avec des références Itaja différentes : un seul crédit", async () => {
    const moment = SACHETS[0];
    const p = await creerPaiement(db, userId, moment.id);
    if (!p.ok) throw new Error("paiement refusé");
    const rs = await Promise.all([crediterAchat(db, p.paymentId, "itaja_a"), crediterAchat(db, p.paymentId, "itaja_b")]);
    expect(rs.filter((r) => r.ok)).toHaveLength(1);
    expect(await soldeCoherent(userId)).toBe(moment.perles);
  });

  it("refuse un sachet inconnu", async () => {
    expect(await creerPaiement(db, userId, "sachet-gratuit")).toEqual({ ok: false, raison: "sachet_inconnu" });
  });
});

describe("cadeau de bienvenue", () => {
  it("une seule fois par compte", async () => {
    expect(await offrirBienvenue(db, userId, null)).toEqual({ ok: true, perles: PERLES_BIENVENUE });
    expect(await offrirBienvenue(db, userId, null)).toEqual({ ok: false, raison: "deja_offert_compte" });
    expect(await soldeCoherent(userId)).toBe(PERLES_BIENVENUE);
  });

  it("une seule fois par téléphone", async () => {
    const tel = crypto.randomUUID();
    expect((await offrirBienvenue(db, userId, tel)).ok).toBe(true);
    const autre = await nouveauCompte();
    expect(await offrirBienvenue(db, autre, tel)).toEqual({ ok: false, raison: "deja_offert_telephone" });
    expect(await soldeCoherent(autre)).toBe(0);
  });

  it("deux comptes en même temps sur un même téléphone : un seul cadeau", async () => {
    const tel = crypto.randomUUID();
    const autre = await nouveauCompte();
    const rs = await Promise.all([offrirBienvenue(db, userId, tel), offrirBienvenue(db, autre, tel)]);
    expect(rs.filter((r) => r.ok)).toHaveLength(1);
    expect((await soldeCoherent(userId)) + (await soldeCoherent(autre))).toBe(PERLES_BIENVENUE);
  });

  it("3 perles = 1 génération, donc pas de vote", async () => {
    await offrirBienvenue(db, userId, null);
    expect((await lancerEssai(db, userId, coiffures(2))).ok).toBe(false);
    const r = await lancerEssai(db, userId, coiffures(1));
    if (!r.ok) throw new Error("essai refusé");
    expect((await ouvrirVote(db, r.trialId, Date.now())).ok).toBe(false);
  });
});

describe("Hair Recap", () => {
  const periode = { debut: "2026-05-01", fin: "2026-11-01" };
  const recap6 = RECAPS.find((r) => r.mois === 6)!;

  it("solde suffisant : débite le prix du recap", async () => {
    const id = await nouveauCompte(57);
    const r = await acheterRecap(db, id, 6, periode);
    expect(r).toMatchObject({ ok: true, cout: recap6.perles, solde: 57 - recap6.perles });
    expect(await soldeCoherent(id)).toBe(57 - recap6.perles);
  });

  it("solde insuffisant : refus avec le manque, aucun débit", async () => {
    const id = await nouveauCompte(33);
    expect(await acheterRecap(db, id, 6, periode)).toEqual({ ok: false, raison: "solde_insuffisant", manque: recap6.perles - 33 });
    expect(await soldeCoherent(id)).toBe(33);
    const n = await db.prepare("SELECT COUNT(*) AS n FROM recaps WHERE user_id = ?").bind(id).first<{ n: number }>();
    expect(n!.n).toBe(0);
  });

  it("refuse une durée inconnue", async () => {
    const id = await nouveauCompte(80);
    expect(await acheterRecap(db, id, 9, periode)).toEqual({ ok: false, raison: "duree_inconnue" });
  });
});

it("solde() renvoie null pour un compte inconnu", async () => {
  expect(await solde(db, "inconnu")).toBeNull();
});
