// Écran fait à la main (retiré de scripts/import_maquettes.py) : maquette design/maquettes/Selfie.dc.html.
// Caméra : sur téléphone, l'appareil photo du système (input capture) ; sur ordinateur, la webcam
// dans la page (getUserMedia). La galerie ouvre la photothèque ou l'explorateur de fichiers.
// Le selfie est gardé dans le navigateur (src/lib/photos.ts) jusqu'à l'envoi vers R2 (étape 3).
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { IMG } from "../assets/images";
import { ChoixFichier } from "../components/ChoixFichier";
import { preparer, useSelfie, useUrl } from "../lib/photos";

type Mode = "guide" | "camera" | "apercu";

/** Téléphone ou tablette : l'appareil photo du système est plus fiable que la caméra dans la page. */
const ecranTactile = () =>
  typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;

function messageErreur(e: unknown): string {
  const nom = e instanceof DOMException ? e.name : "";
  if (nom === "NotAllowedError" || nom === "SecurityError")
    return "L'accès à la caméra est bloqué. Autorise-le dans ton navigateur (le cadenas à gauche de l'adresse), puis réessaie. Tu peux aussi choisir une photo dans ta galerie.";
  if (nom === "NotFoundError" || nom === "OverconstrainedError")
    return "Aucune caméra trouvée sur cet appareil. Choisis une photo dans ta galerie.";
  if (nom === "NotReadableError")
    return "La caméra est déjà utilisée par une autre application. Ferme-la, puis réessaie.";
  return "La caméra n'a pas pu s'ouvrir. Réessaie, ou choisis une photo dans ta galerie.";
}

export default function Selfie() {
  const navigate = useNavigate();
  const { selfie, charge, enregistrer } = useSelfie();
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [mode, setMode] = useState<Mode>("guide");
  const [erreur, setErreur] = useState<string | null>(null);
  const [occupe, setOccupe] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const flux = useRef<MediaStream | null>(null);
  const url = useUrl(photo);

  // Selfie déjà pris (retour depuis le profil) : on le montre une fois, à l'arrivée sur l'écran.
  const dejaMontre = useRef(false);
  useEffect(() => {
    if (!charge || dejaMontre.current) return;
    dejaMontre.current = true;
    if (selfie) {
      setPhoto(selfie);
      setMode("apercu");
    }
  }, [charge, selfie]);

  const couper = () => {
    flux.current?.getTracks().forEach((t) => t.stop());
    flux.current = null;
  };
  useEffect(() => couper, []);

  useEffect(() => {
    if (mode === "camera" && video.current && flux.current) {
      video.current.srcObject = flux.current;
      void video.current.play().catch(() => {});
    }
  }, [mode]);

  async function ouvrirCamera() {
    setErreur(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setErreur(
        "Ce navigateur ne donne pas accès à la caméra. Choisis une photo dans ta galerie.",
      );
      return;
    }
    try {
      flux.current = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      setMode("camera");
    } catch (e) {
      setErreur(messageErreur(e));
    }
  }

  async function declencher() {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(canvas.width, 0); // même sens que l'aperçu en miroir
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    couper();
    setPhoto(await preparer(canvas));
    setMode("apercu");
  }

  async function depuisFichier(f: File[]) {
    setErreur(null);
    try {
      setPhoto(await preparer(f[0]));
      setMode("apercu");
    } catch {
      setErreur("Cette photo n'a pas pu être lue. Essaie avec une autre.");
    }
  }

  async function garder() {
    if (!photo) return;
    setOccupe(true);
    await enregistrer(photo);
    navigate("/choix-essai");
  }

  const reprendre = () => {
    setPhoto(null);
    setMode("guide");
  };

  return (
    <div className="scr">
      <div className="top">
        <Link to="/bibliotheque" className="back">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 5l-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          Retour
        </Link>
      </div>
      <h1 className="h1">Ton selfie</h1>
      <div className="viewfinder" style={{ height: "380px" }}>
        {mode === "guide" && (
          <img
            src={IMG.selfie}
            alt=""
            style={{
              position: "absolute",
              bottom: "0",
              width: "300px",
              opacity: ".55",
            }}
          />
        )}
        {mode === "camera" && (
          <video
            ref={video}
            autoPlay
            playsInline
            muted
            aria-label="Aperçu de la caméra"
          />
        )}
        {mode === "apercu" && url && (
          <img className="photo" src={url} alt="Ton selfie" />
        )}
        {mode !== "apercu" && (
          <>
            <div
              style={{
                width: "196px",
                height: "256px",
                border: "3px dashed #E8A93A",
                borderRadius: "50%",
                position: "relative",
                zIndex: "2",
                marginTop: "-40px",
              }}
            ></div>
            <span
              className="hand"
              style={{
                position: "absolute",
                top: "14px",
                right: "16px",
                color: "#E8A93A",
                zIndex: "2",
              }}
            >
              visage dans l'ovale
            </span>
          </>
        )}
      </div>
      {erreur && (
        <div className="alert err" role="alert">
          <span className="ic">!</span>
          <div>{erreur}</div>
        </div>
      )}
      {mode !== "apercu" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="row" style={{ gap: "10px" }}>
            <span className="pill sign">1</span>
            <p className="p">Face à une fenêtre, à la lumière du jour</p>
          </div>
          <div className="row" style={{ gap: "10px" }}>
            <span className="pill sign">2</span>
            <p className="p">Cheveux dégagés du visage</p>
          </div>
          <div className="row" style={{ gap: "10px" }}>
            <span className="pill sign">3</span>
            <p className="p">Sans lunettes ni filtre</p>
          </div>
        </div>
      )}
      {mode === "apercu" && (
        <p className="p">
          Ton visage est bien éclairé et dégagé ? Alors c'est parfait.
        </p>
      )}
      <div className="grow"></div>
      {mode === "guide" &&
        (ecranTactile() ? (
          <ChoixFichier
            className="btn"
            camera="user"
            onFichiers={depuisFichier}
          >
            Prendre la photo
          </ChoixFichier>
        ) : (
          <button type="button" className="btn" onClick={ouvrirCamera}>
            Prendre la photo
          </button>
        ))}
      {mode === "camera" && (
        <button type="button" className="btn" onClick={declencher}>
          Déclencher
        </button>
      )}
      {mode === "apercu" && (
        <button
          type="button"
          className="btn"
          onClick={garder}
          disabled={occupe}
        >
          Garder cette photo
        </button>
      )}
      {mode === "apercu" ? (
        <button type="button" className="lnk" onClick={reprendre}>
          Reprendre la photo
        </button>
      ) : (
        <ChoixFichier
          className="lnk"
          onFichiers={(f) => {
            couper();
            void depuisFichier(f);
          }}
        >
          Choisir dans ma galerie
        </ChoixFichier>
      )}
    </div>
  );
}
