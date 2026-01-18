// Estado global da aplicação
const AppState = {
    currentUser: 'Jogador',
    characters: [],
    journalEntries: [],
    chatMessages: [],
    diceHistory: [],
    currentSection: 'characters'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicação iniciando...');
    
    // 1. Configurar navegação
    setupNavigation();
    
    // 2. Carregar dados iniciais
    loadInitialData();
    
    // 3. Inicializar módulos
    setTimeout(() => {
        initCharacterModule();
        initJournalModule();
        initDiceModule();
        initChatModule();
    }, 500);
    
    // 4. Configurar PWA
    setupPWA();
});

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover active de todos
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar ao clicado
            this.classList.add('active');
            
            // Mostrar seção correspondente
            const sectionId = this.dataset.section;
            showSection(sectionId);
        });
    });
    
    // Ativar primeira seção por padrão
    if (navButtons.length > 0) {
        navButtons[0].click();
    }
}

function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar a seção selecionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

async function loadInitialData() {
    console.log('Carregando dados iniciais...');
    
    try {
        // Carregar personagens
        const characters = await fetchFromJSONBin('characters');
        if (characters && Array.isArray(characters)) {
            AppState.characters = characters;
            console.log('Personagens carregados:', characters.length);
        }
        
        // Carregar diário
        const journal = await fetchFromJSONBin('journal');
        if (journal && Array.isArray(journal)) {
            AppState.journalEntries = journal;
            console.log('Entradas carregadas:', journal.length);
        }
        
        // Carregar chat
        const chat = await fetchFromJSONBin('chat');
        if (chat && Array.isArray(chat)) {
            AppState.chatMessages = chat;
            console.log('Mensagens carregadas:', chat.length);
        }
        
        // Mostrar notificação
        showNotification('Dados carregados com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showNotification('Erro ao carregar dados. Usando dados locais.', 'error');
        
        // Dados de exemplo para teste
        AppState.characters = [
            {
                name: "Aragorn",
                player: "Jogador 1",
                class: "Guerreiro",
                race: "Humano",
                level: 5,
                hp: { current: 42, max: 42 },
                ac: 16,
                abilities: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 13 }
            }
        ];
        
        AppState.journalEntries = [
            {
                id: 1,
                title: "Primeira Aventura",
                content: "Hoje começamos nossa jornada na Floresta Sombria...",
                date: new Date().toISOString(),
                author: "Jogador 1"
            }
        ];
    }
}

function showNotification(message, type = 'info') {
    console.log(`Notificação [${type}]: ${message}`);
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function setupPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker registrado'))
            .catch(err => console.error('Service Worker erro:', err));
    }
}

// Exportar para uso global
window.AppState = AppState;
window.showNotification = showNotification;
