// Configuração do JSONBin.io
const JSONBIN_CONFIG = {
    BIN_ID: 'seu-bin-id-aqui', // Substitua pelo seu bin ID
    API_KEY: 'sua-api-key-aqui', // Substitua pela sua API key
    BASE_URL: 'https://api.jsonbin.io/v3/b'
};

// Estado da aplicação
const AppState = {
    currentUser: null,
    characters: [],
    journalEntries: [],
    chatMessages: [],
    diceHistory: [],
    currentSection: 'characters'
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Configurar navegação
    setupNavigation();
    
    // Carregar dados iniciais
    loadInitialData();
    
    // Configurar service worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker registrado'))
            .catch(err => console.error('Erro no Service Worker:', err));
    }
    
    // Configurar notificações
    requestNotificationPermission();
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Mostrar a seção correspondente
            const sectionId = this.dataset.section;
            showSection(sectionId);
            
            // Atualizar estado
            AppState.currentSection = sectionId;
            
            // Salvar preferência no localStorage
            localStorage.setItem('lastSection', sectionId);
        });
    });
    
    // Restaurar última seção visitada
    const lastSection = localStorage.getItem('lastSection');
    if (lastSection) {
        const lastButton = document.querySelector(`[data-section="${lastSection}"]`);
        if (lastButton) {
            lastButton.click();
        }
    }
}

function showSection(sectionId) {
    // Esconder todas as seções
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar a seção selecionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

async function loadInitialData() {
    try {
        // Carregar dados do JSONBin.io
        const [charactersData, journalData] = await Promise.all([
            fetchFromJSONBin('characters'),
            fetchFromJSONBin('journal')
        ]);
        
        if (charactersData) AppState.characters = charactersData;
        if (journalData) AppState.journalEntries = journalData;
        
        // Atualizar interface
        updateCharacterList();
        updateJournalEntries();
        
        // Inicializar módulos
        initCharacterModule();
        initJournalModule();
        initDiceModule();
        initChatModule();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
}

// Funções auxiliares para JSONBin.io
async function fetchFromJSONBin(endpoint) {
    try {
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Erro na requisição');
        
        const data = await response.json();
        return data.record[endpoint] || [];
    } catch (error) {
        console.error(`Erro ao buscar ${endpoint}:`, error);
        return [];
    }
}

async function saveToJSONBin(endpoint, data) {
    try {
        // Primeiro, buscar os dados atuais
        const currentData = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        const fullData = await currentData.json();
        const record = fullData.record || {};
        
        // Atualizar apenas o endpoint especificado
        record[endpoint] = data;
        
        // Salvar de volta
        const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });
        
        if (!response.ok) throw new Error('Erro ao salvar');
        
        console.log(`${endpoint} salvo com sucesso`);
        return true;
    } catch (error) {
        console.error(`Erro ao salvar ${endpoint}:`, error);
        return false;
    }
}

// Funções de notificação
function showNotification(message, type = 'info') {
    // Verificar se as notificações são suportadas
    if (!("Notification" in window)) {
        console.log("Este navegador não suporta notificações.");
        return;
    }
    
    // Se for uma notificação push
    if (type === 'push' && Notification.permission === "granted") {
        new Notification("Plataforma D&D", {
            body: message,
            icon: 'icons/icon-192x192.png'
        });
    } else {
        // Notificação na interface
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}

// Exportar funções para uso em outros módulos
window.AppState = AppState;
window.showNotification = showNotification;
window.fetchFromJSONBin = fetchFromJSONBin;
window.saveToJSONBin = saveToJSONBin;
