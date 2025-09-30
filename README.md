# 🎯 Caisse 2025 – Hedo (Version Web Statique)

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://staff-time-app.github.io/caisse-2025-hedo/)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue)](https://github.com/staff-time-app/caisse-2025-hedo)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Vue d'ensemble

Application web de gestion comptable pour événements, spécialement conçue pour le suivi des recettes, participants et données fiscales. Cette version statique offre toutes les fonctionnalités essentielles de l'application React/Firebase originale.

## 🌐 Démo en Ligne

**URL de Production** : https://staff-time-app.github.io/caisse-2025-hedo/

**Firebase Hosting** : https://staff-time-app.web.app/

---

## ✅ **Fonctionnalités actuellement implémentées**

### 🎪 **Gestion des événements**
- ✅ **Vue simple** : Événement, Couples, Hommes, Femmes, Cartes, Nourriture, Entrées (Cash+Carte+BC), Recharges (Cash+BC), Total CA (sans nourriture)
- ✅ **Vue détaillée moderne** : Design dashboard avec sections Participants, Recettes détaillées, CA (sans nourriture), et Ventilation tarifs
- ✅ **Tri avancé** : Date, Nom, CA, Participants (croissant/décroissant)
- ✅ **Filtrage** : Année, Trimestre avec mise à jour en temps réel
- ✅ **Calculs automatiques** : Entrées (Cash+Carte+BC), Recharges (Cash+BC), CA excluant la nourriture
- ✅ **Ventilation tarifs complète** : Table avec 8 colonnes (Type, Entrée, Conso, Nbr Conso, Nbr, Entrée Brute, Total Conso, Entrée Nette)
- ✅ **Calculs de consommation** : 2 consommations pour couples/femmes, 4 pour hommes à 9€ chacune
- ✅ **Entrées nettes** : Soustraction automatique des coûts de consommation des entrées brutes
- ✅ **Détection d'écarts** entre tarifs théoriques et réels avec comparaison brute/nette
- ✅ **Design responsive** avec cartes métriques et gradients colorés
- ✅ **Affichage mobile optimisé** : Table de ventilation adaptative avec labels intégrés
- ✅ **Ajout manuel d'événements** via formulaire modal complet (4 onglets)
- ✅ **Type de soirée sélectionnable** : All Inclusive ou Formule Bar
- ✅ **Modification d'événements existants**
- ✅ **Suppression avec confirmation**
- ✅ **Calcul automatique des trimestres** (Q1-Q4) selon la date
- ✅ **Calcul automatique TVA** (20% par défaut)
- ✅ **Calcul automatique CA TTC** (CA HT + TVA)
- ✅ **Paramètres de ventilation configurables** : Tarifs et consommations personnalisables

### 📊 **Tableau de bord**
- ✅ **Statistiques annuelles** : Événements, Participants, Cartes Membre, Total Entrées, CA TTC, Moyenne Participants
- ✅ **Statistiques par trimestre** : Événements, Couples, Hommes, Femmes, CA TTC
- ✅ **Sélecteur d'année** pour navigation temporelle
- ✅ **Cartes visuelles** avec données en temps réel

### 📥 **Import de données**
- ✅ **Import CSV/Excel simple** avec Papa Parse et SheetJS
- ✅ **Import multiple** - traitement simultané de plusieurs fichiers
- ✅ **Drag & Drop** pour glisser-déposer les fichiers
- ✅ **Prévisualisation avant import** avec validation
- ✅ **Détection automatique des colonnes** (insensible à la casse)
- ✅ **Gestion des erreurs** et messages utilisateur
- ✅ **Consolidation automatique** des données multi-fichiers

### 📤 **Export de données**
- ✅ **Export personnalisé pour comptable** avec sélection de colonnes
- ✅ **Filtres de période** : Année, Trimestre, Période personnalisée
- ✅ **18 colonnes disponibles** : Participants, Recettes détaillées, CA, TVA
- ✅ **Exports rapides** : Année courante, Toutes données, Résumé comptable
- ✅ **Prévisualisation** avant export
- ✅ **Rapport de synthèse** par trimestre automatique
- ✅ **Format Excel** (.xlsx) avec noms de fichiers intelligents

### 🎨 **Interface utilisateur**
- ✅ **Design moderne** sobre (blanc/gris/bleu #0066cc)
- ✅ **Navigation par onglets** responsive
- ✅ **Formulaires modaux** pour ajout/modification
- ✅ **Messages de confirmation** et erreurs
- ✅ **Animations CSS** discrètes

### 📱 **Responsive Design**
- ✅ **Mobile-friendly** avec breakpoints
- ✅ **Tableaux adaptifs** sur petits écrans
- ✅ **Navigation verticale** sur mobile
- ✅ **Optimisation tactile**

---

## 🛠️ **Architecture technique**

### 📁 **Structure des fichiers**
```
/
├── index.html              # Interface principale
├── css/
│   └── styles.css         # Styles complets
├── js/
│   └── app.js            # Logique application
├── original/             # Fichiers source originaux
│   ├── README.md
│   ├── package.json
│   ├── styles.css
│   └── firebase.ts
└── README.md            # Documentation
```

### 🗄️ **Modèle de données**

**Table `events` :**
```sql
{
  id: string (UUID),           # Identifiant unique
  nom: string,                 # Nom de l'événement
  date: string (YYYY-MM-DD),   # Date événement
  year: number,                # Année (calculée automatiquement)
  quarter: string (Q1-Q4),     # Trimestre (calculé automatiquement)
  participants: number,        # Nombre de participants
  ca_ht: number,              # Chiffre affaires HT
  tva: number,                # Montant TVA
  ca_ttc: number,             # Chiffre affaires TTC
  details: string (JSON),     # Détails supplémentaires
  created_at: timestamp,      # Date création
  updated_at: timestamp       # Dernière modification
}
```

### 🔗 **Base de Données**

L'application supporte **deux modes** de base de données :

#### Mode 1 : API RESTful Table (Actuel)
- `GET tables/events` - Liste des événements
- `POST tables/events` - Création d'événement
- `PUT tables/events/{id}` - Modification d'événement
- `DELETE tables/events/{id}` - Suppression d'événement

#### Mode 2 : Firebase Firestore (Nouveau) 🔥
- Collection `events` dans Firestore
- Fonctions complètes CRUD via `firebase-db.js`
- Hébergement Firebase Hosting inclus
- **📖 Voir `README-FIREBASE.md` pour la migration**

### 📚 **Librairies CDN intégrées**
- **Font Awesome 6.4.0** - Icônes
- **SheetJS (XLSX) 0.18.5** - Import/Export Excel
- **FileSaver.js 2.0.5** - Téléchargement fichiers
- **Papa Parse 5.4.1** - Parsing CSV

### ⚙️ **Configuration de la Ventilation**

Pour modifier les paramètres de ventilation :
1. **Accès** : Cliquer sur l'icône ⚙️ dans la section "Ventilation" (vue détaillée)
2. **Paramètres disponibles** :
   - Tarifs d'entrée : Couple, Femme, Homme
   - Prix unitaire des consommations
   - Nombre de consommations par type de participant
3. **Aperçu temps réel** : Les calculs se mettent à jour automatiquement
4. **Sauvegarde** : Les paramètres sont conservés entre les sessions
5. **Réinitialisation** : Bouton pour revenir aux valeurs par défaut

---

## 🆕 **Dernières Améliorations (30 Septembre 2025)**

### 🎭 **Catégorisation des Soirées**
- ✅ **Type de soirée** : Classification "All Inclusive" ou "Formule Bar"
- ✅ **Affichage visuel** : Badges colorés avec icônes distinctifs
  - 🍹 **All Inclusive** : Dégradé vert/turquoise
  - 🍺 **Formule Bar** : Dégradé rose/rouge
- ✅ **Filtrage** : Type de soirée disponible dans les exports personnalisés
- ✅ **Import/Export** : Support complet du type de soirée dans les fichiers

### ⚙️ **Paramètres de Ventilation Configurables** 
- ✅ **Tarifs modifiables** : Possibilité de personnaliser tous les tarifs d'entrée
- ✅ **Consommations ajustables** : Prix unitaire et nombre de consommations par type
- ✅ **Interface intuitive** : Modal avec aperçu temps réel des calculs
- ✅ **Sauvegarde persistante** : Paramètres stockés en localStorage
- ✅ **Bouton d'accès rapide** : Icône ⚙️ dans chaque section ventilation
- ✅ **Réinitialisation** : Retour aux valeurs par défaut en un clic

### 🎨 **Interface Compacte et Optimisée**
- ✅ **Vue simple avec icônes** : En-têtes visuels (👫👨👩🎫🍽️) au lieu de texte
- ✅ **Vue détaillée condensée** : Design compact qui préserve toutes les informations essentielles
- ✅ **Affichage en ligne** : Participants, recettes et CA regroupés de façon concise
- ✅ **Terminologie mise à jour** : "BC" remplacé par "Crédit" dans toute l'application
- ✅ **Table de ventilation simplifiée** : 5 colonnes essentielles uniquement

### 💰 **Calculs de Consommation Dynamiques**
- ✅ **Paramètres par défaut** :
  - 👫 **Couples** : 50€ - (9€ × 2) = **32€**
  - 👩 **Femmes** : 25€ - (9€ × 2) = **7€**  
  - 👨 **Hommes** : 100€ - (9€ × 4) = **64€**
- ✅ **Calculs adaptatifs** : Résultats mis à jour automatiquement selon les paramètres
- ✅ **Aperçu temps réel** : Visualisation immédiate des changements

---

## 📊 **Données d'exemple intégrées**

### ✅ **8 événements de test**

**Q1 2025 (3 événements) :**
- 🎊 **Soirée Nouvel An** (15/01) - 45 participants, 2,200€ TTC
- 🌙 **Nuit Transparente** (22/01) - 28 participants, 1,250€ TTC
- 🎭 **Soirée Masquée** (29/01) - 42 participants, 1,780€ TTC

**Q2 2025 (3 événements) :**
- 🌸 **Soirée Printemps** (05/04) - 62 participants, 2,880€ TTC
- 🏖️ **Beach Party Night** (12/04) - 48 participants, 1,950€ TTC
- 🌟 **Nuit Blanche** (19/04) - 58 participants, 2,620€ TTC

**Q3 2025 (2 événements) :**
- 🎮 **CTRL-X - DELETE YOUR LIMITS** (27/09) - 56 participants, 4,890€ TTC
- 🎯 **TOUCH & PLAY – by Désir & Moi** (13/09) - 31 participants, 3,480€ TTC

### 📊 **Totaux calculés**
- **Total événements** : 8
- **Total participants** : 365
- **Chiffre d'affaires TTC** : 20,050€
- **TVA collectée** : 3,341.67€
- **CA HT** : 16,708.33€

---

## 🚀 **Guide d'utilisation**

### ➕ **Ajouter un événement**
1. Cliquez sur l'onglet "**Événements**"
2. Cliquez "**➕ Ajouter un événement**"
3. Remplissez le formulaire :
   - Nom, Date, Participants
   - CA HT (TVA calculée automatiquement à 20%)
   - CA TTC mis à jour en temps réel
4. Cliquez "**Enregistrer**"

### 📥 **Importer des données**
1. Onglet "**Importer**"
2. **Glissez-déposez** un fichier CSV/Excel ou cliquez pour sélectionner
3. **Prévisualisez** les données détectées
4. Cliquez "**Confirmer l'import**"

**Colonnes CSV/Excel supportées :**
- `nom` / `name` / `événement` / `event`
- `date` (format YYYY-MM-DD ou DD/MM/YYYY)
- `participants` / `participant`
- `ca_ht` / `ca ht` / `ht`
- `tva` / `tax`
- `ca_ttc` / `ca ttc` / `ttc`

### 📤 **Exporter des données**
1. Onglet "**Exporter**"
2. Sélectionnez l'année
3. Choisissez :
   - **Export par trimestre** (Q1, Q2, Q3, Q4)
   - **Résumé annuel complet**
   - **Tous les événements**

### 📊 **Consulter les statistiques**
1. Onglet "**Tableau de bord**" (par défaut)
2. Sélectionnez l'année dans le menu déroulant
3. Consultez :
   - Statistiques globales annuelles
   - Répartition par trimestre
   - Indicateurs clés (CA, participants, moyenne)

---

## 🔄 **Fonctionnalités avancées**

### 🎯 **Calculs automatiques**
- **Trimestre** déduit automatiquement de la date
- **TVA à 20%** calculée sur CA HT
- **CA TTC** = CA HT + TVA
- **Totaux** recalculés en temps réel

### 🔍 **Filtrage et recherche**
- **Filtre par année** dans la liste des événements
- **Filtre par trimestre** (Q1, Q2, Q3, Q4)
- **Tri automatique** par date décroissante

### ✏️ **Gestion complète CRUD**
- **Create** : Ajout via formulaire ou import
- **Read** : Affichage avec filtres
- **Update** : Modification via modal
- **Delete** : Suppression avec confirmation

### 📱 **Responsive Mobile**
- **Navigation adaptée** sur smartphones
- **Tableaux optimisés** pour petits écrans
- **Formulaires tactiles** ergonomiques

---

## 📈 **Prochaines améliorations suggérées**

### 🔄 **Fonctionnalités métier**
- [ ] **Gestion des détails** : Recharges cash/crédit, snacks, cartes membres
- [ ] **Catégories d'événements** : Soirées, stages, événements spéciaux
- [ ] **Gestion multi-utilisateurs** avec authentification
- [ ] **Historique des modifications** avec audit trail

### 📊 **Analyses et rapports**
- [ ] **Graphiques de tendances** avec Chart.js
- [ ] **Comparaisons annuelles** et évolution
- [ ] **Ratios financiers** (CA/participant, croissance, etc.)
- [ ] **Export comptable** format FEC ou autres standards

### 🛠️ **Améliorations techniques**
- [ ] **PWA** (Progressive Web App) pour installation
- [ ] **Mode hors ligne** avec synchronisation
- [ ] **API backend** dédiée pour production
- [ ] **Tests automatisés** unitaires et e2e

### 🎨 **Interface utilisateur**
- [ ] **Thèmes** clair/sombre
- [ ] **Personnalisation** couleurs d'entreprise
- [ ] **Raccourcis clavier** pour power users
- [ ] **Notifications push** pour rappels

---

## ⚙️ **Configuration et déploiement**

### 📖 **Guides de Déploiement**
- 🚀 **[Guide Rapide GitHub](GUIDE-RAPIDE-GITHUB.md)** - Upload sur GitHub en 5 minutes
- 📚 **[Guide Complet GitHub](README-GITHUB.md)** - Documentation détaillée GitHub
- 🔥 **[Configuration Firebase](FIREBASE-SETUP.md)** - Setup Firebase complet
- 🔄 **[Guide de Migration](MIGRATION-GUIDE.md)** - Migration vers Firebase

### 🌐 **URLs fonctionnelles**
- **Interface principale** : `index.html`
- **GitHub Pages** : `https://staff-time-app.github.io/caisse-2025-hedo/`
- **Firebase Hosting** : `https://staff-time-app.web.app/`
- **API des données** : `tables/events` (ou Firebase Firestore)

### 📋 **Prérequis**
- Navigateur moderne avec support JavaScript ES6+
- Connexion internet pour les CDN (Font Awesome, XLSX, etc.)
- Serveur web pour les appels API (intégré dans la plateforme)

### 🚀 **Déploiement**
Cette application statique est prête pour le déploiement sur :
- **GitHub Pages**
- **Netlify** 
- **Vercel**
- **Firebase Hosting**
- Tout hébergeur de sites statiques

---

## 💡 **Support et maintenance**

### 🐛 **Signalement de bugs**
Pour signaler un problème :
1. Ouvrez la console développeur (F12)
2. Reproduisez le bug
3. Notez les messages d'erreur
4. Décrivez les étapes de reproduction

### 📞 **Assistance technique**
- **Documentation complète** dans ce README
- **Code commenté** pour faciliter la maintenance
- **API RESTful** standard pour intégrations futures

---

## 📊 **Résumé du projet**

**🎯 Objectif** : Application de gestion comptable pour événements  
**🛠️ Technologies** : HTML5, CSS3, JavaScript ES6+, API RESTful  
**📱 Compatibilité** : Desktop, tablette, mobile  
**🎨 Design** : Interface sobre et professionnelle  
**📊 Données** : 8 événements de test intégrés  
**🔄 État** : **Fonctionnel et prêt pour la production**

---

*Système créé à partir du projet React/Firebase original, adapté en version web statique pour une utilisation immédiate sans infrastructure complexe.*