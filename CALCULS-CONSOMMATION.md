# 🧮 Documentation des Calculs de Consommation (Version Configurable)

## 📋 Règles de Calcul

### ⚙️ **Paramètres Configurables**
Tous les tarifs peuvent être modifiés via l'interface ⚙️ :

### 🎯 **Tarifs d'Entrée (par défaut)**
- 👫 **Couples** : 50€
- 👩 **Femmes** : 25€  
- 👨 **Hommes** : 100€

### 🍺 **Consommations Incluses (par défaut)**
- **Prix unitaire** : 9€ par consommation
- **Nombre de consommations par type** :
  - 👫 **Couples** : 2 consommations
  - 👩 **Femmes** : 2 consommations
  - 👨 **Hommes** : 4 consommations

> 💡 **Note** : Ces valeurs sont les paramètres par défaut. Ils peuvent être modifiés à tout moment via l'interface de configuration accessible par l'icône ⚙️ dans la section ventilation.

### 💰 **Formule Simplifiée (Version Compacte)**

#### Calcul Direct
```
Résultat = Tarif d'entrée - (Prix consommation × Nombre de consommations)
```

#### Total Consommations (Format Compact)
```
Total Consommations = Nombre de participants × Nombre de consommations + "conso"
Exemple : 5 couples × 2 = "10conso"
```

## 📊 **Exemples Concrets (Version Compacte)**

### Calcul Direct par Type
- **👫 Couples** : 50€ - (9€ × 2) = **32€**
- **👩 Femmes** : 25€ - (9€ × 2) = **7€**
- **👨 Hommes** : 100€ - (9€ × 4) = **64€**

### Résultats par Type
- **👫 Couples** : 50€ - (9€ × 2) = **32€**
- **👩 Femmes** : 25€ - (9€ × 2) = **7€** 
- **👨 Hommes** : 100€ - (9€ × 4) = **64€**

### Affichage dans la Table de Ventilation (Final)
```
Type        | Entrée | Conso | Nbr Conso | Entrée-(Conso×NbrConso)
👫 Couple   | 50€    | 9€    | 2         | 32€
👩 Femme    | 25€    | 9€    | 2         | 7€
👨 Homme    | 100€   | 9€    | 4         | 64€
```

## 🔍 **Vérification des Calculs**

Pour tester les calculs, utilisez le fichier `test-event.html` qui :
1. Crée un événement de test avec des données connues
2. Valide automatiquement les formules de calcul
3. Affiche une comparaison avec les résultats attendus

## 🎨 **Affichage dans l'Interface (Version Finale)**

La table de ventilation affiche 5 colonnes essentielles :
1. **Type** - Type de participant (Couple/Femme/Homme)
2. **Entrée** - Tarif d'entrée unitaire
3. **Conso** - Prix unitaire de consommation (9€)
4. **Nbr Conso** - Nombre de consommations par participant
5. **Entrée - (Conso × Nbr Conso)** - Calcul direct du résultat final

## 📱 **Responsive Design**

Sur mobile, la table se transforme en cartes empilées avec :
- Labels intégrés pour chaque valeur
- Masquage de l'en-tête de table
- Affichage optimisé pour petits écrans