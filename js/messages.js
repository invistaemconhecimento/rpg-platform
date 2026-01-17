// =================== SISTEMA DE MENSAGENS/DIÁRIO ===================
const MessagesSystem = {
    // =================== FUNÇÕES PRINCIPAIS ===================
    
    // Adicionar nova mensagem
    addMessage: async function() {
        const textInput = document.getElementById('textInput');
        const userNameInput = document.getElementById('userName');
        const characterClassInput = document.getElementById('characterClass');
        const characterSubclassInput = document.getElementById('characterSubclass');
        const actionTypeInput = document.getElementById('actionType');
        const addButton = document.getElementById('addButton');
        
        if (!textInput || !userNameInput || !addButton) return false;
        
        const text = textInput.value.trim();
        const userName = userNameInput.value.trim() || 'Aventureiro';
        const charClass = characterClassInput?.value || '';
        const charSubclass = characterSubclassInput?.value || '';
        const actionType = actionTypeInput?.value || '';
        
        if (text === '') {
            alert('Por favor, descreva sua ação antes de enviar.');
            textInput.focus();
            return false;
        }
        
        // Desabilitar botão durante processamento
        addButton.disabled = true;
        addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        
        const newMessage = {
            id: Utils.generateId(),
            content: text,
            user_name: userName,
            character_class: charClass,
            character_subclass: charSubclass,
            user_color: this.getUserColor(),
            action_type: actionType,
            created_at: new Date().toISOString(),
            is_dice_roll: false
        };
        
        DataSystem.messages.push(newMessage);
        this.updateListDisplay();
        
        await DataSystem.saveAllDataDebounced();
        
        // Reabilitar botão e limpar campo
        addButton.disabled = false;
        addButton.innerHTML = '<i class="fas fa-feather-alt"></i> Registrar Ação';
        textInput.value = '';
        textInput.focus();
        
        // Notificação
        Notifications.notifyActionRegistered(userName);
        
        return true;
    },
    
    // Atualizar exibição da lista
    updateListDisplay: function() {
        const textList = document.getElementById('textList');
        const itemCount = document.getElementById('itemCount');
        
        if (!textList) return;
        
        textList.innerHTML = '';
        
        const count = DataSystem.messages.length;
        if (itemCount) itemCount.textContent = `${count} ${count === 1 ? 'registro' : 'registros'}`;
        
        if (DataSystem.messages.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-list-message';
            emptyMessage.innerHTML = '<i class="fas fa-dragon"></i><br>A aventura ainda não começou! Role o primeiro dado para começar sua jornada.';
            textList.appendChild(emptyMessage);
            return;
        }
        
        const sortedMessages = [...DataSystem.messages].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
        
        sortedMessages.forEach((message) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-item';
            listItem.style.borderLeftColor = message.user_color || '#9d4edd';
            
            // Cabeçalho
            const itemHeader = document.createElement('div');
            itemHeader.className = 'list-item-header';
            
            const userInfo = document.createElement('div');
            userInfo.className = 'user-info';
            
            const userAvatar = document.createElement('div');
            userAvatar.className = 'user-avatar';
            userAvatar.style.backgroundColor = message.user_color || '#9d4edd';
            userAvatar.textContent = message.user_name ? message.user_name.charAt(0).toUpperCase() : 'A';
            
            const userName = document.createElement('div');
            userName.className = 'user-name';
            userName.style.color = message.user_color || '#9d4edd';
            
            let nameText = message.user_name || 'Aventureiro';
            if (message.character_class) {
                nameText += ` (${message.character_class}`;
                if (message.character_subclass) {
                    nameText += ` - ${message.character_subclass}`;
                }
                nameText += `)`;
            }
            userName.textContent = nameText;
            
            const messageTime = document.createElement('div');
            messageTime.className = 'message-time';
            messageTime.textContent = Utils.formatDateTime(message.created_at);
            
            userInfo.appendChild(userAvatar);
            userInfo.appendChild(userName);
            
            itemHeader.appendChild(userInfo);
            itemHeader.appendChild(messageTime);
            
            // Tags de ação
            let actionTag = '';
            if (message.action_type) {
                const tagMap = {
                    'attack': '⚔️ Ataque',
                    'magic': '✨ Magia',
                    'skill': '🎯 Habilidade',
                    'dialog': '💬 Diálogo',
                    'narrative': '📖 Narrativa',
                    'other': '🔧 Outro'
                };
                
                if (tagMap[message.action_type]) {
                    actionTag = `<span class="rpg-tag ${message.action_type}">${tagMap[message.action_type]}</span>`;
                }
            }
            
            // Conteúdo da mensagem
            const itemContent = document.createElement('div');
            itemContent.className = 'list-item-content';
            
            if (message.is_dice_roll) {
                let diceHtml = `
                    <div style="margin-bottom: 10px;">
                        ${actionTag}
                        <strong>🎲 Rolou ${message.dice_count || 1}${message.dice_type}:</strong> ${message.content}
                    </div>
                `;
                
                if (message.dice_results) {
                    const results = message.dice_results;
                    const total = message.dice_total;
                    const modifier = message.dice_modifier || 0;
                    
                    let resultClass = 'dice-result';
                    if (message.is_critical) resultClass += ' critical-hit';
                    if (message.is_critical_fail) resultClass += ' critical-fail';
                    
                    let resultText = `Resultado: <strong>${total}</strong>`;
                    if (results.length > 1 || modifier !== 0) {
                        resultText = `[${results.join(', ')}]`;
                        if (modifier > 0) {
                            resultText += ` + ${modifier} = <strong>${total}</strong>`;
                        } else if (modifier < 0) {
                            resultText += ` ${modifier} = <strong>${total}</strong>`;
                        } else {
                            resultText += ` = <strong>${total}</strong>`;
                        }
                    }
                    
                    if (message.roll_type === 'advantage') {
                        resultText += ' (Vantagem)';
                    } else if (message.roll_type === 'disadvantage') {
                        resultText += ' (Desvantagem)';
                    }
                    
                    if (message.is_critical) resultText += ' 🎉 CRÍTICO!';
                    if (message.is_critical_fail) resultText += ' 💀 FALHA CRÍTICA!';
                    
                    diceHtml += `<div class="${resultClass}">${resultText}</div>`;
                }
                
                itemContent.innerHTML = diceHtml;
            } else {
                itemContent.innerHTML = `
                    ${actionTag}
                    ${message.content}
                `;
            }
            
            // Botões de ação
            const itemActions = document.createElement('div');
            itemActions.className = 'list-item-actions';
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i> Excluir';
            deleteButton.addEventListener('click', () => {
                this.deleteMessage(message.id);
            });
            
            itemActions.appendChild(deleteButton);
            
            // Montar item
            listItem.appendChild(itemHeader);
            listItem.appendChild(itemContent);
            listItem.appendChild(itemActions);
            
            textList.appendChild(listItem);
        });
    },
    
    // =================== FUNÇÕES AUXILIARES ===================
    
    // Obter cor do usuário
    getUserColor: function() {
        const selectedColor = document.querySelector('.user-color-picker .color-option.selected');
        return selectedColor ? selectedColor.getAttribute('data-color') : '#9d4edd';
    },
    
    // Excluir mensagem
    deleteMessage: async function(messageId) {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;
        
        DataSystem.messages = DataSystem.messages.filter(msg => msg.id !== messageId);
        this.updateListDisplay();
        await DataSystem.saveAllDataDebounced();
        
        Notifications.addNotification('Registro excluído', 'Ação foi removida do histórico', 'warning', true);
    },
    
    // Excluir todas as mensagens
    deleteAllMessages: async function() {
        if (DataSystem.messages.length === 0) {
            alert('Não há registros para excluir.');
            return;
        }
        
        if (!confirm(`Tem certeza que deseja excluir TODOS os ${DataSystem.messages.length} registros da campanha?`)) return;
        
        DataSystem.messages = [];
        DataSystem.diceResults = [];
        
        this.updateListDisplay();
        DiceSystem.updateDiceHistory();
        await DataSystem.saveAllDataDebounced();
        
        alert('Campanha reiniciada!');
        Notifications.addNotification('Campanha reiniciada', 'Todos os registros foram excluídos', 'warning');
    },
    
    // Atualizar subclasses
    updateSubclasses: function() {
        const characterClassInput = document.getElementById('characterClass');
        const characterSubclassInput = document.getElementById('characterSubclass');
        
        if (!characterClassInput || !characterSubclassInput) return;
        
        const selectedClass = characterClassInput.value;
        
        characterSubclassInput.innerHTML = '<option value="">Selecione uma subclasse...</option>';
        
        if (selectedClass && subclasses[selectedClass]) {
            subclasses[selectedClass].forEach(subclass => {
                const option = document.createElement('option');
                option.value = subclass;
                option.textContent = subclass;
                characterSubclassInput.appendChild(option);
            });
        }
    },
    
    // =================== INICIALIZAÇÃO ===================
    
    init: function() {
        console.log('MessagesSystem inicializado');
        
        // Atualizar display
        this.updateListDisplay();
        
        // Configurar event listeners
        this.setupEventListeners();
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Botão de adicionar mensagem
        const addButton = document.getElementById('addButton');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.addMessage();
            });
        }
        
        // Botão de limpar entrada
        const clearInputButton = document.getElementById('clearInputButton');
        if (clearInputButton) {
            clearInputButton.addEventListener('click', () => {
                const textInput = document.getElementById('textInput');
                if (textInput) {
                    textInput.value = '';
                    textInput.focus();
                }
            });
        }
        
        // Botão de limpar tudo
        const clearAllButton = document.getElementById('clearAllButton');
        if (clearAllButton) {
            clearAllButton.addEventListener('click', () => {
                this.deleteAllMessages();
            });
        }
        
        // Botão de atualizar
        const refreshButton = document.getElementById('refreshButton');
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                await DataSystem.loadAllData();
                this.updateListDisplay();
                setTimeout(() => {
                    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
                }, 500);
            });
        }
        
        // Atalho de teclado (Ctrl + Enter no campo de texto)
        const textInput = document.getElementById('textInput');
        if (textInput) {
            textInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.addMessage();
                }
            });
        }
        
        // Atualizar subclasses quando classe mudar
        const characterClassInput = document.getElementById('characterClass');
        if (characterClassInput) {
            characterClassInput.addEventListener('change', () => {
                this.updateSubclasses();
            });
        }
        
        // Selecionar cor do usuário
        document.querySelectorAll('.user-color-picker .color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.user-color-picker .color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
        });
    }
};

// Exportar para uso global
window.MessagesSystem = MessagesSystem;

// Subclasses definidas globalmente para acesso
const subclasses = {
    'Bárbaro': ['Caminho do Berserker', 'Caminho do Guerreiro Totêmico', 'Caminho do Céu Tempestuoso', 'Caminho da Fera', 'Caminho do Guardião Ancestral', 'Caminho da Fúria Selvagem', 'Caminho do Zelo'],
    'Bardo': ['Colégio do Conhecimento', 'Colégio do Valor', 'Colégio da Espada', 'Colégio dos Sussurros', 'Colégio da Eloquência', 'Colégio da Criação'],
    'Clérigo': ['Domínio da Vida', 'Domínio da Luz', 'Domínio da Guerra', 'Domínio da Tempestade', 'Domínio do Conhecimento', 'Domínio do Engano', 'Domínio da Natureza', 'Domínio da Forja', 'Domínio da Ordem', 'Domínio da Tumba', 'Domínio da Morte', 'Domínio da Paz', 'Domínio da Unidade'],
    'Druida': ['Círculo da Terra', 'Círculo da Lua', 'Círculo dos Sonhos', 'Círculo dos Pastores', 'Círculo das Esporas', 'Círculo das Estrelas', 'Círculo das Marés (UA opcional)'],
    'Guerreiro': ['Arqueiro Arcano', 'Campeão', 'Cavaleiro Arcano', 'Cavaleiro das Runas', 'Bruto (UA)', 'Cavaleiro da Cavalaria', 'Cavaleiro dos Púlpitos', 'Samurai', 'Mestre de Batalha', 'Psi-Guerreiro', 'Éldritch Knight (Cavaleiro Arcano)'],
    'Monge': ['Caminho da Mão Aberta', 'Caminho da Sombra', 'Caminho dos Quatro Elementos', 'Caminho da Longa Morte', 'Caminho do Sol Nascente', 'Caminho do Kensei', 'Caminho da Alma Astral', 'Caminho da Misericórdia', 'Caminho do Dragão Ascendente'],
    'Paladino': ['Juramento da Devoção', 'Juramento da Vingança', 'Juramento dos Antigos', 'Juramento da Coroa', 'Juramento da Conquista', 'Juramento da Redenção', 'Juramento dos Observadores', 'Juramento da Glória', 'Juramento da Praga (UA)'],
    'Patrulheiro': ['Caçador', 'Mestre das Bestas', 'Matador de Monstros', 'Andarilho do Horizonte', 'Andarilho da Tempestade', 'Guerreiro Feral', 'Caçador das Sombras', 'Explorador Feérico', 'Viajante do Gelo (UA)'],
    'Ladino': ['Ladrão', 'Assassino', 'Trapaceiro Arcano', 'Inquisitivo', 'Cicatriz do Infortúnio', 'Fantasma', 'Espadachim', 'Arqueiro Mental'],
    'Feiticeiro': ['Linagem Dracônica', 'Feitiçaria Selvagem', 'Alma Divina', 'Magia das Sombras', 'Tempestade', 'Psíquico Aberto', 'Metamágico Escarlate (UA)'],
    'Bruxo': ['O Grande Antigo', 'O Arquidemônio', 'O Lâmina Amaldiçoada (Hexblade)', 'A Fera', 'A Luz Celestial', 'O Genie (Gênio)', 'O Segredo Profundo', 'O Iniciador da Minda', 'A Duquesa do Caos (UA)'],
    'Mago': ['Evocação', 'Abjuração', 'Advinhação', 'Conjuração', 'Encantamento', 'Ilusão', 'Necromancia', 'Transmutação', 'Ordem das Sagradas Chamas (UA)', 'Sublime Geomancia (UA)', 'Cronurgia', 'Graviturgia', 'Bladesinger (Cantor da Lâmina)'],
    'Artífice': ['Alquimista', 'Artilheiro', 'Ferreiro de Batalha']
};
