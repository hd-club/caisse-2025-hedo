# 🔥 Caisse 2025 - Version Firebase

## 🎯 À Propos

Cette version de **Caisse 2025 – Hedo** utilise **Firebase Firestore** comme base de données. L'application est entièrement hébergée sur Firebase et ne nécessite aucun serveur backend.

## ⚡ Démarrage Rapide

### 1. Configuration Firebase (5 minutes)

```bash
# Suivez ces 3 étapes :
1. Créez un projet sur https://console.firebase.google.com/
2. Activez Firestore Database
3. Copiez votre configuration dans index.html
```

📖 **Guide détaillé** : Voir `FIREBASE-SETUP.md`

### 2. Tester en Local

1. Ouvrez `index.html` dans votre navigateur
2. Créez un événement de test
3. Vérifiez dans Firebase Console que l'événement apparaît

### 3. Déployer en Production

**Option A - Via l'onglet Publish (Recommandé)**
- Cliquez sur "Publish" → Sélectionnez "Firebase" → Suivez les instructions

**Option B - Via Firebase CLI**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Votre app sera disponible sur : `https://votre-projet.web.app`

## 🔄 Migration depuis l'Ancienne Version

Si vous avez déjà des données avec l'API RESTful :

1. **Exportez vos données** (onglet Export)
2. **Configurez Firebase** (voir FIREBASE-SETUP.md)
3. **Importez vos données** (onglet Import)

📖 **Guide complet** : Voir `MIGRATION-GUIDE.md`

## 📁 Structure du Projet

```
├── index.html                  # Application principale
├── css/
│   └── styles.css             # Styles CSS
├── js/
│   ├── app.js                 # Logique métier
│   ├── firebase-config.js     # Configuration Firebase
│   └── firebase-db.js         # Opérations Firestore
├── FIREBASE-SETUP.md          # Guide de configuration
├── MIGRATION-GUIDE.md         # Guide de migration
└── README-FIREBASE.md         # Ce fichier
```

## 🔥 Architecture Firebase

### Firestore Database

**Collection : `events`**

Chaque document contient :
```javascript
{
  id: "auto-generated-id",
  nom: "Soirée Nouvel An",
  date: "2025-01-15",
  type_soiree: "all-inclusive",
  year: 2025,
  quarter: "Q1",
  presents_couple: 5,
  presents_homme: 3,
  presents_femme: 4,
  cash_entrees: 300,
  carte_entrees: 250,
  credit_entrees: 150,
  recharge_cash: 100,
  recharge_credit: 50,
  consommation_nourriture: 80,
  // ... autres champs
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Règles de Sécurité

**Mode Développement** (règles ouvertes) :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read, write: if true;
    }
  }
}
```

⚠️ Pour la production, ajoutez Firebase Authentication et des règles plus strictes.

## 🛠️ Fonctionnalités

### ✅ Toutes les fonctionnalités de l'application originale :

- 📊 Gestion complète des événements (CRUD)
- 🎭 Types de soirée (All Inclusive / Formule Bar)
- ⚙️ Paramètres de ventilation configurables
- 📈 Tableaux de bord et statistiques
- 📥 Import/Export Excel et CSV
- 👫👨👩🎫 Icônes pour participants
- 📱 Interface responsive
- 💾 Stockage persistant (Firestore + localStorage)

### ✨ Avantages Firebase :

- 🚀 **Performance** : CDN mondial, latence faible
- 📊 **Scalabilité** : Gère automatiquement la montée en charge
- 🔒 **Sécurité** : HTTPS par défaut, règles Firestore
- 💾 **Sauvegarde** : Données sécurisées et répliquées
- 🆓 **Gratuit** : Plan Spark généreux pour démarrer
- 📱 **Temps réel** : Possibilité d'ajouter des mises à jour live

## 📊 Opérations Firestore

### Charger les Événements
```javascript
import { loadEventsFromFirestore } from './firebase-db.js';
const events = await loadEventsFromFirestore();
```

### Créer un Événement
```javascript
import { createEvent } from './firebase-db.js';
const newEvent = await createEvent({
  nom: "Soirée Test",
  date: "2025-01-20",
  // ... autres données
});
```

### Modifier un Événement
```javascript
import { updateEvent } from './firebase-db.js';
await updateEvent(eventId, {
  nom: "Nouveau nom",
  // ... données modifiées
});
```

### Supprimer un Événement
```javascript
import { deleteEvent } from './firebase-db.js';
await deleteEvent(eventId);
```

## 🔍 Débogage

### Console Firebase
Consultez vos données : https://console.firebase.google.com/ > Firestore Database

### Console Navigateur (F12)
```javascript
// Vérifier la connexion Firebase
console.log(window.firebaseApp);  // App Firebase
console.log(window.firebaseDB);   // Base Firestore
```

### Logs de Débogage
Tous les logs sont préfixés :
- `✅` Succès
- `❌` Erreur
- `ℹ️` Information

## 📈 Quotas Firebase (Plan Gratuit Spark)

- **Stockage** : 1 GB
- **Lectures** : 50,000 / jour
- **Écritures** : 20,000 / jour
- **Suppressions** : 20,000 / jour

💡 **Estimation** : Suffisant pour ~1000 événements avec utilisation quotidienne moyenne

## 🔐 Sécurité en Production

### Étape 1 : Activer l'Authentification

```bash
# Dans Firebase Console
Authentication > Get Started > Email/Password
```

### Étape 2 : Modifier les Règles

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Étape 3 : Ajouter le Code d'Authentification

Ajoutez Firebase Auth dans votre application pour gérer les connexions.

## 📞 Support et Ressources

- 📖 [Documentation Firebase](https://firebase.google.com/docs)
- 🎓 [Firestore Guides](https://firebase.google.com/docs/firestore)
- 💬 [Forum Firebase](https://firebase.google.com/support)
- 🐛 [Rapport de Bugs](https://github.com/firebase/firebase-js-sdk/issues)

## ✅ Checklist de Production

Avant de mettre en production :

- [ ] Configuration Firebase complétée
- [ ] Données importées et vérifiées
- [ ] Tests de toutes les fonctionnalités
- [ ] Règles de sécurité configurées
- [ ] Firebase Hosting déployé
- [ ] URL de production testée
- [ ] Backup des données effectué
- [ ] Documentation partagée avec l'équipe

## 🎉 C'est Prêt !

Votre application **Caisse 2025** est maintenant prête pour Firebase !

Pour commencer : **Consultez `FIREBASE-SETUP.md`** 🚀

---

**Version** : 2.0 Firebase  
**Dernière mise à jour** : 30 Septembre 2025  
**Compatibilité** : Chrome, Firefox, Safari, Edge (dernières versions)
