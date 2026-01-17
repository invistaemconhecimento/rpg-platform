// =================== INICIALIZAÇÃO PRINCIPAL ===================
const MainApp = {
    // =================== INICIALIZAÇÃO ===================
    
    init: async function() {
        console.log('Inicializando aplicação RPG...');
        
        try {
            // Inicializar sistemas na ordem correta
            await this.initializeSystems();
            
            // Configurar interface inicial
            this.setupInitialInterface();
            
            // Configurar event listeners globais
            this.setupGlobalEventListeners();
            
            // Mostrar mensagem de boas-vindas
            this.showWelcomeMessage();
            
            console.log('Aplicação RPG inicializada com sucesso!');
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
            Notifications.addNotification('Erro na inicialização', 'Algo deu errado ao carregar a aplicação', 'danger');
        }
    },
    
    // Inicializar sistemas
    initializeSystems: async function() {
        // 1. Carregar dados primeiro
        await DataSystem.loadAllData();
        
        // 2. Inicializar sistemas que dependem dos dados
        Utils.init?.(); // Se Utils tiver init
        Notifications.init();
        MessagesSystem.init();
        DiceSystem.init();
        InitiativeSystem.init();
        SheetsSystem.init();
        DashboardSystem.init();
        
        // 3. Atualizar estatísticas iniciais
        DataSystem.updateStats();
        DashboardSystem.updateDashboardStats();
    },
    
    // Configurar interface inicial
    setupInitialInterface: function() {
        // Selecionar dados d20 por padrão
        const d20Element = document.querySelector('.dice-type[data-dice="20"]');
        if (d20Element) {
            d20Element.classList.add('active');
        }
        
        // Focar no campo de nome do personagem
        const userNameInput = document.getElementById('userName');
        if (userNameInput) {
            setTimeout(() => {
                userNameInput.focus();
            }, 500);
        }
        
        // Verificar se há mensagens e mostrar instruções
        if (DataSystem.messages.length === 0) {
            this.showInstructions();
        }
    },
    
    // Configurar event listeners globais
    setupGlobalEventListeners: function() {
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl + S para salvar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                DataSystem.saveAllData();
                Notifications.addNotification('Dados salvos', 'Progresso salvo com sucesso', 'success', true);
            }
            
            // Ctrl + L para limpar campo de texto
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                const textInput = document.getElementById('textInput');
                if (textInput) {
                    textInput.value = '';
                    textInput.focus();
                }
            }
            
            // Esc para fechar modais
            if (e.key === 'Escape') {
                SheetsSystem.closeModal();
            }
        });
        
        // Atualizar estatísticas quando a janela ganha foco
        window.addEventListener('focus', () => {
            DashboardSystem.updateDashboardStats();
        });
        
        // Confirmar antes de fechar a página se houver dados não salvos
        window.addEventListener('beforeunload', (e) => {
            // Podemos adicionar lógica para verificar dados não salvos aqui
            // Por enquanto, apenas um placeholder
            // if (DataSystem.hasUnsavedChanges) {
            //     e.preventDefault();
            //     e.returnValue = 'Você tem alterações não salvas. Tem certeza que deseja sair?';
            // }
        });
    },
    
    // =================== FUNÇÕES AUXILIARES ===================
    
    // Mostrar mensagem de boas-vindas
    showWelcomeMessage: function() {
        Notifications.addNotification(
            'Sistema RPG Iniciado',
            'Bem-vindo à plataforma completa de RPG! Sistema de fichas, combate e estatísticas ativados.',
            'success',
            false
        );
        
        // Adicionar mensagem de boas-vindas se não houver mensagens
        if (DataSystem.messages.length === 0) {
            const welcomeMessage = {
                id: 'welcome',
                content: 'Bem-vindos à mesa de RPG! Use os dados abaixo para suas ações e veja os resultados em tempo real. Crie fichas de personagem, inicie combates e acompanhe suas estatísticas!',
                user_name: 'Mestre do Jogo',
                character_class: 'Mestre',
                character_subclass: 'Mestre das Aventuras',
                user_color: '#ffd93d',
                action_type: 'narrative',
                created_at: new Date().toISOString(),
                is_dice_roll: false
            };
            
            DataSystem.messages.push(welcomeMessage);
            MessagesSystem.updateListDisplay();
            DataSystem.saveAllDataDebounced();
        }
    },
    
    // Mostrar instruções
    showInstructions: function() {
        // Poderíamos adicionar um modal de instruções aqui
        console.log('Mostrando instruções para novos usuários');
    },
    
    // Verificar conexão com internet
    checkConnection: function() {
        if (!navigator.onLine) {
            Notifications.addNotification(
                'Sem conexão',
                'Você está offline. Os dados serão salvos localmente.',
                'warning',
                false
            );
        }
    },
    
    // =================== FUNÇÕES DE UTILIDADE ===================
    
    // Recarregar todos os dados
    reloadAllData: async function() {
        try {
            Notifications.addNotification('Recarregando', 'Atualizando dados do servidor...', 'info', true);
            await DataSystem.loadAllData();
            
            // Atualizar todos os displays
            MessagesSystem.updateListDisplay();
            DiceSystem.updateDiceHistory();
            InitiativeSystem.updateInitiativeDisplay();
            InitiativeSystem.updateCombatStatus();
            InitiativeSystem.updateTurnDisplay();
            SheetsSystem.updateSheetsDisplay();
            DashboardSystem.updateDashboardStats();
            
            Notifications.addNotification('Dados atualizados', 'Dados sincronizados com sucesso', 'success', true);
            
        } catch (error) {
            console.error('Erro ao recarregar dados:', error);
            Notifications.addNotification('Erro ao atualizar', 'Não foi possível carregar dados do servidor', 'danger', true);
        }
    },
    
    // Limpar cache local
    clearLocalCache: function() {
        if (confirm('Tem certeza que deseja limpar o cache local? Isso removerá todos os dados salvos localmente, mas não afetará o servidor.')) {
            localStorage.removeItem('rpg_all_data');
            Notifications.addNotification('Cache limpo', 'Dados locais removidos', 'warning', true);
        }
    }
};

// =================== INICIALIZAÇÃO AO CARREGAR A PÁGINA ===================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar aplicação
    MainApp.init();
    
    // Verificar conexão
    MainApp.checkConnection();
    
    // Configurar event listener para reconexão
    window.addEventListener('online', () => {
        Notifications.addNotification('Conexão restaurada', 'Sincronizando dados com o servidor...', 'success', true);
        DataSystem.saveAllDataDebounced();
    });
    
    window.addEventListener('offline', () => {
        Notifications.addNotification('Sem conexão', 'Você está offline. Trabalhando com dados locais.', 'warning', false);
    });
});

// Exportar para uso global
window.MainApp = MainApp;
