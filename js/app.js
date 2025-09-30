// Import Firebase functions
import { 
    loadEventsFromFirestore,
    createEvent as createFirebaseEvent,
    updateEvent as updateFirebaseEvent,
    deleteEvent as deleteFirebaseEvent,
    importEvents as importFirebaseEvents
} from './firebase-db.js';

// Variables globales
let currentEvents = [];
let previewData = [];
let currentEditingEvent = null;
let isDetailedView = false;

// Paramètres de ventilation par défaut
let ventilationSettings = {
    tarifCouple: 50,
    tarifFemme: 25,
    tarifHomme: 100,
    prixConso: 9,
    nbrConsoCouple: 2,
    nbrConsoFemme: 2,
    nbrConsoHomme: 4
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log('Initialisation de l\'application Caisse 2025...');
    
    // Configuration des onglets
    setupTabs();
    
    // Configuration du drag & drop
    setupDragAndDrop();
    
    // Configuration des événements
    setupEventHandlers();
    
    // Chargement initial des données
    await loadEvents();
    
    // Mise à jour du tableau de bord
    updateDashboard();
    
    // Chargement des paramètres de ventilation
    loadVentilationSettings();
    
    console.log('Application initialisée avec succès !');
}

// Gestion des paramètres de ventilation
function loadVentilationSettings() {
    const saved = localStorage.getItem('ventilationSettings');
    if (saved) {
        ventilationSettings = { ...ventilationSettings, ...JSON.parse(saved) };
    }
}

function saveVentilationSettings() {
    localStorage.setItem('ventilationSettings', JSON.stringify(ventilationSettings));
}

function resetVentilationSettings() {
    ventilationSettings = {
        tarifCouple: 50,
        tarifFemme: 25,
        tarifHomme: 100,
        prixConso: 9,
        nbrConsoCouple: 2,
        nbrConsoFemme: 2,
        nbrConsoHomme: 4
    };
    saveVentilationSettings();
}

// Configuration des onglets
function setupTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Désactiver tous les onglets
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            this.classList.add('active');
            document.getElementById(`content-${targetTab}`).classList.add('active');
            
            // Actions spécifiques selon l'onglet
            if (targetTab === 'dashboard') {
                updateDashboard();
            } else if (targetTab === 'events') {
                displayEvents();
            }
        });
    });
}

// Configuration du drag & drop
function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileImport({ target: { files: files } });
        }
    });
    
    dropZone.addEventListener('click', function() {
        document.getElementById('file-input').click();
    });
}

// Configuration des gestionnaires d'événements
function setupEventHandlers() {
    // Sélecteur d'année du tableau de bord
    const yearSelect = document.getElementById('year-select');
    yearSelect.addEventListener('change', updateDashboard);
    
    // Filtres des événements
    const filterYear = document.getElementById('filter-year');
    const filterQuarter = document.getElementById('filter-quarter');
    
    filterYear.addEventListener('change', displayEvents);
    filterQuarter.addEventListener('change', displayEvents);
    
    // Tri des événements
    const sortBy = document.getElementById('sort-by');
    sortBy.addEventListener('change', displayEvents);
    
    // Configuration de l'export
    setupExportHandlers();
    
    // Onglets du formulaire
    setupFormTabs();
    
    // Calcul automatique CA TTC dans le modal
    const caHtInput = document.getElementById('event-ca-ht');
    const tvaInput = document.getElementById('event-tva');
    const caTtcInput = document.getElementById('event-ca-ttc');
    
    function updateCaTtc() {
        const caHt = parseFloat(caHtInput.value) || 0;
        const tva = parseFloat(tvaInput.value) || 0;
        caTtcInput.value = (caHt + tva).toFixed(2);
    }
    
    caHtInput.addEventListener('input', updateCaTtc);
    tvaInput.addEventListener('input', updateCaTtc);
    
    // Calcul automatique TVA (20% par défaut)
    caHtInput.addEventListener('input', function() {
        const caHt = parseFloat(this.value) || 0;
        if (tvaInput.value === '' || tvaInput.value === '0') {
            tvaInput.value = (caHt * 0.2).toFixed(2);
            updateCaTtc();
        }
    });
    
    // Calcul automatique des totaux dans le formulaire
    setupAutoCalculations();
    
    // Fermeture du modal par échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEventModal();
        }
    });
}

// Chargement des événements depuis Firestore
async function loadEvents() {
    try {
        console.log('🔥 Chargement des événements depuis Firestore...');
        currentEvents = await loadEventsFromFirestore();
        console.log(`✅ ${currentEvents.length} événements chargés depuis Firestore`);
        
        displayEvents();
        updateDashboard();
    } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        showMessage('Erreur lors du chargement des événements', 'error');
    }
}

// Affichage des événements
function displayEvents() {
    // Récupération des filtres
    const filterYear = document.getElementById('filter-year').value;
    const filterQuarter = document.getElementById('filter-quarter').value;
    const sortBy = document.getElementById('sort-by').value;
    
    // Filtrage des événements
    let filteredEvents = currentEvents.filter(event => {
        if (filterYear && event.year != filterYear) return false;
        if (filterQuarter && event.quarter !== filterQuarter) return false;
        return true;
    });
    
    // Tri selon la sélection
    filteredEvents = sortEvents(filteredEvents, sortBy);
    
    const noData = document.getElementById('no-events');
    
    if (filteredEvents.length === 0) {
        noData.style.display = 'block';
        document.getElementById('events-table-simple').style.display = 'none';
        document.getElementById('events-detailed-view').style.display = 'none';
        return;
    }
    
    noData.style.display = 'none';
    
    if (isDetailedView) {
        displayDetailedEvents(filteredEvents);
    } else {
        displaySimpleEvents(filteredEvents);
    }
}

// Affichage simple des événements
function displaySimpleEvents(events) {
    const tbody = document.getElementById('events-tbody-simple');
    document.getElementById('events-table-simple').style.display = 'table';
    document.getElementById('events-detailed-view').style.display = 'none';
    
    tbody.innerHTML = events.map(event => {
        // Calcul des totaux selon les spécifications
        const totalEntrees = (event.cash_entrees || 0) + (event.carte_entrees || 0) + (event.credit_entrees || 0);
        const totalRecharges = (event.recharge_cash || 0) + (event.recharge_credit || 0);
        const totalCaSansNourriture = totalEntrees + totalRecharges;
        
        return `
            <tr class="fade-in">
                <td>
                    <div class="event-name">
                        ${event.nom}
                        ${event.type_soiree ? `<span class="badge-type-soiree ${event.type_soiree}">${event.type_soiree === 'all-inclusive' ? '🍹 AI' : '🍺 FB'}</span>` : ''}
                    </div>
                    <div class="event-date-small">${formatDate(event.date)} - ${event.quarter} ${event.year}</div>
                </td>
                <td class="text-center">${event.presents_couple || 0}</td>
                <td class="text-center">${event.presents_homme || 0}</td>
                <td class="text-center">${event.presents_femme || 0}</td>
                <td class="text-center">${event.renouvellement_carte || 0}</td>
                <td><span class="amount">${formatCurrency(event.consommation_nourriture || 0)}</span></td>
                <td><span class="amount">${formatCurrency(totalEntrees)}</span></td>
                <td><span class="amount">${formatCurrency(totalRecharges)}</span></td>
                <td><span class="amount total-ca">${formatCurrency(totalCaSansNourriture)}</span></td>
                <td class="actions">
                    <button class="btn btn-small btn-primary" onclick="editEvent('${event.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="deleteEvent('${event.id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Affichage détaillé des événements
function displayDetailedEvents(events) {
    const container = document.getElementById('detailed-events-container');
    document.getElementById('events-table-simple').style.display = 'none';
    document.getElementById('events-detailed-view').style.display = 'block';
    
    container.innerHTML = events.map(event => createDetailedEventCard(event)).join('');
}

// Création d'une carte détaillée d'événement - NOUVEAU DESIGN
function createDetailedEventCard(event) {
    // Calculs pour la vue détaillée
    const couples = event.presents_couple || 0;
    const hommes = event.presents_homme || 0;
    const femmes = event.presents_femme || 0;
    const cartes = event.renouvellement_carte || 0;
    
    // Recettes entrées (Cash + Carte + Crédit)
    const cashEntrees = event.cash_entrees || 0;
    const carteEntrees = event.carte_entrees || 0;
    const creditEntrees = event.credit_entrees || 0;
    const totalEntrees = cashEntrees + carteEntrees + creditEntrees;
    
    // Recharges (Cash + Crédit)
    const rechargeCash = event.recharge_cash || 0;
    const rechargeCredit = event.recharge_credit || 0;
    const totalRecharges = rechargeCash + rechargeCredit;
    
    // CA et nourriture
    const nourriture = event.consommation_nourriture || 0;
    const totalCA = totalEntrees + totalRecharges;
    
    return `
        <div class="event-detail-card-compact">
            <!-- En-tête condensé -->
            <div class="event-header-compact">
                <div class="event-info">
                    <h3>${event.nom}</h3>
                    <span class="event-date">${formatDate(event.date)} • ${event.quarter} ${event.year}</span>
                    ${event.heure_debut ? `<span class="event-time">${event.heure_debut} - ${event.heure_fin}</span>` : ''}
                </div>
                <div class="event-actions-compact">
                    <button class="btn-action edit" onclick="editEvent('${event.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="deleteEvent('${event.id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <!-- Données condensées -->
            <div class="event-data-compact">
                ${event.type_soiree ? `
                <!-- Type de soirée -->
                <div class="type-soiree-badge ${event.type_soiree}">
                    ${event.type_soiree === 'all-inclusive' ? '🍹 All Inclusive' : '🍺 Formule Bar'}
                </div>
                ` : ''}
                
                <!-- Participants en ligne -->
                <div class="participants-compact">
                    <strong>Participants:</strong>
                    <span>👫 ${couples}</span>
                    <span>👩 ${femmes}</span>
                    <span>👨 ${hommes}</span>
                    <span>🎫 ${cartes}</span>
                </div>
                
                <!-- Recettes en ligne -->
                <div class="recettes-compact">
                    <div class="recette-line">
                        <strong>Entrées:</strong>
                        Cash ${formatCurrency(cashEntrees)} | Carte ${formatCurrency(carteEntrees)} | Crédit ${formatCurrency(creditEntrees)}
                        <span class="total">= ${formatCurrency(totalEntrees)}</span>
                    </div>
                    <div class="recette-line">
                        <strong>Recharges:</strong>
                        Cash ${formatCurrency(rechargeCash)} | Crédit ${formatCurrency(rechargeCredit)}
                        <span class="total">= ${formatCurrency(totalRecharges)}</span>
                    </div>
                    <div class="recette-line">
                        <strong>Nourriture:</strong> ${formatCurrency(nourriture)}
                        <strong class="ca-total">CA Total: ${formatCurrency(totalCA)}</strong>
                    </div>
                </div>
                
                <!-- Table de ventilation simplifiée -->
                <div class="ventilation-compact">
                    <div class="ventilation-header-with-settings">
                        <h4>Ventilation</h4>
                        <button class="btn-settings" onclick="openVentilationSettings()" title="Modifier les tarifs">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                    <div class="ventilation-table-compact">
                        <div class="ventilation-header-compact">
                            <div>Type</div>
                            <div>Entrée</div>
                            <div>Conso</div>
                            <div>Nbr Conso</div>
                            <div>Entrée - (Conso × Nbr Conso)</div>
                        </div>
                        <div class="ventilation-row-compact">
                            <div><strong>👫 Couple</strong></div>
                            <div>${ventilationSettings.tarifCouple}€</div>
                            <div>${ventilationSettings.prixConso}€</div>
                            <div>${ventilationSettings.nbrConsoCouple}</div>
                            <div>${ventilationSettings.tarifCouple - (ventilationSettings.prixConso * ventilationSettings.nbrConsoCouple)}€</div>
                        </div>
                        <div class="ventilation-row-compact">
                            <div><strong>👩 Femme</strong></div>
                            <div>${ventilationSettings.tarifFemme}€</div>
                            <div>${ventilationSettings.prixConso}€</div>
                            <div>${ventilationSettings.nbrConsoFemme}</div>
                            <div>${ventilationSettings.tarifFemme - (ventilationSettings.prixConso * ventilationSettings.nbrConsoFemme)}€</div>
                        </div>
                        <div class="ventilation-row-compact">
                            <div><strong>👨 Homme</strong></div>
                            <div>${ventilationSettings.tarifHomme}€</div>
                            <div>${ventilationSettings.prixConso}€</div>
                            <div>${ventilationSettings.nbrConsoHomme}</div>
                            <div>${ventilationSettings.tarifHomme - (ventilationSettings.prixConso * ventilationSettings.nbrConsoHomme)}€</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Mise à jour du tableau de bord
function updateDashboard() {
    const year = parseInt(document.getElementById('year-select').value);
    const yearEvents = currentEvents.filter(event => event.year === year);
    
    updateYearStats(yearEvents, year);
    updateQuarterStats(yearEvents, year);
}

// Statistiques annuelles
function updateYearStats(events, year) {
    const statsGrid = document.getElementById('stats-grid');
    
    const totalEvents = events.length;
    const totalParticipants = events.reduce((sum, event) => sum + event.participants, 0);
    const totalCartes = events.reduce((sum, event) => sum + (event.renouvellement_carte || 0), 0);
    const totalEntrees = events.reduce((sum, event) => sum + (event.total_entrees || 0), 0);
    const totalCaTtc = events.reduce((sum, event) => sum + event.ca_ttc, 0);
    const avgParticipants = totalEvents > 0 ? (totalParticipants / totalEvents) : 0;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalEvents}</div>
            <div class="stat-label">Événements</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalParticipants}</div>
            <div class="stat-label">Participants</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalCartes}</div>
            <div class="stat-label">Cartes Membre</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatCurrency(totalEntrees)}</div>
            <div class="stat-label">Total Entrées</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatCurrency(totalCaTtc)}</div>
            <div class="stat-label">CA TTC</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${Math.round(avgParticipants)}</div>
            <div class="stat-label">Moy. Participants</div>
        </div>
    `;
}

// Statistiques par trimestre
function updateQuarterStats(events, year) {
    const quartersGrid = document.getElementById('quarters-grid');
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    const quarterCards = quarters.map(quarter => {
        const quarterEvents = events.filter(event => event.quarter === quarter);
        const totalEvents = quarterEvents.length;
        const totalCouples = quarterEvents.reduce((sum, event) => sum + (event.presents_couple || 0), 0);
        const totalHommes = quarterEvents.reduce((sum, event) => sum + (event.presents_homme || 0), 0);
        const totalFemmes = quarterEvents.reduce((sum, event) => sum + (event.presents_femme || 0), 0);
        const totalCaTtc = quarterEvents.reduce((sum, event) => sum + event.ca_ttc, 0);
        
        return `
            <div class="quarter-card">
                <div class="quarter-title">${quarter} ${year}</div>
                <div class="quarter-stats">
                    <div class="quarter-stat">
                        <span>Événements</span>
                        <span class="quarter-stat-value">${totalEvents}</span>
                    </div>
                    <div class="quarter-stat">
                        <span>Couples</span>
                        <span class="quarter-stat-value">${totalCouples}</span>
                    </div>
                    <div class="quarter-stat">
                        <span>Hommes</span>
                        <span class="quarter-stat-value">${totalHommes}</span>
                    </div>
                    <div class="quarter-stat">
                        <span>Femmes</span>
                        <span class="quarter-stat-value">${totalFemmes}</span>
                    </div>
                    <div class="quarter-stat">
                        <span>CA TTC</span>
                        <span class="quarter-stat-value amount">${formatCurrency(totalCaTtc)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    quartersGrid.innerHTML = quarterCards;
}

// Gestion des fichiers
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('Import du fichier:', file.name, file.type);
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
        importCSV(file);
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
        importExcel(file);
    } else {
        showMessage('Format de fichier non supporté. Utilisez CSV ou Excel.', 'error');
    }
}

// Import CSV
function importCSV(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log('Données CSV parsées:', results.data);
            processImportData(results.data);
        },
        error: function(error) {
            console.error('Erreur lors du parsing CSV:', error);
            showMessage('Erreur lors de la lecture du fichier CSV', 'error');
        }
    });
}

// Import Excel
function importExcel(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            console.log('Données Excel parsées:', data);
            processImportData(data);
        } catch (error) {
            console.error('Erreur lors du parsing Excel:', error);
            showMessage('Erreur lors de la lecture du fichier Excel', 'error');
        }
    };
    reader.readAsBinaryString(file);
}

// Traitement des données importées
function processImportData(data) {
    previewData = data.map(row => {
        // Normalisation des noms de colonnes (insensible à la casse)
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
            const normalizedKey = key.toLowerCase().trim();
            normalizedRow[normalizedKey] = row[key];
        });
        
        // Extraction des données avec différentes variantes possibles
        const nom = normalizedRow['nom'] || normalizedRow['name'] || normalizedRow['événement'] || normalizedRow['event'] || normalizedRow['titre de la soirée'] || '';
        
        // Date avec conversion du format DD/MM/YYYY vers YYYY-MM-DD
        let date = normalizedRow['date'] || normalizedRow['date de la soirée'] || '';
        if (date && date.includes('/')) {
            const parts = date.split('/');
            if (parts.length === 3) {
                date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        
        // Participants
        const participants = parseInt(normalizedRow['participants'] || normalizedRow['participant'] || normalizedRow['nombre de présences'] || 0);
        const presences_totales = parseInt(normalizedRow['présences totales'] || normalizedRow['présences totales (avec entrées gratuites)'] || participants);
        const presents_couple = parseInt(normalizedRow['présents couple'] || normalizedRow['nombre de présents couple'] || 0);
        const presents_homme = parseInt(normalizedRow['présents homme'] || normalizedRow['présents hommes'] || 0);
        const presents_femme = parseInt(normalizedRow['présents femme'] || normalizedRow['présents femmes'] || 0);
        const renouvellement_carte = parseInt(normalizedRow['renouvellement carte'] || 0);
        
        // Horaires
        const heure_debut = normalizedRow['heure de début'] || normalizedRow['heure début'] || '';
        const heure_fin = normalizedRow['heure de fin'] || normalizedRow['heure fin'] || '';
        
        // Type de soirée
        let type_soiree = normalizedRow['type soirée'] || normalizedRow['type de soirée'] || '';
        // Normaliser les valeurs possibles
        if (type_soiree) {
            const typeStr = type_soiree.toString().toLowerCase();
            if (typeStr.includes('all') || typeStr.includes('inclusive')) {
                type_soiree = 'all-inclusive';
            } else if (typeStr.includes('bar') || typeStr.includes('formule')) {
                type_soiree = 'formule-bar';
            }
        }
        
        // Recettes
        const cash_entrees = parseFloat(normalizedRow['cash (entrées)'] || normalizedRow['cash entrées'] || 0);
        const carte_entrees = parseFloat(normalizedRow['carte (entrées)'] || normalizedRow['carte entrées'] || 0);
        const credit_entrees = parseFloat(normalizedRow['crédit (entrées)'] || normalizedRow['crédit entrées'] || 0);
        const total_entrees = parseFloat(normalizedRow['total entrées'] || (cash_entrees + carte_entrees + credit_entrees));
        
        // Recharges
        const recharge_cash = parseFloat(normalizedRow['recharge cash'] || 0);
        const recharge_credit = parseFloat(normalizedRow['recharge crédit'] || 0);
        const total_recharges = parseFloat(normalizedRow['total recharges'] || (recharge_cash + recharge_credit));
        
        // Consommation
        const quantite_snacks = parseInt(normalizedRow['quantité de snacks'] || normalizedRow['quantité snacks'] || 0);
        let consommation_nourriture = normalizedRow['consommation nourriture'] || 0;
        // Nettoyer le symbole € si présent
        if (typeof consommation_nourriture === 'string') {
            consommation_nourriture = parseFloat(consommation_nourriture.replace('€', '').trim()) || 0;
        } else {
            consommation_nourriture = parseFloat(consommation_nourriture) || 0;
        }
        
        // Calculs financiers
        const ca_ttc = parseFloat(normalizedRow['chiffre d\'affaires total'] || normalizedRow['ca_ttc'] || normalizedRow['ca ttc'] || normalizedRow['ttc'] || total_entrees + total_recharges);
        const ca_ht = parseFloat(normalizedRow['ca_ht'] || normalizedRow['ca ht'] || normalizedRow['ht'] || (ca_ttc / 1.2));
        const tva = parseFloat(normalizedRow['tva'] || normalizedRow['tax'] || (ca_ttc - ca_ht));
        
        // Calcul du trimestre et de l'année
        const eventDate = new Date(date);
        const year = eventDate.getFullYear();
        const month = eventDate.getMonth() + 1;
        const quarter = getQuarterFromMonth(month);
        
        return {
            nom,
            date,
            year,
            quarter,
            type_soiree,
            heure_debut,
            heure_fin,
            participants,
            presences_totales,
            presents_couple,
            presents_homme,
            presents_femme,
            renouvellement_carte,
            quantite_snacks,
            consommation_nourriture,
            cash_entrees,
            carte_entrees,
            credit_entrees,
            total_entrees,
            recharge_cash,
            recharge_credit,
            total_recharges,
            ca_ht,
            tva,
            ca_ttc
        };
    }).filter(row => row.nom && row.date); // Filtrer les lignes vides
    
    if (previewData.length === 0) {
        showMessage('Aucune donnée valide trouvée dans le fichier', 'error');
        return;
    }
    
    showImportPreview();
}

// Affichage de la prévisualisation
function showImportPreview() {
    const previewSection = document.getElementById('import-preview');
    const tableContainer = document.getElementById('preview-table-container');
    
    const table = `
        <table class="preview-table">
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Date</th>
                    <th>Trimestre</th>
                    <th>Participants</th>
                    <th>CA HT</th>
                    <th>TVA</th>
                    <th>CA TTC</th>
                </tr>
            </thead>
            <tbody>
                ${previewData.map(row => `
                    <tr>
                        <td>${row.nom}</td>
                        <td>${formatDate(row.date)}</td>
                        <td>${row.quarter} ${row.year}</td>
                        <td>${row.participants}</td>
                        <td>${formatCurrency(row.ca_ht)}</td>
                        <td>${formatCurrency(row.tva)}</td>
                        <td>${formatCurrency(row.ca_ttc)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = table;
    previewSection.style.display = 'block';
    
    // Scroll vers la prévisualisation
    previewSection.scrollIntoView({ behavior: 'smooth' });
}

// Confirmation de l'import
async function confirmImport() {
    if (previewData.length === 0) return;
    
    try {
        console.log('🔥 Import Firebase de', previewData.length, 'événements');
        
        // Utiliser la fonction d'import Firebase qui gère les lots
        await importFirebaseEvents(previewData);
        
        showMessage(`✅ ${previewData.length} événements importés avec succès dans Firestore !`, 'success');
        cancelImport();
        await loadEvents();
        
    } catch (error) {
        console.error('❌ Erreur Firebase lors de l\'import:', error);
        showMessage('Erreur lors de l\'import des données', 'error');
    }
}

// Annulation de l'import
function cancelImport() {
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('file-input').value = '';
    previewData = [];
}

// Gestion du modal d'événement
function addEvent() {
    currentEditingEvent = null;
    document.getElementById('modal-title').textContent = 'Ajouter un événement';
    document.getElementById('event-form').reset();
    
    // Date par défaut : aujourd'hui
    document.getElementById('event-date').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('event-modal').classList.add('active');
}

function editEvent(eventId) {
    currentEditingEvent = currentEvents.find(event => event.id === eventId);
    if (!currentEditingEvent) return;
    
    document.getElementById('modal-title').textContent = 'Modifier l\'événement';
    
    // Remplissage du formulaire - Général
    document.getElementById('event-nom').value = currentEditingEvent.nom || '';
    document.getElementById('event-date').value = currentEditingEvent.date || '';
    document.getElementById('event-heure-debut').value = currentEditingEvent.heure_debut || '';
    document.getElementById('event-heure-fin').value = currentEditingEvent.heure_fin || '';
    document.getElementById('event-type-soiree').value = currentEditingEvent.type_soiree || '';
    
    // Participants
    document.getElementById('event-participants').value = currentEditingEvent.participants || '';
    document.getElementById('event-presences-totales').value = currentEditingEvent.presences_totales || '';
    document.getElementById('event-presents-couple').value = currentEditingEvent.presents_couple || '';
    document.getElementById('event-presents-homme').value = currentEditingEvent.presents_homme || '';
    document.getElementById('event-presents-femme').value = currentEditingEvent.presents_femme || '';
    document.getElementById('event-renouvellement-carte').value = currentEditingEvent.renouvellement_carte || '';
    
    // Recettes
    document.getElementById('event-cash-entrees').value = currentEditingEvent.cash_entrees || '';
    document.getElementById('event-carte-entrees').value = currentEditingEvent.carte_entrees || '';
    document.getElementById('event-credit-entrees').value = currentEditingEvent.credit_entrees || '';
    document.getElementById('event-total-entrees').value = currentEditingEvent.total_entrees || '';
    document.getElementById('event-recharge-cash').value = currentEditingEvent.recharge_cash || '';
    document.getElementById('event-recharge-credit').value = currentEditingEvent.recharge_credit || '';
    document.getElementById('event-total-recharges').value = currentEditingEvent.total_recharges || '';
    document.getElementById('event-ca-ht').value = currentEditingEvent.ca_ht || '';
    document.getElementById('event-tva').value = currentEditingEvent.tva || '';
    document.getElementById('event-ca-ttc').value = currentEditingEvent.ca_ttc || '';
    
    // Consommation
    document.getElementById('event-quantite-snacks').value = currentEditingEvent.quantite_snacks || '';
    document.getElementById('event-consommation-nourriture').value = currentEditingEvent.consommation_nourriture || '';
    
    document.getElementById('event-modal').classList.add('active');
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('active');
    document.getElementById('event-form').reset();
    currentEditingEvent = null;
}

async function saveEvent() {
    const form = document.getElementById('event-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Récupération de toutes les données du formulaire
    const nom = document.getElementById('event-nom').value;
    const date = document.getElementById('event-date').value;
    const heure_debut = document.getElementById('event-heure-debut').value;
    const heure_fin = document.getElementById('event-heure-fin').value;
    const type_soiree = document.getElementById('event-type-soiree').value;
    
    const participants = parseInt(document.getElementById('event-participants').value) || 0;
    const presences_totales = parseInt(document.getElementById('event-presences-totales').value) || participants;
    const presents_couple = parseInt(document.getElementById('event-presents-couple').value) || 0;
    const presents_homme = parseInt(document.getElementById('event-presents-homme').value) || 0;
    const presents_femme = parseInt(document.getElementById('event-presents-femme').value) || 0;
    const renouvellement_carte = parseInt(document.getElementById('event-renouvellement-carte').value) || 0;
    
    const cash_entrees = parseFloat(document.getElementById('event-cash-entrees').value) || 0;
    const carte_entrees = parseFloat(document.getElementById('event-carte-entrees').value) || 0;
    const credit_entrees = parseFloat(document.getElementById('event-credit-entrees').value) || 0;
    const total_entrees = parseFloat(document.getElementById('event-total-entrees').value) || (cash_entrees + carte_entrees + credit_entrees);
    
    const recharge_cash = parseFloat(document.getElementById('event-recharge-cash').value) || 0;
    const recharge_credit = parseFloat(document.getElementById('event-recharge-credit').value) || 0;
    const total_recharges = parseFloat(document.getElementById('event-total-recharges').value) || (recharge_cash + recharge_credit);
    
    const ca_ht = parseFloat(document.getElementById('event-ca-ht').value) || 0;
    const tva = parseFloat(document.getElementById('event-tva').value) || 0;
    const ca_ttc = parseFloat(document.getElementById('event-ca-ttc').value) || (ca_ht + tva);
    
    const quantite_snacks = parseInt(document.getElementById('event-quantite-snacks').value) || 0;
    const consommation_nourriture = parseFloat(document.getElementById('event-consommation-nourriture').value) || 0;
    
    // Calcul du trimestre et de l'année
    const eventDate = new Date(date);
    const year = eventDate.getFullYear();
    const month = eventDate.getMonth() + 1;
    const quarter = getQuarterFromMonth(month);
    
    const eventData = {
        nom,
        date,
        year,
        quarter,
        type_soiree,
        heure_debut,
        heure_fin,
        participants,
        presences_totales,
        presents_couple,
        presents_homme,
        presents_femme,
        renouvellement_carte,
        quantite_snacks,
        consommation_nourriture,
        cash_entrees,
        carte_entrees,
        credit_entrees,
        total_entrees,
        recharge_cash,
        recharge_credit,
        total_recharges,
        ca_ht,
        tva,
        ca_ttc
    };
    
    try {
        if (currentEditingEvent) {
            // Modification avec Firebase
            console.log('🔥 Modification événement Firebase avec type_soiree:', eventData.type_soiree);
            await updateFirebaseEvent(currentEditingEvent.id, eventData);
            showMessage('✅ Événement modifié avec succès !', 'success');
        } else {
            // Création avec Firebase
            console.log('🔥 Création événement Firebase avec type_soiree:', eventData.type_soiree);
            await createFirebaseEvent(eventData);
            showMessage('✅ Événement ajouté avec succès !', 'success');
        }
        
        closeEventModal();
        await loadEvents();
        
    } catch (error) {
        console.error('❌ Erreur Firebase lors de la sauvegarde:', error);
        showMessage('Erreur lors de la sauvegarde de l\'événement', 'error');
    }
}

async function deleteEvent(eventId) {
    const event = currentEvents.find(e => e.id === eventId);
    if (!event) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.nom}" ?`)) {
        return;
    }
    
    try {
        console.log('🔥 Suppression événement Firebase:', eventId);
        await deleteFirebaseEvent(eventId);
        showMessage('✅ Événement supprimé avec succès !', 'success');
        await loadEvents();
        
    } catch (error) {
        console.error('❌ Erreur Firebase lors de la suppression:', error);
        showMessage('Erreur lors de la suppression de l\'événement', 'error');
    }
}

// Export des données
function exportQuarter(quarter) {
    const year = parseInt(document.getElementById('export-year').value);
    const quarterEvents = currentEvents.filter(event => 
        event.year === year && event.quarter === quarter
    );
    
    if (quarterEvents.length === 0) {
        showMessage(`Aucun événement trouvé pour ${quarter} ${year}`, 'error');
        return;
    }
    
    const filename = `caisse_${year}_${quarter}.xlsx`;
    exportToExcel(quarterEvents, filename, `Événements ${quarter} ${year}`);
}

function exportAnnualSummary() {
    const year = parseInt(document.getElementById('export-year').value);
    const yearEvents = currentEvents.filter(event => event.year === year);
    
    if (yearEvents.length === 0) {
        showMessage(`Aucun événement trouvé pour ${year}`, 'error');
        return;
    }
    
    const filename = `caisse_${year}_resume.xlsx`;
    exportToExcel(yearEvents, filename, `Résumé ${year}`);
}

function exportAllEvents() {
    if (currentEvents.length === 0) {
        showMessage('Aucun événement à exporter', 'error');
        return;
    }
    
    const filename = 'caisse_tous_evenements.xlsx';
    exportToExcel(currentEvents, filename, 'Tous les événements');
}

function exportToExcel(events, filename, sheetName) {
    const data = events.map(event => ({
        'Nom': event.nom,
        'Date': event.date,
        'Trimestre': `${event.quarter} ${event.year}`,
        'Participants': event.participants,
        'CA HT': event.ca_ht,
        'TVA': event.tva,
        'CA TTC': event.ca_ttc
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    XLSX.writeFile(workbook, filename);
    showMessage(`Fichier ${filename} téléchargé avec succès !`, 'success');
}

// Fonctions utilitaires
function getQuarterFromMonth(month) {
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function formatCurrency(amount) {
    if (typeof amount !== 'number') return '0,00 €';
    return amount.toLocaleString('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    });
}

function showMessage(message, type) {
    // Créer le message
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    // Ajouter au début du container
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
    
    // Scroll vers le haut pour voir le message
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Basculer entre vue simple et détaillée
function toggleEventView() {
    const toggleBtn = document.getElementById('toggle-view');
    const icon = toggleBtn.querySelector('i');
    
    isDetailedView = !isDetailedView;
    
    if (isDetailedView) {
        toggleBtn.innerHTML = '<i class="fas fa-compress"></i> Vue simple';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-expand"></i> Vue détaillée';
    }
    
    displayEvents();
}

// Configuration des onglets du formulaire
function setupFormTabs() {
    const tabs = document.querySelectorAll('.form-tab');
    const contents = document.querySelectorAll('.form-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Désactiver tous les onglets
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            this.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

// Configuration des calculs automatiques
function setupAutoCalculations() {
    // Calculs des totaux entrées
    const entreeInputs = ['event-cash-entrees', 'event-carte-entrees', 'event-credit-entrees'];
    entreeInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', calculateTotalEntrees);
        }
    });
    
    // Calculs des totaux recharges
    const rechargeInputs = ['event-recharge-cash', 'event-recharge-credit'];
    rechargeInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', calculateTotalRecharges);
        }
    });
}

function calculateTotalEntrees() {
    const cash = parseFloat(document.getElementById('event-cash-entrees').value) || 0;
    const carte = parseFloat(document.getElementById('event-carte-entrees').value) || 0;
    const credit = parseFloat(document.getElementById('event-credit-entrees').value) || 0;
    
    const total = cash + carte + credit;
    document.getElementById('event-total-entrees').value = total.toFixed(2);
}

function calculateTotalRecharges() {
    const cash = parseFloat(document.getElementById('event-recharge-cash').value) || 0;
    const credit = parseFloat(document.getElementById('event-recharge-credit').value) || 0;
    
    const total = cash + credit;
    document.getElementById('event-total-recharges').value = total.toFixed(2);
}

// Fonction de tri des événements
function sortEvents(events, sortBy) {
    switch(sortBy) {
        case 'date-desc':
            return events.sort((a, b) => new Date(b.date) - new Date(a.date));
        case 'date-asc':
            return events.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'nom-asc':
            return events.sort((a, b) => a.nom.localeCompare(b.nom));
        case 'nom-desc':
            return events.sort((a, b) => b.nom.localeCompare(a.nom));
        case 'ca-desc':
            return events.sort((a, b) => b.ca_ttc - a.ca_ttc);
        case 'ca-asc':
            return events.sort((a, b) => a.ca_ttc - b.ca_ttc);
        case 'participants-desc':
            return events.sort((a, b) => (b.participants || 0) - (a.participants || 0));
        case 'participants-asc':
            return events.sort((a, b) => (a.participants || 0) - (b.participants || 0));
        default:
            return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

// Gestion des imports multiples
function handleMultipleFileImport(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    console.log(`Import de ${files.length} fichiers`);
    let allData = [];
    let processedFiles = 0;
    
    Array.from(files).forEach((file, index) => {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    console.log(`Fichier ${file.name} parsé:`, results.data);
                    allData = allData.concat(results.data);
                    processedFiles++;
                    
                    if (processedFiles === files.length) {
                        processMultipleImportData(allData);
                    }
                },
                error: function(error) {
                    console.error(`Erreur lors du parsing de ${file.name}:`, error);
                    processedFiles++;
                    if (processedFiles === files.length) {
                        processMultipleImportData(allData);
                    }
                }
            });
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const workbook = XLSX.read(e.target.result, { type: 'binary' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const data = XLSX.utils.sheet_to_json(worksheet);
                    
                    console.log(`Fichier ${file.name} parsé:`, data);
                    allData = allData.concat(data);
                    processedFiles++;
                    
                    if (processedFiles === files.length) {
                        processMultipleImportData(allData);
                    }
                } catch (error) {
                    console.error(`Erreur lors du parsing de ${file.name}:`, error);
                    processedFiles++;
                    if (processedFiles === files.length) {
                        processMultipleImportData(allData);
                    }
                }
            };
            reader.readAsBinaryString(file);
        } else {
            console.warn(`Format non supporté pour ${file.name}`);
            processedFiles++;
            if (processedFiles === files.length) {
                processMultipleImportData(allData);
            }
        }
    });
}

// Traitement des données multiples
function processMultipleImportData(allData) {
    if (allData.length === 0) {
        showMessage('Aucune donnée valide trouvée dans les fichiers', 'error');
        return;
    }
    
    // Utiliser la même logique que l'import simple
    previewData = allData.map(row => {
        // Normalisation identique à processImportData
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
            const normalizedKey = key.toLowerCase().trim();
            normalizedRow[normalizedKey] = row[key];
        });
        
        const nom = normalizedRow['nom'] || normalizedRow['name'] || normalizedRow['événement'] || normalizedRow['event'] || normalizedRow['titre de la soirée'] || '';
        
        let date = normalizedRow['date'] || normalizedRow['date de la soirée'] || '';
        if (date && date.includes('/')) {
            const parts = date.split('/');
            if (parts.length === 3) {
                date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        
        const participants = parseInt(normalizedRow['participants'] || normalizedRow['participant'] || normalizedRow['nombre de présences'] || 0);
        const presences_totales = parseInt(normalizedRow['présences totales'] || normalizedRow['présences totales (avec entrées gratuites)'] || participants);
        const presents_couple = parseInt(normalizedRow['présents couple'] || normalizedRow['nombre de présents couple'] || 0);
        const presents_homme = parseInt(normalizedRow['présents homme'] || normalizedRow['présents hommes'] || 0);
        const presents_femme = parseInt(normalizedRow['présents femme'] || normalizedRow['présents femmes'] || 0);
        const renouvellement_carte = parseInt(normalizedRow['renouvellement carte'] || 0);
        
        const heure_debut = normalizedRow['heure de début'] || normalizedRow['heure début'] || '';
        const heure_fin = normalizedRow['heure de fin'] || normalizedRow['heure fin'] || '';
        
        // Type de soirée
        let type_soiree = normalizedRow['type soirée'] || normalizedRow['type de soirée'] || '';
        if (type_soiree) {
            const typeStr = type_soiree.toString().toLowerCase();
            if (typeStr.includes('all') || typeStr.includes('inclusive')) {
                type_soiree = 'all-inclusive';
            } else if (typeStr.includes('bar') || typeStr.includes('formule')) {
                type_soiree = 'formule-bar';
            }
        }
        
        const cash_entrees = parseFloat(normalizedRow['cash (entrées)'] || normalizedRow['cash entrées'] || 0);
        const carte_entrees = parseFloat(normalizedRow['carte (entrées)'] || normalizedRow['carte entrées'] || 0);
        const credit_entrees = parseFloat(normalizedRow['crédit (entrées)'] || normalizedRow['crédit entrées'] || 0);
        const total_entrees = parseFloat(normalizedRow['total entrées'] || (cash_entrees + carte_entrees + credit_entrees));
        
        const recharge_cash = parseFloat(normalizedRow['recharge cash'] || 0);
        const recharge_credit = parseFloat(normalizedRow['recharge crédit'] || 0);
        const total_recharges = parseFloat(normalizedRow['total recharges'] || (recharge_cash + recharge_credit));
        
        const quantite_snacks = parseInt(normalizedRow['quantité de snacks'] || normalizedRow['quantité snacks'] || 0);
        let consommation_nourriture = normalizedRow['consommation nourriture'] || 0;
        if (typeof consommation_nourriture === 'string') {
            consommation_nourriture = parseFloat(consommation_nourriture.replace('€', '').trim()) || 0;
        } else {
            consommation_nourriture = parseFloat(consommation_nourriture) || 0;
        }
        
        const ca_ttc = parseFloat(normalizedRow['chiffre d\'affaires total'] || normalizedRow['ca_ttc'] || normalizedRow['ca ttc'] || normalizedRow['ttc'] || total_entrees + total_recharges);
        const ca_ht = parseFloat(normalizedRow['ca_ht'] || normalizedRow['ca ht'] || normalizedRow['ht'] || (ca_ttc / 1.2));
        const tva = parseFloat(normalizedRow['tva'] || normalizedRow['tax'] || (ca_ttc - ca_ht));
        
        const eventDate = new Date(date);
        const year = eventDate.getFullYear();
        const month = eventDate.getMonth() + 1;
        const quarter = getQuarterFromMonth(month);
        
        return {
            nom,
            date,
            year,
            quarter,
            type_soiree,
            heure_debut,
            heure_fin,
            participants,
            presences_totales,
            presents_couple,
            presents_homme,
            presents_femme,
            renouvellement_carte,
            quantite_snacks,
            consommation_nourriture,
            cash_entrees,
            carte_entrees,
            credit_entrees,
            total_entrees,
            recharge_cash,
            recharge_credit,
            total_recharges,
            ca_ht,
            tva,
            ca_ttc
        };
    }).filter(row => row.nom && row.date);
    
    if (previewData.length === 0) {
        showMessage('Aucune donnée valide trouvée dans les fichiers', 'error');
        return;
    }
    
    showMessage(`${previewData.length} événements détectés dans les fichiers`, 'success');
    showImportPreview();
}

// Configuration des gestionnaires d'export
function setupExportHandlers() {
    const exportPeriod = document.getElementById('export-period');
    const exportYearGroup = document.getElementById('export-year-group');
    const exportQuarterGroup = document.getElementById('export-quarter-group');
    const customDates = document.getElementById('custom-dates');
    
    exportPeriod.addEventListener('change', function() {
        const period = this.value;
        
        exportYearGroup.style.display = period === 'year' || period === 'quarter' ? 'block' : 'none';
        exportQuarterGroup.style.display = period === 'quarter' ? 'block' : 'none';
        customDates.style.display = period === 'custom' ? 'flex' : 'none';
    });
}

// Export personnalisé
function exportCustom() {
    const period = document.getElementById('export-period').value;
    const year = document.getElementById('export-year').value;
    const quarter = document.getElementById('export-quarter').value;
    const startDate = document.getElementById('export-date-start').value;
    const endDate = document.getElementById('export-date-end').value;
    
    // Filtrage des événements selon la période
    let filteredEvents = [...currentEvents];
    
    switch(period) {
        case 'year':
            filteredEvents = filteredEvents.filter(event => event.year == year);
            break;
        case 'quarter':
            filteredEvents = filteredEvents.filter(event => event.year == year && event.quarter === quarter);
            break;
        case 'custom':
            if (startDate && endDate) {
                filteredEvents = filteredEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
                });
            }
            break;
    }
    
    if (filteredEvents.length === 0) {
        showMessage('Aucun événement trouvé pour la période sélectionnée', 'error');
        return;
    }
    
    // Récupération des colonnes sélectionnées
    const columns = getSelectedColumns();
    
    // Génération des données d'export
    const exportData = filteredEvents.map(event => {
        const row = {};
        
        columns.forEach(col => {
            switch(col.id) {
                case 'col-nom':
                    row['Nom Événement'] = event.nom;
                    break;
                case 'col-date':
                    row['Date'] = formatDate(event.date);
                    break;
                case 'col-trimestre':
                    row['Trimestre'] = `${event.quarter} ${event.year}`;
                    break;
                case 'col-type-soiree':
                    row['Type Soirée'] = event.type_soiree === 'all-inclusive' ? 'All Inclusive' : event.type_soiree === 'formule-bar' ? 'Formule Bar' : '';
                    break;
                case 'col-couples':
                    row['Couples'] = event.presents_couple || 0;
                    break;
                case 'col-hommes':
                    row['Hommes'] = event.presents_homme || 0;
                    break;
                case 'col-femmes':
                    row['Femmes'] = event.presents_femme || 0;
                    break;
                case 'col-cartes':
                    row['Cartes Membre'] = event.renouvellement_carte || 0;
                    break;
                case 'col-cash-entrees':
                    row['Cash Entrées'] = event.cash_entrees || 0;
                    break;
                case 'col-carte-entrees':
                    row['Carte Entrées'] = event.carte_entrees || 0;
                    break;
                case 'col-bc-entrees':
                    row['Crédit Entrées'] = event.credit_entrees || 0;
                    break;
                case 'col-total-entrees':
                    row['Total Entrées'] = (event.cash_entrees || 0) + (event.carte_entrees || 0) + (event.credit_entrees || 0);
                    break;
                case 'col-cash-recharges':
                    row['Cash Recharges'] = event.recharge_cash || 0;
                    break;
                case 'col-bc-recharges':
                    row['Crédit Recharges'] = event.recharge_credit || 0;
                    break;
                case 'col-total-recharges':
                    row['Total Recharges'] = (event.recharge_cash || 0) + (event.recharge_credit || 0);
                    break;
                case 'col-nourriture':
                    row['Nourriture'] = event.consommation_nourriture || 0;
                    break;
                case 'col-ca-ht':
                    row['CA HT'] = event.ca_ht || 0;
                    break;
                case 'col-tva':
                    row['TVA'] = event.tva || 0;
                    break;
                case 'col-ca-ttc':
                    row['CA TTC'] = event.ca_ttc || 0;
                    break;
            }
        });
        
        return row;
    });
    
    // Export Excel
    const filename = `export_comptable_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Export Comptable');
    
    XLSX.writeFile(workbook, filename);
    showMessage(`Export réalisé : ${filename} (${filteredEvents.length} événements)`, 'success');
}

// Récupération des colonnes sélectionnées
function getSelectedColumns() {
    const checkboxes = document.querySelectorAll('.column-checkbox input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => ({ id: cb.id, label: cb.parentElement.textContent.trim() }));
}

// Prévisualisation de l'export
function previewExport() {
    const columns = getSelectedColumns();
    const period = document.getElementById('export-period').value;
    
    if (columns.length === 0) {
        showMessage('Veuillez sélectionner au moins une colonne', 'error');
        return;
    }
    
    showMessage(`Prévisualisation : ${columns.length} colonnes sélectionnées pour la période "${period}"`, 'success');
}

// Exports rapides
function exportQuick(type) {
    const currentYear = new Date().getFullYear();
    
    switch(type) {
        case 'current-year':
            const yearEvents = currentEvents.filter(event => event.year === currentYear);
            if (yearEvents.length === 0) {
                showMessage(`Aucun événement pour ${currentYear}`, 'error');
                return;
            }
            exportToExcel(yearEvents, `export_${currentYear}.xlsx`, `Année ${currentYear}`);
            break;
            
        case 'all-data':
            if (currentEvents.length === 0) {
                showMessage('Aucun événement à exporter', 'error');
                return;
            }
            exportToExcel(currentEvents, 'export_toutes_donnees.xlsx', 'Toutes Données');
            break;
            
        case 'summary':
            exportSummaryReport();
            break;
    }
}

// Export de rapport de synthèse
function exportSummaryReport() {
    if (currentEvents.length === 0) {
        showMessage('Aucune donnée pour générer le rapport', 'error');
        return;
    }
    
    // Génération du rapport de synthèse par trimestre et année
    const summary = {};
    
    currentEvents.forEach(event => {
        const key = `${event.year}_${event.quarter}`;
        if (!summary[key]) {
            summary[key] = {
                'Année': event.year,
                'Trimestre': event.quarter,
                'Nb Événements': 0,
                'Total Couples': 0,
                'Total Hommes': 0,
                'Total Femmes': 0,
                'Total Cartes': 0,
                'Total Entrées': 0,
                'Total Recharges': 0,
                'Total CA': 0
            };
        }
        
        summary[key]['Nb Événements']++;
        summary[key]['Total Couples'] += event.presents_couple || 0;
        summary[key]['Total Hommes'] += event.presents_homme || 0;
        summary[key]['Total Femmes'] += event.presents_femme || 0;
        summary[key]['Total Cartes'] += event.renouvellement_carte || 0;
        summary[key]['Total Entrées'] += (event.cash_entrees || 0) + (event.carte_entrees || 0) + (event.credit_entrees || 0);
        summary[key]['Total Recharges'] += (event.recharge_cash || 0) + (event.recharge_credit || 0);
        summary[key]['Total CA'] += event.ca_ttc || 0;
    });
    
    const summaryData = Object.values(summary);
    const filename = `resume_comptable_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    const worksheet = XLSX.utils.json_to_sheet(summaryData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Résumé Comptable');
    
    XLSX.writeFile(workbook, filename);
    showMessage(`Rapport de synthèse exporté : ${filename}`, 'success');
}

// Modal - fermeture par clic sur le fond
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeEventModal();
        closeVentilationModal();
    }
});

// Gestion du modal de ventilation
function openVentilationSettings() {
    // Remplir les champs avec les valeurs actuelles
    document.getElementById('tarif-couple').value = ventilationSettings.tarifCouple;
    document.getElementById('tarif-femme').value = ventilationSettings.tarifFemme;
    document.getElementById('tarif-homme').value = ventilationSettings.tarifHomme;
    document.getElementById('prix-conso').value = ventilationSettings.prixConso;
    document.getElementById('nbr-conso-couple').value = ventilationSettings.nbrConsoCouple;
    document.getElementById('nbr-conso-femme').value = ventilationSettings.nbrConsoFemme;
    document.getElementById('nbr-conso-homme').value = ventilationSettings.nbrConsoHomme;
    
    // Mettre à jour l'aperçu
    updateVentilationPreview();
    
    // Afficher le modal
    document.getElementById('ventilation-modal').style.display = 'flex';
    
    // Ajouter des event listeners pour l'aperçu en temps réel
    const inputs = ['tarif-couple', 'tarif-femme', 'tarif-homme', 'prix-conso', 'nbr-conso-couple', 'nbr-conso-femme', 'nbr-conso-homme'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', updateVentilationPreview);
    });
}

function closeVentilationModal() {
    document.getElementById('ventilation-modal').style.display = 'none';
}

function updateVentilationPreview() {
    const tarifCouple = parseFloat(document.getElementById('tarif-couple').value) || 0;
    const tarifFemme = parseFloat(document.getElementById('tarif-femme').value) || 0;
    const tarifHomme = parseFloat(document.getElementById('tarif-homme').value) || 0;
    const prixConso = parseFloat(document.getElementById('prix-conso').value) || 0;
    const nbrConsoCouple = parseInt(document.getElementById('nbr-conso-couple').value) || 0;
    const nbrConsoFemme = parseInt(document.getElementById('nbr-conso-femme').value) || 0;
    const nbrConsoHomme = parseInt(document.getElementById('nbr-conso-homme').value) || 0;
    
    const resultCouple = tarifCouple - (prixConso * nbrConsoCouple);
    const resultFemme = tarifFemme - (prixConso * nbrConsoFemme);
    const resultHomme = tarifHomme - (prixConso * nbrConsoHomme);
    
    document.getElementById('preview-couple').textContent = `${tarifCouple}€ - (${prixConso}€ × ${nbrConsoCouple}) = ${resultCouple}€`;
    document.getElementById('preview-femme').textContent = `${tarifFemme}€ - (${prixConso}€ × ${nbrConsoFemme}) = ${resultFemme}€`;
    document.getElementById('preview-homme').textContent = `${tarifHomme}€ - (${prixConso}€ × ${nbrConsoHomme}) = ${resultHomme}€`;
}

function saveVentilationParams() {
    // Récupérer les valeurs du formulaire
    ventilationSettings.tarifCouple = parseFloat(document.getElementById('tarif-couple').value);
    ventilationSettings.tarifFemme = parseFloat(document.getElementById('tarif-femme').value);
    ventilationSettings.tarifHomme = parseFloat(document.getElementById('tarif-homme').value);
    ventilationSettings.prixConso = parseFloat(document.getElementById('prix-conso').value);
    ventilationSettings.nbrConsoCouple = parseInt(document.getElementById('nbr-conso-couple').value);
    ventilationSettings.nbrConsoFemme = parseInt(document.getElementById('nbr-conso-femme').value);
    ventilationSettings.nbrConsoHomme = parseInt(document.getElementById('nbr-conso-homme').value);
    
    // Sauvegarder dans localStorage
    saveVentilationSettings();
    
    // Fermer le modal
    closeVentilationModal();
    
    // Rafraîchir l'affichage des événements pour appliquer les nouveaux paramètres
    displayEvents();
    
    showMessage('Paramètres de ventilation sauvegardés avec succès !', 'success');
}

function resetVentilationParams() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser les paramètres aux valeurs par défaut ?')) {
        resetVentilationSettings();
        openVentilationSettings(); // Recharger les valeurs par défaut dans le modal
        showMessage('Paramètres de ventilation réinitialisés !', 'success');
    }
}

// Exposer les fonctions nécessaires au scope global pour les onclick dans le HTML
window.addEvent = addEvent;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.saveEvent = saveEvent;
window.closeEventModal = closeEventModal;
window.toggleEventView = toggleEventView;
window.handleFileImport = handleFileImport;
window.handleMultipleFileImport = handleMultipleFileImport;
window.confirmImport = confirmImport;
window.cancelImport = cancelImport;
window.exportCustom = exportCustom;
window.previewExport = previewExport;
window.exportQuick = exportQuick;
window.openVentilationModal = openVentilationSettings;
window.closeVentilationModal = closeVentilationModal;
window.saveVentilationParams = saveVentilationParams;
window.resetVentilationParams = resetVentilationParams;