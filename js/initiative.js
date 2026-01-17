// =================== SISTEMA DE INICIATIVA E COMBATE ===================
const InitiativeSystem = {
    // =================== FUNÇÕES PRINCIPAIS ===================
    
    // Iniciar combate
    startCombat: function() {
        if (DataSystem.isCombatActive) {
            alert('O combate já está ativo!');
            return;
        }
        
        DataSystem.isCombatActive = true;
        DataSystem.currentRound = 1;
        DataSystem.currentTurn = 0;
        DataSystem.combatParticipants = [];
        
        // Coletar jogadores das mensagens
        const uniquePlayers = {};
        DataSystem.messages.forEach(msg => {
            if (msg.user_name && !uniquePlayers[msg.user_name]) {
                const initiativeMod = parseInt(document.getElementById('initiativeMod')?.value) || 0;
                uniquePlayers[msg.user_name] = {
                    name: msg.user_name,
                    color: msg.user_color || '#9d4edd',
                    class: msg.character_class || 'Aventureiro',
                    subclass: msg.character_subclass || '',
                    initiativeMod: initiativeMod,
                    hp: 100,
                    conditions: []
                };
            }
        });
        
        DataSystem.combatParticipants = Object.values(uniquePlayers);
        this.updateCombatStatus();
        this.addCombatLog('Combate iniciado!', 'system');
        
        Notifications.notifyCombatStart();
    },
    
    // Rolar iniciativa
    rollInitiative: async function() {
        if (!DataSystem.isCombatActive) {
            alert('Inicie o combate primeiro!');
            return;
        }
        
        DataSystem.initiativeOrder = [];
        
        // Adicionar jogadores
        DataSystem.combatParticipants.forEach(participant => {
            const initiativeRoll = Utils.rollDice(20) + (participant.initiativeMod || 0);
            DataSystem.initiativeOrder.push({
                ...participant,
                initiative: initiativeRoll,
                type: 'player',
                currentHP: participant.hp || 100,
                maxHP: participant.hp || 100
            });
        });
        
        // Adicionar inimigos já criados
        const enemies = DataSystem.combatParticipants.filter(p => p.type === 'enemy');
        enemies.forEach(enemy => {
            const initiativeRoll = Utils.rollDice(20) + parseInt(enemy.initiativeMod || 0);
            DataSystem.initiativeOrder.push({
                name: enemy.name,
                color: '#ff6b6b',
                class: 'Inimigo',
                initiative: initiativeRoll,
                type: 'enemy',
                currentHP: enemy.hp,
                maxHP: enemy.hp,
                conditions: []
            });
        });
        
        // Ordenar por iniciativa (maior para menor)
        DataSystem.initiativeOrder.sort((a, b) => {
            if (b.initiative === a.initiative) {
                return (b.initiativeMod || 0) - (a.initiativeMod || 0);
            }
            return b.initiative - a.initiative;
        });
        
        this.updateInitiativeDisplay();
        DataSystem.currentTurn = 0;
        this.updateTurnDisplay();
        
        this.addCombatLog('Iniciativa rolada! Ordem definida.', 'system');
        Notifications.notifyInitiativeRolled();
        
        await DataSystem.saveAllDataDebounced();
    },
    
    // Próximo turno
    nextTurn: async function() {
        if (!DataSystem.isCombatActive || DataSystem.initiativeOrder.length === 0) {
            alert('Inicie o combate e role iniciativa primeiro!');
            return;
        }
        
        DataSystem.currentTurn = (DataSystem.currentTurn + 1) % DataSystem.initiativeOrder.length;
        
        // Se voltou ao primeiro, incrementa rodada
        if (DataSystem.currentTurn === 0) {
            DataSystem.currentRound++;
            const roundNumber = document.getElementById('roundNumber');
            if (roundNumber) roundNumber.textContent = DataSystem.currentRound;
            this.addCombatLog(`Rodada ${DataSystem.currentRound} iniciada!`, 'system');
        }
        
        this.updateTurnDisplay();
        this.updateInitiativeDisplay();
        
        const currentParticipant = DataSystem.initiativeOrder[DataSystem.currentTurn];
        this.addCombatLog(`Turno de ${currentParticipant.name} (Iniciativa: ${currentParticipant.initiative})`, 'turn');
        
        await DataSystem.saveAllDataDebounced();
    },
    
    // Encerrar combate
    endCombat: async function() {
        if (!DataSystem.isCombatActive) {
            alert('Não há combate ativo!');
            return;
        }
        
        if (confirm('Tem certeza que deseja encerrar o combate?')) {
            DataSystem.isCombatActive = false;
            DataSystem.initiativeOrder = [];
            DataSystem.currentRound = 1;
            DataSystem.currentTurn = 0;
            
            this.updateInitiativeDisplay();
            this.updateCombatStatus();
            this.addCombatLog('Combate encerrado!', 'system');
            
            Notifications.addNotification('Combate encerrado', 'O combate foi finalizado', 'combat');
            
            await DataSystem.saveAllDataDebounced();
        }
    },
    
    // =================== FUNÇÕES DE DISPLAY ===================
    
    // Atualizar display da iniciativa
    updateInitiativeDisplay: function() {
        const initiativeList = document.getElementById('initiativeList');
        if (!initiativeList) return;
        
        initiativeList.innerHTML = '';
        
        if (DataSystem.initiativeOrder.length === 0) {
            initiativeList.innerHTML = `
                <div class="no-initiative">
                    <i class="fas fa-users"></i><br>
                    Nenhuma iniciativa rolada ainda.<br>
                    <small>Clique em "Rolar Iniciativa" para começar</small>
                </div>
            `;
            return;
        }
        
        DataSystem.initiativeOrder.forEach((participant, index) => {
            const isActive = index === DataSystem.currentTurn;
            const initiativeItem = document.createElement('div');
            initiativeItem.className = `initiative-item ${participant.type} ${isActive ? 'active' : ''}`;
            initiativeItem.style.borderLeftColor = participant.color;
            
            // Avatar
            const avatar = document.createElement('div');
            avatar.className = 'initiative-avatar';
            avatar.style.backgroundColor = participant.color;
            avatar.textContent = participant.name.charAt(0).toUpperCase();
            
            // Nome e informações
            const nameSpan = document.createElement('div');
            nameSpan.className = 'initiative-name';
            nameSpan.textContent = participant.name;
            
            // Iniciativa
            const initiativeSpan = document.createElement('div');
            initiativeSpan.className = 'initiative-roll';
            initiativeSpan.textContent = participant.initiative;
            
            // Controle de HP
            const hpDiv = document.createElement('div');
            hpDiv.className = 'initiative-hp';
            
            const hpInput = document.createElement('input');
            hpInput.type = 'number';
            hpInput.className = 'hp-input';
            hpInput.value = participant.currentHP;
            hpInput.min = 0;
            hpInput.max = participant.maxHP;
            
            hpInput.addEventListener('change', (e) => {
                participant.currentHP = parseInt(e.target.value);
                this.updateHPColor(hpInput, participant.currentHP, participant.maxHP);
                DataSystem.saveAllDataDebounced();
            });
            
            const hpSpan = document.createElement('span');
            hpSpan.textContent = `/${participant.maxHP}`;
            hpSpan.style.color = '#8a8ac4';
            hpSpan.style.fontSize = '0.9rem';
            
            hpDiv.appendChild(hpInput);
            hpDiv.appendChild(hpSpan);
            
            this.updateHPColor(hpInput, participant.currentHP, participant.maxHP);
            
            // Condições
            const conditionsDiv = document.createElement('div');
            conditionsDiv.className = 'conditions';
            
            const conditionsList = ['🤕', '🔥', '❄️', '⚡', '☠️', '😴', '🌀'];
            conditionsList.forEach(condition => {
                const conditionTag = document.createElement('span');
                conditionTag.className = 'condition-tag';
                conditionTag.textContent = condition;
                conditionTag.title = 'Clique para adicionar/remover condição';
                
                conditionTag.addEventListener('click', () => {
                    const hasCondition = participant.conditions.includes(condition);
                    if (hasCondition) {
                        participant.conditions = participant.conditions.filter(c => c !== condition);
                        conditionTag.style.opacity = '0.5';
                    } else {
                        participant.conditions.push(condition);
                        conditionTag.style.opacity = '1';
                    }
                    DataSystem.saveAllDataDebounced();
                });
                
                if (participant.conditions.includes(condition)) {
                    conditionTag.style.opacity = '1';
                } else {
                    conditionTag.style.opacity = '0.5';
                }
                
                conditionsDiv.appendChild(conditionTag);
            });
            
            initiativeItem.appendChild(avatar);
            initiativeItem.appendChild(nameSpan);
            initiativeItem.appendChild(initiativeSpan);
            initiativeItem.appendChild(hpDiv);
            initiativeItem.appendChild(conditionsDiv);
            
            initiativeList.appendChild(initiativeItem);
        });
    },
    
    // Atualizar cor do HP
    updateHPColor: function(inputElement, currentHP, maxHP) {
        const percentage = (currentHP / maxHP) * 100;
        
        if (percentage <= 25) {
            inputElement.style.backgroundColor = 'rgba(255, 107, 107, 0.8)';
            inputElement.style.color = 'white';
            inputElement.style.borderColor = '#ff6b6b';
        } else if (percentage <= 50) {
            inputElement.style.backgroundColor = 'rgba(255, 217, 61, 0.8)';
            inputElement.style.color = '#000';
            inputElement.style.borderColor = '#ffd93d';
        } else {
            inputElement.style.backgroundColor = 'rgba(20, 20, 35, 0.8)';
            inputElement.style.color = '#e0e0ff';
            inputElement.style.borderColor = '#533483';
        }
    },
    
    // Atualizar display do turno
    updateTurnDisplay: function() {
        const turnNumber = document.getElementById('turnNumber');
        if (turnNumber) {
            turnNumber.textContent = DataSystem.currentTurn + 1;
        }
    },
    
    // Atualizar status do combate
    updateCombatStatus: function() {
        const combatStatus = document.getElementById('combatStatus');
        if (!combatStatus) return;
        
        if (DataSystem.isCombatActive) {
            combatStatus.textContent = `Combate - Rodada ${DataSystem.currentRound}`;
            combatStatus.style.color = '#ff9a00';
        } else {
            combatStatus.textContent = 'Fora de Combate';
            combatStatus.style.color = '#8a8ac4';
        }
    },
    
    // Adicionar log de combate
    addCombatLog: function(message, type = 'info') {
        const combatLog = document.getElementById('combatLog');
        if (!combatLog) return;
        
        const now = new Date();
        const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}]`;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        let icon = 'ℹ️';
        if (type === 'system') icon = '⚙️';
        if (type === 'turn') icon = '🔄';
        if (type === 'damage') icon = '💥';
        if (type === 'heal') icon = '💚';
        
        logEntry.innerHTML = `
            <span class="log-time">${timeString}</span>
            ${icon} ${message}
        `;
        
        combatLog.insertBefore(logEntry, combatLog.firstChild);
        
        // Limitar a 50 entradas
        while (combatLog.children.length > 50) {
            combatLog.removeChild(combatLog.lastChild);
        }
        
        // Auto-scroll para o topo
        combatLog.scrollTop = 0;
    },
    
    // =================== FUNÇÕES DE INIMIGOS ===================
    
    // Adicionar inimigo
    addEnemy: async function() {
        if (!DataSystem.isCombatActive) {
            alert('Inicie o combate primeiro!');
            return;
        }
        
        const enemyName = document.getElementById('enemyName')?.value.trim() || 
                         `Inimigo ${DataSystem.combatParticipants.filter(p => p.type === 'enemy').length + 1}`;
        const enemyHP = parseInt(document.getElementById('enemyHP')?.value) || 10;
        const enemyInitiativeMod = parseInt(document.getElementById('enemyInitiativeMod')?.value) || 0;
        
        const enemy = {
            name: enemyName,
            color: '#ff6b6b',
            class: 'Inimigo',
            initiative: 0,
            type: 'enemy',
            currentHP: enemyHP,
            maxHP: enemyHP,
            conditions: [],
            initiativeMod: enemyInitiativeMod,
            hp: enemyHP
        };
        
        // Adicionar à lista de participantes
        DataSystem.combatParticipants.push(enemy);
        
        // Limpar campos
        const enemyNameInput = document.getElementById('enemyName');
        const enemyHPInput = document.getElementById('enemyHP');
        const enemyInitiativeModInput = document.getElementById('enemyInitiativeMod');
        
        if (enemyNameInput) enemyNameInput.value = '';
        if (enemyHPInput) enemyHPInput.value = '10';
        if (enemyInitiativeModInput) enemyInitiativeModInput.value = '0';
        
        this.addCombatLog(`Inimigo "${enemyName}" adicionado (${enemyHP} PV)`, 'system');
        
        // Atualizar imediatamente a exibição de iniciativa se já tiver sido rolada
        if (DataSystem.initiativeOrder.length > 0) {
            const initiativeRoll = Utils.rollDice(20) + enemyInitiativeMod;
            DataSystem.initiativeOrder.push({
                ...enemy,
                initiative: initiativeRoll
            });
            
            // Reordenar
            DataSystem.initiativeOrder.sort((a, b) => b.initiative - a.initiative);
            this.updateInitiativeDisplay();
            this.addCombatLog(`Iniciativa de ${enemyName}: ${initiativeRoll}`, 'system');
        }
        
        Notifications.addNotification('Inimigo adicionado', `${enemyName} foi adicionado ao combate`, 'combat', true);
        await DataSystem.saveAllDataDebounced();
    },
    
    // =================== INICIALIZAÇÃO ===================
    
    init: function() {
        console.log('InitiativeSystem inicializado');
        
        // Carregar estado do combate
        this.updateCombatStatus();
        this.updateTurnDisplay();
        this.updateInitiativeDisplay();
        
        // Configurar event listeners
        this.setupEventListeners();
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Botões de controle de combate
        const startCombatButton = document.getElementById('startCombatButton');
        if (startCombatButton) {
            startCombatButton.addEventListener('click', () => {
                this.startCombat();
            });
        }
        
        const rollInitiativeButton = document.getElementById('rollInitiativeButton');
        if (rollInitiativeButton) {
            rollInitiativeButton.addEventListener('click', () => {
                this.rollInitiative();
            });
        }
        
        const nextTurnButton = document.getElementById('nextTurnButton');
        if (nextTurnButton) {
            nextTurnButton.addEventListener('click', () => {
                this.nextTurn();
            });
        }
        
        const endCombatButton = document.getElementById('endCombatButton');
        if (endCombatButton) {
            endCombatButton.addEventListener('click', () => {
                this.endCombat();
            });
        }
        
        // Botão de atualizar iniciativa
        const refreshInitiativeButton = document.getElementById('refreshInitiativeButton');
        if (refreshInitiativeButton) {
            refreshInitiativeButton.addEventListener('click', async () => {
                refreshInitiativeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                await DataSystem.loadAllData();
                this.updateInitiativeDisplay();
                this.updateCombatStatus();
                setTimeout(() => {
                    refreshInitiativeButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
                }, 500);
            });
        }
        
        // Botão de adicionar rodada
        const addRoundButton = document.getElementById('addRoundButton');
        if (addRoundButton) {
            addRoundButton.addEventListener('click', () => {
                DataSystem.currentRound++;
                const roundNumber = document.getElementById('roundNumber');
                if (roundNumber) roundNumber.textContent = DataSystem.currentRound;
                this.addCombatLog(`Rodada ${DataSystem.currentRound} iniciada manualmente`, 'system');
                DataSystem.saveAllDataDebounced();
            });
        }
        
        // Botão de adicionar inimigo
        const addEnemyButton = document.getElementById('addEnemyButton');
        if (addEnemyButton) {
            addEnemyButton.addEventListener('click', () => {
                this.addEnemy();
            });
        }
    }
};

// Exportar para uso global
window.InitiativeSystem = InitiativeSystem;
