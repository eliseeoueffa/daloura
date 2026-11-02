// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Attente.dc.html.
// Connectée, avec son accord et des coiffures choisies : envoie ses photos, lance l'essai sur le serveur
// (débit des perles), suit la création des aperçus puis ouvre Aperçu offert (1 coiffure), Aperçus
// (plusieurs) ou Échec-création. Sinon (relecture via /ecrans) : boutons de démo.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { IMG } from "../assets/images";
import { PhotoInspiration } from "../components/PhotoInspiration";
import {
  enregistrerConsentement,
  messageErreur,
  rafraichirCompte,
  useCompte,
} from "../lib/compte";
import { synchroniserMaintenant } from "../lib/envoi";
import { useLooks } from "../lib/essai";
import { lancerEssai, lireEssai } from "../lib/essaiServeur";
import { useConsentement, useEssai, useSelfieAffiche } from "../lib/photos";

export default function Attente() {
  const looks = useLooks();
  const look = looks[0];
  const { selfie, selfieStyle } = useSelfieAffiche();
  const navigate = useNavigate();
  const { compte, charge: compteCharge } = useCompte();
  const { essai: choix, charge: photosChargees } = useEssai();
  const { consentement } = useConsentement();
  const reel = !!compte && choix.length > 0 && consentement !== null;
  const [avancement, setAvancement] = useState(0.1);
  const [erreur, setErreur] = useState<{
    texte: string;
    lien?: { to: string; label: string };
  } | null>(null);
  const [tentative, setTentative] = useState(0);

  useEffect(() => {
    if (!compteCharge || !photosChargees || !reel) return;
    let fini = false;
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    setErreur(null);
    (async () => {
      try {
        await synchroniserMaintenant(); // ses photos doivent être sur le serveur
      } catch {
        return setErreur({
          texte:
            "Tes photos n'ont pas pu partir. Vérifie ta connexion, puis réessaie.",
        });
      }
      setAvancement(0.3);
      let r = await lancerEssai(choix);
      if (!r.ok && r.error === "consentement_requis") {
        await enregistrerConsentement();
        r = await lancerEssai(choix);
      }
      if (fini) return;
      if (!r.ok) {
        if (r.error === "solde_insuffisant")
          return navigate("/sans-essai", { replace: true });
        if (r.error === "non_connecte")
          return navigate("/connexion", { replace: true });
        if (r.error === "consentement_requis")
          return navigate("/consentement", { replace: true });
        if (r.error === "photos_manquantes")
          return setErreur({
            texte: "Il manque une photo d'inspiration ou ton selfie.",
            lien: { to: "/bibliotheque", label: "Vérifier mes photos" },
          });
        return setErreur({ texte: messageErreur(r.error) });
      }
      const suivre = async () => {
        const e = await lireEssai(r.id);
        if (fini) return;
        if (e) {
          const faits = e.apercus.filter(
            (a) => a.statut === "ready" || a.statut === "failed",
          ).length;
          setAvancement(0.3 + 0.7 * (faits / Math.max(e.apercus.length, 1)));
          if (e.statut === "ready" || e.statut === "failed") {
            void rafraichirCompte(); // solde à jour (perles débitées, ou rendues si échec)
            if (e.statut === "failed")
              return navigate("/echec-creation", { replace: true });
            return navigate(
              e.apercus.length > 1 ? "/apercus" : "/apercu-offert",
              { replace: true },
            );
          }
        }
        minuterie = setTimeout(suivre, 1500);
      };
      void suivre();
    })();
    return () => {
      fini = true;
      clearTimeout(minuterie);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compteCharge, photosChargees, reel, tentative]);
  return (
    <div className="scr wine">
      <div className="top">
        <span className="logo inv">
          <img src={IMG.logoInv} alt="" />
          daloura
        </span>
      </div>
      <div
        className="row"
        style={{ justifyContent: "center", gap: "14px", marginTop: "10px" }}
      >
        <div
          className="face"
          style={{
            width: "88px",
            height: "88px",
            boxShadow: "0 0 0 4px #FFFDF8",
          }}
        >
          <img src={selfie} alt="Ton selfie" style={selfieStyle} />
        </div>
        <span style={{ fontSize: "24px", color: "#E8A93A" }}>+</span>
        <div className="stk rays" style={{ width: "88px", height: "96px" }}>
          <PhotoInspiration slug={look.slug} alt={`Inspiration ${look.nom}`} />
        </div>
      </div>
      <div
        className="pola"
        style={{
          width: "210px",
          alignSelf: "center",
          transform: "rotate(-3deg)",
          marginTop: "8px",
        }}
      >
        <span className="tape"></span>
        <div
          className="ph"
          style={{ background: "linear-gradient(160deg, #EADFCF, #D9C4B5)" }}
        >
          <img
            src={look.img}
            alt=""
            style={{ filter: "blur(10px) saturate(.6)", opacity: ".65" }}
          />
        </div>
        <div className="cap">ça se révèle…</div>
      </div>
      <h1 className="h1" style={{ textAlign: "center" }}>
        On prépare ton aperçu…
      </h1>
      <div
        className="bar"
        role="progressbar"
        aria-label="Création de l'aperçu"
        aria-valuenow={Math.round(avancement * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ background: "rgba(245,239,230,.2)" }}
      >
        <i
          className="win"
          style={{
            width: `${Math.round(avancement * 100)}%`,
            transition: "width 600ms ease",
          }}
        ></i>
      </div>
      <p className="small" style={{ textAlign: "center" }}>
        Environ 30 secondes, parfois jusqu'à 2 minutes. Tu peux fermer l'app, on
        te prévient.
      </p>
      {erreur && (
        <div className="alert err" role="alert">
          <span className="ic">!</span>
          <div>{erreur.texte}</div>
        </div>
      )}
      <div className="grow"></div>
      {reel ? (
        erreur && (
          <>
            <button
              type="button"
              className="btn cream"
              onClick={() => setTentative((t) => t + 1)}
            >
              Réessayer
            </button>
            {erreur.lien && (
              <Link
                to={erreur.lien.to}
                className="lnk"
                style={{ color: "#F5EFE6" }}
              >
                {erreur.lien.label}
              </Link>
            )}
          </>
        )
      ) : (
        <>
          <Link
            to={looks.length > 1 ? "/apercus" : "/apercu-offert"}
            className="btn cream"
          >
            Voir l'aperçu (démo)
          </Link>
          <Link to="/echec-creation" className="lnk">
            Voir le cas d'échec (démo)
          </Link>
        </>
      )}
    </div>
  );
}
