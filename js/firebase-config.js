// Firebase Configuration
// IMPORTANT: Remplacez ces valeurs par votre propre configuration Firebase
// Vous pouvez obtenir ces informations depuis la console Firebase :
// https://console.firebase.google.com/ > Project Settings > General > Your apps

export const firebaseConfig = {
    apiKey: "AIzaSyDNhRtZLh8vzpUPBOLOPBjT9NXIOWi9QQg",
    authDomain: "staff-time-app.firebaseapp.com",
    projectId: "staff-time-app",
    storageBucket: "staff-time-app.firebasestorage.app",
    messagingSenderId: "771230361508",
    appId: "1:771230361508:web:98a84eb13557f45f4d4331"
};

// Instructions pour obtenir votre configuration :
// 1. Allez sur https://console.firebase.google.com/
// 2. Sélectionnez ou créez votre projet
// 3. Cliquez sur l'icône web </> pour ajouter une application web
// 4. Copiez les valeurs de configuration
// 5. Remplacez les valeurs ci-dessus

// Règles Firestore recommandées (à configurer dans la console Firebase) :
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId} {
      allow read, write: if true;
    }
  }
}
*/

// Note: Ces règles permettent un accès complet en lecture/écriture.
// Pour une application de production, vous devriez ajouter une authentification Firebase
// et des règles plus strictes.
