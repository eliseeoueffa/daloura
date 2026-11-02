import { Link } from "react-router";
import { PageLegale } from "../components/PageLegale";
import {
  COUT_GENERATION,
  MIN_COIFFURES_VOTE,
  PERLES_BIENVENUE,
  SACHETS,
  formatPerles,
  formatXof,
} from "../lib/perles";
import { SOCIETE } from "../lib/societe";

export default function Conditions() {
  return (
    <PageLegale titre="Conditions d'utilisation">
      <p>
        Ces conditions règlent l'utilisation de Daloura, éditée par{" "}
        {SOCIETE.nom} (voir les{" "}
        <Link to="/mentions-legales">mentions légales</Link>). En créant un
        compte, tu les acceptes.
      </p>

      <h2>Le service</h2>
      <p>
        Daloura te montre à quoi pourrait ressembler une coiffure sur ton
        visage, à partir de ton selfie et de photos d'inspiration, te permet de
        demander l'avis de tes proches et de garder un carnet de tes coiffures.
      </p>
      <p>
        <b>Un aperçu, pas une promesse.</b> Les aperçus sont créés par
        intelligence artificielle : ce sont des simulations. Le rendu réel
        dépend de tes cheveux, de ta coiffeuse et de nombreux autres éléments.{" "}
        {SOCIETE.nom} ne garantit pas que la coiffure réalisée ressemblera à
        l'aperçu.
      </p>

      <h2>Ton compte</h2>
      <ul>
        <li>Daloura est réservée aux personnes de 16 ans et plus.</li>
        <li>
          Ton compte est personnel. Garde ton code secret pour toi : tu es
          responsable de ce qui est fait avec.
        </li>
        <li>
          Tu peux supprimer tes photos à tout moment depuis ton profil, et
          demander la suppression de ton compte.
        </li>
      </ul>

      <h2>Les perles</h2>
      <ul>
        <li>
          Les perles servent à créer des aperçus :{" "}
          {formatPerles(COUT_GENERATION)} par coiffure. Le vote de ton cercle
          est gratuit, à partir de {MIN_COIFFURES_VOTE} coiffures.
        </li>
        <li>
          À la création de ton compte, {formatPerles(PERLES_BIENVENUE)} sont
          offertes, une seule fois par personne et par téléphone.
        </li>
        <li>
          Les perles s'achètent en sachets (
          {SACHETS.map(
            (s) =>
              `${s.nom} : ${formatPerles(s.perles)} pour ${formatXof(s.prixXof)}`,
          ).join(" ; ")}
          ). Le prix affiché au moment de l'achat fait foi.
        </li>
        <li>
          Les perles n'expirent pas. Elles ne sont ni remboursables en argent,
          ni échangeables, ni transférables.
        </li>
        <li>
          Si la création d'un aperçu échoue, les perles de cet aperçu te sont
          rendues automatiquement.
        </li>
        <li>
          Les perles sont créditées dès la confirmation du paiement : en
          achetant, tu demandes que le service commence tout de suite. Le droit
          de rétractation ne s'applique donc plus aux perles déjà utilisées. Tu
          peux demander le remboursement d'un sachet entièrement inutilisé dans
          les 14 jours suivant l'achat en écrivant à{" "}
          <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a>.
        </li>
      </ul>

      <h2>Tes photos</h2>
      <ul>
        <li>
          Tes photos restent les tiennes. Tu nous autorises seulement à les
          utiliser pour faire fonctionner le service (créer tes aperçus, les
          afficher, les montrer à ton cercle si tu partages le lien), et pour
          rien d'autre.
        </li>
        <li>
          Tu ne dois envoyer que ton propre visage en selfie, et des photos
          d'inspiration que tu as le droit d'utiliser. N'envoie pas de photo
          d'une autre personne sans son accord.
        </li>
        <li>
          Sont interdits les contenus illégaux, violents, haineux, à caractère
          sexuel ou qui portent atteinte aux droits d'autrui. Nous pouvons
          supprimer ces contenus et suspendre le compte concerné.
        </li>
      </ul>

      <h2>Le vote du cercle</h2>
      <p>
        Quand tu partages le lien de vote, les personnes qui l'ont peuvent voir
        tes aperçus et voter sans compte. Partage ce lien seulement avec des
        personnes de confiance.
      </p>

      <h2>Utilisation correcte</h2>
      <p>
        Tu t'engages à ne pas détourner le service : pas de tentative d'accès
        aux données d'autres personnes, pas d'automatisation abusive, pas de
        création de comptes multiples pour obtenir plusieurs fois les perles
        offertes.
      </p>

      <h2>Disponibilité et responsabilité</h2>
      <p>
        Nous faisons de notre mieux pour que Daloura fonctionne en continu, sans
        pouvoir le garantir (maintenance, panne d'un prestataire, connexion
        internet). Notre responsabilité est limitée aux dommages directs causés
        par une faute de notre part, dans les limites permises par la loi.
      </p>

      <h2>Suspension et fin</h2>
      <p>
        Tu peux arrêter d'utiliser Daloura quand tu veux. Nous pouvons suspendre
        un compte qui ne respecte pas ces conditions, après t'avoir prévenue
        sauf urgence.
      </p>

      <h2>Modifications</h2>
      <p>
        Nous pouvons faire évoluer ces conditions. Les changements importants te
        sont annoncés dans l'application avant de s'appliquer.
      </p>

      <h2>Droit applicable et litiges</h2>
      <p>
        Ces conditions sont soumises au droit béninois. En cas de désaccord,
        écris-nous d'abord à{" "}
        <a href={`mailto:${SOCIETE.email}`}>{SOCIETE.email}</a> : nous cherchons
        une solution amiable. À défaut, les tribunaux compétents du Bénin
        pourront être saisis. Si tu vis dans un autre pays, tu gardes les
        protections que la loi de ton pays accorde aux consommateurs.
      </p>
      <p>
        Voir aussi la{" "}
        <Link to="/confidentialite">politique de confidentialité</Link>.
      </p>
    </PageLegale>
  );
}
