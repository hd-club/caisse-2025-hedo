# Caisse 2025 – Firebase + GitHub (React + Firestore)

## Prérequis
- Projet Firebase (Authentication + Firestore) créé.
- Provider **GitHub** activé dans Firebase Authentication.
- **GitHub OAuth App**: 
  - Homepage URL: https://votre-domaine
  - Authorization callback URL: https://<votre-app>.web.app/__/auth/handler

## Installation
```bash
npm i
cp .env.example .env  # remplissez les variables
npm run dev
```

## Variables d'environnement
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

## Modèle Firestore
```
years/{YYYY}/quarters/{Q1|Q2|Q3|Q4}/events/{docId}
{
  nom: string,
  date: 'YYYY-MM-DD',
  participants: number,
  ca_ht: number,
  tva: number,
  ca_ttc: number,
  details?: { [k: string]: number },
  updatedAt: serverTimestamp
}
```

## Import
- CSV ou Excel: colonnes (casse flexible) `nom`, `date`, `participants`, `ca_ht`, `tva`, `ca_ttc`.
- Le trimestre est dérivé automatiquement de `date`.

## Export
- Excel par trimestre: `caisse_{year}_{Q}.xlsx`
- Résumé annuel: `caisse_{year}_resume.xlsx`

## Démarrage
- `npm run dev` puis ouvrez http://localhost:5173
- Connectez-vous avec GitHub, puis importez vos CSV/Excel.

## Déploiement
- Hébergement Firebase recommandé (`firebase deploy`), ou toute static hosting compatible Vite.
