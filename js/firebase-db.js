// Firebase Database Operations
// Ce fichier contient toutes les fonctions pour interagir avec Firestore

import { 
    collection, 
    doc, 
    getDocs, 
    getDoc,
    addDoc, 
    updateDoc, 
    deleteDoc,
    query,
    orderBy,
    where,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Collection name
const EVENTS_COLLECTION = 'events';

// Get Firestore instance (set from index.html)
const getDB = () => window.firebaseDB;

/**
 * Load all events from Firestore
 * @returns {Promise<Array>} Array of events
 */
export async function loadEventsFromFirestore() {
    try {
        const db = getDB();
        const eventsRef = collection(db, EVENTS_COLLECTION);
        const q = query(eventsRef, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`${events.length} événements chargés depuis Firestore`);
        return events;
    } catch (error) {
        console.error('Erreur lors du chargement depuis Firestore:', error);
        throw error;
    }
}

/**
 * Get a single event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Event data
 */
export async function getEventById(eventId) {
    try {
        const db = getDB();
        const eventRef = doc(db, EVENTS_COLLECTION, eventId);
        const eventSnap = await getDoc(eventRef);
        
        if (eventSnap.exists()) {
            return {
                id: eventSnap.id,
                ...eventSnap.data()
            };
        } else {
            throw new Error('Événement non trouvé');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération:', error);
        throw error;
    }
}

/**
 * Create a new event in Firestore
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event with ID
 */
export async function createEvent(eventData) {
    try {
        const db = getDB();
        const eventsRef = collection(db, EVENTS_COLLECTION);
        
        // Add timestamps
        const dataWithTimestamps = {
            ...eventData,
            created_at: Timestamp.now(),
            updated_at: Timestamp.now()
        };
        
        const docRef = await addDoc(eventsRef, dataWithTimestamps);
        console.log('Événement créé avec ID:', docRef.id);
        
        return {
            id: docRef.id,
            ...dataWithTimestamps
        };
    } catch (error) {
        console.error('Erreur lors de la création:', error);
        throw error;
    }
}

/**
 * Update an existing event in Firestore
 * @param {string} eventId - Event ID
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event
 */
export async function updateEvent(eventId, eventData) {
    try {
        const db = getDB();
        const eventRef = doc(db, EVENTS_COLLECTION, eventId);
        
        // Add updated timestamp
        const dataWithTimestamp = {
            ...eventData,
            updated_at: Timestamp.now()
        };
        
        await updateDoc(eventRef, dataWithTimestamp);
        console.log('Événement mis à jour:', eventId);
        
        return {
            id: eventId,
            ...dataWithTimestamp
        };
    } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        throw error;
    }
}

/**
 * Delete an event from Firestore
 * @param {string} eventId - Event ID
 * @returns {Promise<void>}
 */
export async function deleteEvent(eventId) {
    try {
        const db = getDB();
        const eventRef = doc(db, EVENTS_COLLECTION, eventId);
        await deleteDoc(eventRef);
        console.log('Événement supprimé:', eventId);
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
    }
}

/**
 * Import multiple events to Firestore
 * @param {Array} eventsArray - Array of events to import
 * @returns {Promise<Array>} Array of created events with IDs
 */
export async function importEvents(eventsArray) {
    try {
        const db = getDB();
        const eventsRef = collection(db, EVENTS_COLLECTION);
        const createdEvents = [];
        
        for (const eventData of eventsArray) {
            const dataWithTimestamps = {
                ...eventData,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            };
            
            const docRef = await addDoc(eventsRef, dataWithTimestamps);
            createdEvents.push({
                id: docRef.id,
                ...dataWithTimestamps
            });
        }
        
        console.log(`${createdEvents.length} événements importés`);
        return createdEvents;
    } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        throw error;
    }
}

/**
 * Query events by year
 * @param {number} year - Year to filter
 * @returns {Promise<Array>} Filtered events
 */
export async function getEventsByYear(year) {
    try {
        const db = getDB();
        const eventsRef = collection(db, EVENTS_COLLECTION);
        const q = query(eventsRef, where('year', '==', year), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return events;
    } catch (error) {
        console.error('Erreur lors de la requête par année:', error);
        throw error;
    }
}

/**
 * Query events by year and quarter
 * @param {number} year - Year to filter
 * @param {string} quarter - Quarter (Q1, Q2, Q3, Q4)
 * @returns {Promise<Array>} Filtered events
 */
export async function getEventsByQuarter(year, quarter) {
    try {
        const db = getDB();
        const eventsRef = collection(db, EVENTS_COLLECTION);
        const q = query(
            eventsRef, 
            where('year', '==', year),
            where('quarter', '==', quarter),
            orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return events;
    } catch (error) {
        console.error('Erreur lors de la requête par trimestre:', error);
        throw error;
    }
}
