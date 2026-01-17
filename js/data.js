// =================== SISTEMA DE DADOS ===================
const DataSystem = {
    // Configurações
    JSONBIN_BIN_ID: '69620ca9ae596e708fd204c5',
    JSONBIN_API_KEY: '$2a$10$gHdA8KAK/9HnnagDiMTlHeBUzNo9cWC0lR8EL0IaUpJg5ChpGiz/i',
    JSONBIN_URL: `https://api.jsonbin.io/v3/b/69620ca9ae596e708fd204c5`,
    
    // Timer para debouncing
    saveTimeout: null,
    
    // Dados iniciais
    messages: [],
    characterSheets: [],
    diceResults: [],
    notifications: [],
    initiativeOrder: [],
    combatParticipants: [],
    
    // Estado do combate
    isCombatActive: false,
    currentRound: 1,
    currentTurn: 0,
    
    // Estatísticas
    activityData: {
        hourlyActivity: new Array(24).fill(0),
        classDistribution: {},
        rollStats: {
            today: 0,
            yesterday: 0,
            criticals: 0,
            fails: 0
        },
        playerStats: {
            active: 0,
            total: 0,
            trend: 0
        }
    },

    // =================== FUNÇÕES DE CARREGAMENTO ===================
    
    // Carregar TODOS os dados do servidor
    loadAllData: async function() {
        try {
            const response = await fetch(this.JSONBIN_URL + '/latest', {
                headers: {
                    'X-Master-Key': this.JSONBIN_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const data = await response.json();
            const record = data.record || {};
            
            console.log('Dados carregados do servidor:', record);
            
            // Carregar mensagens
            this.messages = record.messages && Array.isArray(record.messages) ? record.messages : [];
            
            // Carregar fichas
            this.characterSheets = record.characterSheets && Array.isArray(record.characterSheets) ? record.characterSheets : [];
            
            // Carregar estado de combate
            if (record.combatState) {
                const combat = record.combatState;
                this.isCombatActive = combat.isCombatActive || false;
                this.currentRound = combat.currentRound || 1;
                this.currentTurn = combat.currentTurn || 0;
                this.initiativeOrder = combat.initiativeOrder || [];
                this.combatParticipants = combat.combatParticipants || [];
            }
            
            // Extrair resultados de dados
            this.diceResults = [];
            this.messages.forEach(msg => {
                if (msg.is_dice_roll && msg.dice_total) {
                    this.diceResults.push({
                        total: msg.dice_total,
                        diceType: parseInt(msg.dice_type.replace('d', '')) || 20,
                        results: msg.dice_results || [msg.dice_total],
                        modifier: msg.dice_modifier || 0,
                        rollType: msg.roll_type || 'normal',
                        isCritical: msg.is_critical || false,
                        isCriticalFail: msg.is_critical_fail || false,
                        timestamp: msg.created_at
                    });
                }
            });
            
            // Carregar notificações
            this.notifications = record.notifications && Array.isArray(record.notifications) ? record.notifications : [];
            
            // Carregar estatísticas
            if (record.activityData) {
                this.activityData = record.activityData;
            }
            
            // Salvar localmente como backup
            this.saveToLocalStorage();
            
            console.log('Dados carregados com sucesso!');
            return true;
            
        } catch (error) {
            console.error('Erro ao carregar dados do servidor:', error);
            
            // Fallback para localStorage
            return this.loadFromLocalStorage();
        }
    },

    // =================== FUNÇÕES DE SALVAMENTO ===================
    
    // Salvar dados com debouncing
    saveAllDataDebounced: function() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(async () => {
            await this.saveAllData();
        }, 2000);
    },

    // Salvar TODOS os dados no servidor
    saveAllData: async function() {
        try {
            const dataToSave = {
                messages: this.messages,
                combatState: {
                    isCombatActive: this.isCombatActive,
                    currentRound: this.currentRound,
                    currentTurn: this.currentTurn,
                    initiativeOrder: this.initiativeOrder,
                    combatParticipants: this.combatParticipants
                },
                characterSheets: this.characterSheets,
                notifications: this.notifications,
                activityData: this.activityData,
                lastUpdate: new Date().toISOString()
            };
            
            console.log('Enviando dados para servidor:', dataToSave);
            
            const response = await fetch(this.JSONBIN_URL, {
                method: 'PUT',
                headers: {
                    'X-Master-Key': this.JSONBIN_API_KEY,
                    'Content-Type': 'application/json',
                    'X-Bin-Versioning': 'false'
                },
                body: JSON.stringify(dataToSave)
            });
            
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            // Salvar localmente também
            this.saveToLocalStorage();
            
            console.log('Dados salvos com sucesso no servidor!');
            return true;
            
        } catch (error) {
            console.error('Erro ao salvar dados no servidor:', error);
            
            // Fallback para localStorage
            this.saveToLocalStorage();
            
            // Notificar usuário
            Notifications.addNotification('Erro de conexão', 'Dados salvos apenas localmente', 'warning', true);
            return false;
        }
    },

    // =================== FUNÇÕES LOCAIS ===================
    
    // Salvar no localStorage
    saveToLocalStorage: function() {
        const allData = {
            messages: this.messages,
            characterSheets: this.characterSheets,
            diceResults: this.diceResults,
            notifications: this.notifications,
            combatState: {
                isCombatActive: this.isCombatActive,
                currentRound: this.currentRound,
                currentTurn: this.currentTurn,
                initiativeOrder: this.initiativeOrder,
                combatParticipants: this.combatParticipants
            },
            activityData: this.activityData,
            lastLocalSave: new Date().toISOString()
        };
        
        Utils.saveToLocalStorage('rpg_all_data', allData);
    },

    // Carregar do localStorage
    loadFromLocalStorage: function() {
        const savedData = Utils.loadFromLocalStorage('rpg_all_data');
        
        if (savedData) {
            this.messages = savedData.messages || [];
            this.characterSheets = savedData.characterSheets || [];
            this.diceResults = savedData.diceResults || [];
            this.notifications = savedData.notifications || [];
            this.activityData = savedData.activityData || {
                hourlyActivity: new Array(24).fill(0),
                classDistribution: {},
                rollStats: { today: 0, yesterday: 0, criticals: 0, fails: 0 },
                playerStats: { active: 0, total: 0, trend: 0 }
            };
            
            if (savedData.combatState) {
                this.isCombatActive = savedData.combatState.isCombatActive || false;
                this.currentRound = savedData.combatState.currentRound || 1;
                this.currentTurn = savedData.combatState.currentTurn || 0;
                this.initiativeOrder = savedData.combatState.initiativeOrder || [];
                this.combatParticipants = savedData.combatState.combatParticipants || [];
            }
            
            Notifications.addNotification('Usando dados locais', 'Não foi possível conectar ao servidor', 'warning', true);
            return true;
        }
        
        return false;
    },

    // =================== FUNÇÕES DE CONTROLE ===================
    
    // Limpar todos os dados
    clearAllData: function() {
        if (confirm('Tem certeza que deseja limpar TODOS os dados? Isso não pode ser desfeito!')) {
            this.messages = [];
            this.characterSheets = [];
            this.diceResults = [];
            this.notifications = [];
            this.initiativeOrder = [];
            this.combatParticipants = [];
            this.isCombatActive = false;
            this.currentRound = 1;
            this.currentTurn = 0;
            this.activityData = {
                hourlyActivity: new Array(24).fill(0),
                classDistribution: {},
                rollStats: { today: 0, yesterday: 0, criticals: 0, fails: 0 },
                playerStats: { active: 0, total: 0, trend: 0 }
            };
            
            this.saveAllData();
            Notifications.addNotification('Dados limpos', 'Todos os dados foram removidos', 'warning');
        }
    },

    // Exportar dados
    exportData: function() {
        const allData = {
            messages: this.messages,
            characterSheets: this.characterSheets,
            diceResults: this.diceResults,
            notifications: this.notifications,
            combatState: {
                isCombatActive: this.isCombatActive,
                currentRound: this.currentRound,
                currentTurn: this.currentTurn,
                initiativeOrder: this.initiativeOrder,
                combatParticipants: this.combatParticipants
            },
            activityData: this.activityData,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(allData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `rpg-data-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        Notifications.addNotification('Dados exportados', 'Arquivo JSON baixado com sucesso', 'success', true);
    },

    // Importar dados
    importData: function(file) {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (!importedData.messages || !importedData.characterSheets) {
                    throw new Error('Formato de arquivo inválido');
                }
                
                if (confirm(`Importar ${importedData.messages.length} mensagens e ${importedData.characterSheets.length} fichas?`)) {
                    this.messages = importedData.messages;
                    this.characterSheets = importedData.characterSheets;
                    this.diceResults = importedData.diceResults || [];
                    this.notifications = importedData.notifications || [];
                    
                    if (importedData.combatState) {
                        this.isCombatActive = importedData.combatState.isCombatActive || false;
                        this.currentRound = importedData.combatState.currentRound || 1;
                        this.currentTurn = importedData.combatState.currentTurn || 0;
                        this.initiativeOrder = importedData.combatState.initiativeOrder || [];
                        this.combatParticipants = importedData.combatState.combatParticipants || [];
                    }
                    
                    if (importedData.activityData) {
                        this.activityData = importedData.activityData;
                    }
                    
                    await this.saveAllData();
                    Notifications.addNotification('Dados importados', 'Importação realizada com sucesso!', 'success');
                    
                    // Recarregar interface
                    location.reload();
                }
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                alert('Erro ao importar arquivo. Verifique o formato.');
            }
        };
        
        reader.readAsText(file);
    },

    // =================== FUNÇÕES DE BUSCA ===================
    
    // Buscar mensagem por ID
    findMessageById: function(id) {
        return this.messages.find(msg => msg.id === id);
    },

    // Buscar ficha por ID
    findSheetById: function(id) {
        return this.characterSheets.find(sheet => sheet.id === id);
    },

    // Buscar participantes por nome
    findParticipantByName: function(name) {
        return this.combatParticipants.find(p => p.name === name);
    },

    // =================== FUNÇÕES DE ATUALIZAÇÃO ===================
    
    // Atualizar estatísticas
    updateStats: function() {
        // Estatísticas de jogadores
        const uniquePlayers = new Set(this.messages.map(msg => msg.user_name));
        this.activityData.playerStats.active = uniquePlayers.size;
        this.activityData.playerStats.total = this.messages.filter(msg => msg.user_name).length;
        
        // Estatísticas de rolagens do dia
        const today = new Date().toDateString();
        this.activityData.rollStats.today = this.diceResults.filter(roll => {
            const rollDate = new Date(roll.timestamp).toDateString();
            return rollDate === today;
        }).length;
        
        // Estatísticas de críticos e falhas
        this.activityData.rollStats.criticals = this.diceResults.filter(roll => roll.isCritical).length;
        this.activityData.rollStats.fails = this.diceResults.filter(roll => roll.isCriticalFail).length;
        
        // Atividade por hora
        const hourlyData = new Array(24).fill(0);
        this.messages.forEach(msg => {
            const hour = new Date(msg.created_at).getHours();
            hourlyData[hour]++;
        });
        this.activityData.hourlyActivity = hourlyData;
        
        // Distribuição de classes
        const classCounts = {};
        this.messages.forEach(msg => {
            if (msg.character_class) {
                classCounts[msg.character_class] = (classCounts[msg.character_class] || 0) + 1;
            }
        });
        
        // Ordenar por quantidade
        const sortedClasses = Object.entries(classCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        this.activityData.classDistribution = Object.fromEntries(sortedClasses);
    },

    // =================== INICIALIZAÇÃO ===================
    
    init: function() {
        console.log('DataSystem inicializado');
        // Inicialização pode ser feita aqui se necessário
    }
};

// Exportar para uso global
window.DataSystem = DataSystem;
