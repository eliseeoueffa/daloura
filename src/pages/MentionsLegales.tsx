import { Link } from "react-router";
import { Info, PageLegale } from "../components/PageLegale";
import { HEBERGEUR, SOCIETE } from "../lib/societe";

export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales">
      <h2>Éditeur</h2>
      <p>
        Daloura est éditée par <b>{SOCIETE.nom}</b>, {SOCIETE.forme} au capital
        de <Info v={SOCIETE.capital} />, dont le siège est situé{" "}
        <Info v={SOCIETE.siege} />, {SOCIETE.pays}.
      </p>
      <ul>
        <li>
          RCCM : <Info v={SOCIETE.rccm} />
        </li>
        <li>
          IFU : <Info v={SOCIETE.ifu} />
        </li>
        <li>
          Email : <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>
        </li>
        <li>
          Téléphone : <Info v={SOCIETE.telephone} />
        </li>
      </ul>

      <h2>Directeur ou directrice de la publication</h2>
      <p>
        <Info v={SOCIETE.representant} />, représentant(e) légal(e) de{" "}
        {SOCIETE.nom}.
      </p>

      <h2>Hébergement</h2>
      <p>
        L'application et ses données sont hébergées par {HEBERGEUR.nom},{" "}
        {HEBERGEUR.adresse} (
        <a href={HEBERGEUR.site} rel="noopener noreferrer">
          {HEBERGEUR.site.replace("https://", "")}
        </a>
        ).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le nom Daloura, son logo, ses illustrations, ses textes et son code sont
        la propriété de {SOCIETE.nom}. Toute reproduction sans autorisation
        écrite est interdite. Les photos que tu ajoutes restent les tiennes :
        voir les <Link to="/conditions">conditions d'utilisation</Link>.
      </p>

      <h2>Données personnelles</h2>
      <p>
        La façon dont nous collectons et protégeons tes données est décrite dans
        la <Link to="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question :{" "}
        <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>.
      </p>
    </PageLegale>
  );
}
