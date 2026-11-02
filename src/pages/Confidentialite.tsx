import { Link } from "react-router";
import { Info, PageLegale } from "../components/PageLegale";
import { HEBERGEUR, SOCIETE } from "../lib/societe";

export default function Confidentialite() {
  const mail = (
    <a href={`mailto:${SOCIETE.emailDonnees}`}>{SOCIETE.emailDonnees}</a>
  );
  return (
    <PageLegale titre="Politique de confidentialité">
      <p>
        Cette politique explique quelles données Daloura collecte, pourquoi,
        combien de temps elle les garde et comment tu peux exercer tes droits.
        Elle respecte le Règlement général sur la protection des données (RGPD,
        règlement (UE) 2016/679) et la loi n° 2017-20 du 20 avril 2018 portant
        Code du numérique en République du Bénin.
      </p>

      <h2>Qui est responsable de tes données ?</h2>
      <p>
        {SOCIETE.nom}, siège <Info v={SOCIETE.siege} />, {SOCIETE.pays}, RCCM{" "}
        <Info v={SOCIETE.rccm} />. Pour toute question sur tes données : {mail}.
      </p>

      <h2>Ce que nous collectons</h2>
      <ul>
        <li>
          <b>Ton compte</b> : ton adresse email et ton code secret. Le code
          n'est jamais stocké en clair : seule une empreinte chiffrée est
          gardée.
        </li>
        <li>
          <b>Ton selfie</b> et <b>tes photos d'inspiration</b> : uniquement pour
          créer tes aperçus.
        </li>
        <li>
          <b>Tes aperçus</b> (les images créées) et <b>ton carnet</b> (coiffures
          choisies, dates, vraies photos que tu ajoutes).
        </li>
        <li>
          <b>Le vote de ton cercle</b> : le prénom et le petit mot que tes
          proches choisissent d'écrire. Ils votent sans compte.
        </li>
        <li>
          <b>Tes perles et tes achats</b> : solde, mouvements, sachets achetés.
          Le paiement se fait chez notre prestataire de paiement : nous ne
          voyons jamais ton numéro de carte ni ton code Mobile Money.
        </li>
        <li>
          <b>Données techniques</b> : un identifiant aléatoire de ton téléphone
          (pour que les perles offertes ne servent qu'une fois par téléphone),
          ton adresse IP et ton navigateur au moment de la connexion (pour la
          sécurité).
        </li>
      </ul>

      <h2>Ton selfie : nos engagements</h2>
      <ul>
        <li>
          Il sert seulement à créer tes aperçus. Jamais pour de la publicité,
          jamais revendu.
        </li>
        <li>
          Il n'est pas utilisé pour t'identifier ni pour reconnaître ton visage.
        </li>
        <li>
          Il ne sert pas à entraîner des modèles d'intelligence artificielle.
        </li>
        <li>
          Il ne quitte ton téléphone qu'une fois ton compte créé et après ton
          accord explicite (case « J'accepte que mon selfie serve à créer mes
          aperçus »), dont nous gardons la date. Tu peux le retirer à tout
          moment en supprimant tes photos depuis ton profil.
        </li>
        <li>
          Personne ne voit tes aperçus sans toi : ton cercle les voit seulement
          si tu partages le lien de vote.
        </li>
      </ul>

      <h2>Pourquoi et sur quelle base</h2>
      <table>
        <thead>
          <tr>
            <th>Pourquoi</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Créer et gérer ton compte, tes perles, ton carnet, le vote</td>
            <td>Exécution du contrat (les conditions d'utilisation)</td>
          </tr>
          <tr>
            <td>Utiliser ton selfie et tes photos pour créer tes aperçus</td>
            <td>Ton consentement, que tu peux retirer à tout moment</td>
          </tr>
          <tr>
            <td>
              Sécurité, prévention de la fraude (blocage après 3 codes faux, une
              offre de bienvenue par téléphone)
            </td>
            <td>Notre intérêt légitime à protéger ton compte et le service</td>
          </tr>
          <tr>
            <td>Garder les justificatifs de paiement</td>
            <td>Obligation légale (comptabilité)</td>
          </tr>
          <tr>
            <td>
              T'envoyer les emails nécessaires (lien pour changer de code,
              reçus)
            </td>
            <td>Exécution du contrat</td>
          </tr>
        </tbody>
      </table>
      <p>Nous n'envoyons pas de publicité et ne revendons aucune donnée.</p>

      <h2>Combien de temps</h2>
      <ul>
        <li>
          Compte, carnet, perles : tant que ton compte existe. Sans connexion
          pendant 2 ans, il est supprimé automatiquement, avec tes photos.
        </li>
        <li>
          Selfie, photos d'inspiration, aperçus : jusqu'à ce que tu les
          supprimes, et au plus tard avec ton compte.
        </li>
        <li>
          Photos envoyées depuis un téléphone sans être rattachées à un compte :
          30 jours.
        </li>
        <li>Votes du cercle : 12 mois après la fermeture du vote.</li>
        <li>Lien pour changer de code : 30 minutes.</li>
        <li>
          Sessions de connexion (avec l'adresse IP et le navigateur) : 90 jours.
        </li>
        <li>
          Justificatifs de paiement : 10 ans, comme l'exige le droit comptable
          (OHADA). Si ton compte est supprimé, ils sont gardés sans lien avec
          toi (montant, date, référence du paiement).
        </li>
      </ul>

      <h2>Qui y a accès</h2>
      <p>
        Seule l'équipe de {SOCIETE.nom} habilitée, et nos prestataires
        techniques, uniquement pour faire fonctionner le service et selon nos
        instructions :
      </p>
      <ul>
        <li>
          {HEBERGEUR.nom} (États-Unis) : hébergement de l'application, de la
          base de données et des photos.
        </li>
        <li>
          Notre service d'envoi d'emails (MakiSend, hébergé chez Cloudflare) et
          le fournisseur de messagerie associé.
        </li>
        <li>
          Notre prestataire de paiement (Itaja), pour les achats de perles.
        </li>
        <li>
          Le fournisseur du modèle d'intelligence artificielle qui crée les
          aperçus : <Info v={null} />. Il n'a le droit ni de garder tes photos
          ni de s'en servir pour entraîner ses modèles.
        </li>
      </ul>

      <h2>Transferts hors du Bénin et de l'Union européenne</h2>
      <p>
        Certains prestataires sont situés hors du Bénin et de l'Union
        européenne, notamment aux États-Unis. Ces transferts sont encadrés par
        des garanties appropriées (clauses contractuelles types de la Commission
        européenne ou mécanisme équivalent) et réalisés dans les conditions
        prévues par le Code du numérique béninois.
      </p>

      <h2>Sécurité</h2>
      <p>
        Connexions chiffrées (HTTPS), photos stockées dans un espace privé, code
        secret jamais stocké en clair, blocage après 3 codes faux, accès limité
        aux personnes qui en ont besoin.
      </p>

      <h2>Cookies et stockage sur ton téléphone</h2>
      <p>
        Daloura n'utilise aucun cookie publicitaire ni de mesure d'audience.
        Seul un cookie indispensable garde ta session ouverte. Tes photos et ton
        choix de coiffures sont aussi gardés sur ton téléphone (stockage du
        navigateur) pour que l'application fonctionne même avec une connexion
        faible.
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu peux à tout moment accéder à tes données, les corriger, les
        supprimer, en demander une copie (portabilité), t'opposer à un
        traitement ou le limiter, et retirer ton consentement. Tes photos se
        suppriment directement depuis ton profil (« Supprimer mes photos et
        aperçus »). Pour le reste, écris-nous à {mail} : nous répondons sous un
        mois.
      </p>
      <p>
        Si tu estimes que tes droits ne sont pas respectés, tu peux saisir
        l'Autorité de Protection des Données à caractère Personnel du Bénin
        (APDP,{" "}
        <a href="https://apdp.bj" rel="noopener noreferrer">
          apdp.bj
        </a>
        ) ou, si tu vis dans l'Union européenne, l'autorité de protection des
        données de ton pays (en France, la CNIL).
      </p>

      <h2>Âge minimum</h2>
      <p>
        Daloura est réservée aux personnes de 16 ans et plus. Si tu as moins de
        16 ans, tu ne peux pas créer de compte.
      </p>

      <h2>Modifications</h2>
      <p>
        Si cette politique change de façon importante, nous te prévenons dans
        l'application avant que le changement s'applique. Voir aussi les{" "}
        <Link to="/conditions">conditions d'utilisation</Link> et les{" "}
        <Link to="/mentions-legales">mentions légales</Link>.
      </p>
    </PageLegale>
  );
}
