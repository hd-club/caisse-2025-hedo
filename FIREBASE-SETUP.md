# 🔥 Configuration Firebase pour Caisse 2025

## 📋 Prérequis

Avant de commencer, vous devez :
1. Avoir un compte Google
2. Créer un projet Firebase (gratuit)

## 🚀 Étapes de Configuration

### 1. Créer un Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur **"Ajouter un projet"** (Add project)
3. Donnez un nom à votre projet (ex: "caisse-2025-hedo")
4. Acceptez les conditions et créez le projet

### 2. Activer Firestore Database

1. Dans le menu latéral, cliquez sur **"Firestore Database"**
2. Cliquez sur **"Créer une base de données"**
3. Choisissez le mode :
   - **Mode test** : Pour le développement (règles ouvertes pendant 30 jours)
   - **Mode production** : Avec règles de sécurité (recommandé après tests)
4. Sélectionnez une zone géographique proche de vous (ex: `europe-west`)
5. Cliquez sur **"Activer"**

### 3. Configurer les Règles Firestore

1. Dans Firestore, allez dans l'onglet **"Règles"** (Rules)
2. Remplacez les règles par :

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

3. Cliquez sur **"Publier"**

⚠️ **Note** : Ces règles permettent un accès complet. Pour une production réelle, ajoutez l'authentification Firebase.

### 4. Obtenir Votre Configuration Firebase

1. Dans la console Firebase, cliquez sur l'icône **⚙️ Paramètres**
2. Allez dans **"Paramètres du projet"** (Project settings)
3. Faites défiler jusqu'à **"Vos applications"**
4. Cliquez sur l'icône **</>** (Web) pour ajouter une application web
5. Donnez un nom à votre app (ex: "Caisse 2025")
6. **Ne cochez PAS** "Configurer Firebase Hosting" (on le fera après)
7. Cliquez sur **"Enregistrer l'application"**

### 5. Copier la Configuration

Vous verrez un code JavaScript comme celui-ci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxX",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 6. Mettre à Jour Votre Application

**Option A : Modifier directement dans index.html**

1. Ouvrez le fichier `index.html`
2. Cherchez la section `<!-- Firebase SDK -->`
3. Remplacez les valeurs `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc. par vos vraies valeurs

**Option B : Utiliser le fichier de configuration séparé**

1. Ouvrez le fichier `js/firebase-config.js`
2. Remplacez les valeurs par votre configuration Firebase
3. Les valeurs seront automatiquement utilisées

### 7. Tester l'Application en Local

1. Ouvrez `index.html` dans votre navigateur
2. Ouvrez la console (F12)
3. Vous devriez voir : "Application initialisée avec succès !"
4. Créez un événement de test
5. Vérifiez dans Firebase Console > Firestore Database que l'événement apparaît

## 📊 Structure de la Base de Données

Firestore créera automatiquement une collection `events` avec la structure suivante :

```
events/
  ├── eventId1/
  │   ├── nom: "Soirée Nouvel An"
  │   ├── date: "2025-01-15"
  │   ├── type_soiree: "all-inclusive"
  │   ├── presents_couple: 5
  │   ├── presents_homme: 3
  │   ├── presents_femme: 4
  │   ├── cash_entrees: 300
  │   ├── carte_entrees: 250
  │   ├── credit_entrees: 150
  │   ├── ... (autres champs)
  │   ├── created_at: Timestamp
  │   └── updated_at: Timestamp
  └── eventId2/
      └── ...
```

## 🚀 Déploiement sur Firebase Hosting

### Option 1 : Via l'Onglet Publish (Recommandé)

1. Cliquez sur l'onglet **"Publish"**
2. Sélectionnez **"Firebase"**
3. Suivez les instructions à l'écran

### Option 2 : Via Firebase CLI

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser Firebase dans votre projet
firebase init

# Sélectionner :
# - Hosting
# - Utiliser le projet existant
# - Public directory: . (point)
# - Single-page app: No
# - Automatic builds: No

# Déployer
firebase deploy
```

## 🔒 Sécurité (Production)

Pour une application en production, ajoutez l'authentification :

1. Activez **Firebase Authentication**
2. Modifiez les règles Firestore :

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

3. Ajoutez le code d'authentification dans votre application

## 📞 Support

- [Documentation Firebase](https://firebase.google.com/docs)
- [Console Firebase](https://console.firebase.google.com/)
- [Forum Firebase](https://firebase.google.com/support)

## ✅ Checklist de Vérification

- [ ] Projet Firebase créé
- [ ] Firestore Database activé
- [ ] Règles Firestore configurées
- [ ] Configuration copiée dans l'application
- [ ] Test en local réussi
- [ ] Données visibles dans Firebase Console
- [ ] Application déployée sur Firebase Hosting

Votre application est maintenant prête pour Firebase ! 🎉
