// =================== SISTEMA DE DADOS ===================
const DiceSystem = {
    // Configurações
    selectedDice: 20,
    diceHistory: [],
    
    // Elementos DOM (serão inicializados no init)
    elements: {
        diceDisplay: null,
        diceResultText: null,
        rollDiceButton: null,
        diceQuantity: null,
        modifier: null,
        rollType: null,
        diceHistoryElement: null
    },
    
    // =================== INICIALIZAÇÃO ===================
    
    init: function() {
        console.log('DiceSystem inicializado');
        
        // Configurar som padrão (ativado)
        if (localStorage.getItem('rpg_sound_enabled') === null) {
            localStorage.setItem('rpg_sound_enabled', 'true');
        }
        
        // Inicializar elementos DOM
        this.elements = {
            diceDisplay: document.getElementById('diceDisplay'),
            diceResultText: document.getElementById('diceResultText'),
            rollDiceButton: document.getElementById('rollDiceButton'),
            diceQuantity: document.getElementById('diceQuantity'),
            modifier: document.getElementById('modifier'),
            rollType: document.getElementById('rollType'),
            diceHistoryElement: document.getElementById('diceHistory')
        };
        
        // Carregar histórico de dados
        this.diceHistory = DataSystem.diceResults || [];
        this.updateDiceHistory();
        
        // Configurar dados padrão (d20)
        this.selectDiceType(20);
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Configurar animação de brilho
        this.setupDiceGlow();
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Botão de rolar dados
        if (this.elements.rollDiceButton) {
            this.elements.rollDiceButton.addEventListener('click', () => {
                this.rollDiceWithOptions();
            });
        }
        
        // Botão de D20 rápido
        const quickD20Button = document.getElementById('quickD20Button');
        if (quickD20Button) {
            quickD20Button.addEventListener('click', () => {
                this.rollQuickD20();
            });
        }
        
        // Tipos de dados
        document.querySelectorAll('.dice-type').forEach(dice => {
            dice.addEventListener('click', () => {
                const diceType = parseInt(dice.getAttribute('data-dice'));
                this.selectDiceType(diceType);
            });
        });
        
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl + D para rolar d20 rápido
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.rollQuickD20();
            }
            
            // Ctrl + R para rolar dados com opções atuais
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.rollDiceWithOptions();
            }
            
            // Números 1-7 para selecionar tipos de dados
            if (!e.ctrlKey && !e.altKey) {
                const diceMap = {
                    '1': 4,  // d4
                    '2': 6,  // d6
                    '3': 8,  // d8
                    '4': 10, // d10
                    '5': 12, // d12
                    '6': 20, // d20
                    '7': 100 // d100
                };
                
                if (diceMap[e.key]) {
                    e.preventDefault();
                    this.selectDiceType(diceMap[e.key]);
                }
            }
        });
        
        // Atualizar display quando opções mudarem
        if (this.elements.diceQuantity) {
            this.elements.diceQuantity.addEventListener('change', () => {
                this.updateDiceDisplayPreview();
            });
        }
        
        if (this.elements.modifier) {
            this.elements.modifier.addEventListener('change', () => {
                this.updateDiceDisplayPreview();
            });
        }
        
        // Botão de estatísticas (se não existir, criar)
        if (!document.getElementById('diceStatsButton')) {
            const statsButton = document.createElement('button');
            statsButton.id = 'diceStatsButton';
            statsButton.className = 'btn-secondary btn-small';
            statsButton.innerHTML = '<i class="fas fa-chart-bar"></i> Estatísticas';
            statsButton.style.marginTop = '10px';
            statsButton.style.width = '100%';
            
            statsButton.addEventListener('click', () => {
                this.showStatistics();
            });
            
            // Adicionar ao container de controles de dados
            const diceControls = document.querySelector('.dice-controls');
            if (diceControls) {
                diceControls.appendChild(statsButton);
            }
        }
        
        // Botão de reset (opcional)
        if (!document.getElementById('resetDiceButton')) {
            const resetButton = document.createElement('button');
            resetButton.id = 'resetDiceButton';
            resetButton.className = 'btn-secondary btn-small';
            resetButton.innerHTML = '<i class="fas fa-redo"></i> Resetar';
            resetButton.style.marginTop = '5px';
            resetButton.style.width = '100%';
            
            resetButton.addEventListener('click', () => {
                this.resetToDefaults();
            });
            
            const diceOptions = document.querySelector('.dice-options');
            if (diceOptions) {
                diceOptions.appendChild(resetButton);
            }
        }
    },
    
    // Configurar animação de brilho no dado
    setupDiceGlow: function() {
        if (this.elements.diceDisplay) {
            // Adicionar efeito de brilho intermitente
            setInterval(() => {
                if (!this.elements.diceDisplay.classList.contains('dice-rolling')) {
                    this.elements.diceDisplay.style.boxShadow = 
                        '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(157, 78, 221, 0.3)';
                    
                    setTimeout(() => {
                        if (this.elements.diceDisplay && !this.elements.diceDisplay.classList.contains('dice-rolling')) {
                            this.elements.diceDisplay.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
                        }
                    }, 500);
                }
            }, 3000);
        }
    },
    
    // =================== FUNÇÕES PRINCIPAIS ===================
    
    // Rolar dados com todas as opções
    rollDiceWithOptions: async function() {
        const userName = document.getElementById('userName')?.value.trim() || 'Aventureiro';
        const charClass = document.getElementById('characterClass')?.value || '';
        const charSubclass = document.getElementById('characterSubclass')?.value || '';
        const actionType = document.getElementById('actionType')?.value || '';
        const diceCount = parseInt(this.elements.diceQuantity?.value) || 1;
        const mod = parseInt(this.elements.modifier?.value) || 0;
        const rType = this.elements.rollType?.value || 'normal';
        const textInput = document.getElementById('textInput')?.value.trim() || '';
        
        // Validar entrada
        if (!this.validateInputs(diceCount, mod)) {
            return;
        }
        
        // Desabilitar botão durante rolagem
        if (this.elements.rollDiceButton) {
            this.elements.rollDiceButton.disabled = true;
            this.elements.rollDiceButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rolando...';
        }
        
        // Animação de rolagem
        if (this.elements.diceDisplay) {
            this.elements.diceDisplay.classList.add('dice-rolling');
            this.elements.diceDisplay.textContent = '...';
        }
        
        if (this.elements.diceResultText) {
            this.elements.diceResultText.textContent = 'Rolando dados...';
            this.elements.diceResultText.style.color = '#ffd93d';
        }
        
        // Simular tempo de rolagem (mais longo para mais dados)
        const rollTime = 300 + (diceCount * 50);
        await new Promise(resolve => setTimeout(resolve, Math.min(rollTime, 1500)));
        
        // Realizar rolagem
        let results = [];
        let total = 0;
        let isCritical = false;
        let isCriticalFail = false;
        let naturalRoll = 0;
        
        // Lógica de rolagem baseada no tipo
        if (this.selectedDice !== 20 || rType === 'normal') {
            // Rolagem normal para qualquer dado
            for (let i = 0; i < diceCount; i++) {
                const result = Utils.rollDice(this.selectedDice);
                results.push(result);
                total += result;
            }
            naturalRoll = results[0] || 0;
        } else if (this.selectedDice === 20 && (rType === 'advantage' || rType === 'disadvantage')) {
            // Vantagem/Desvantagem apenas para d20
            const roll1 = Utils.rollDice(20);
            const roll2 = Utils.rollDice(20);
            
            if (rType === 'advantage') {
                total = Math.max(roll1, roll2);
                results = [roll1, roll2];
                naturalRoll = total;
            } else {
                total = Math.min(roll1, roll2);
                results = [roll1, roll2];
                naturalRoll = total;
            }
        }
        
        // Aplicar modificador
        total += mod;
        
        // Verificar críticos (apenas para d20)
        if (this.selectedDice === 20) {
            const naturalResult = rType === 'normal' ? naturalRoll : results[0];
            if (naturalResult === 20) isCritical = true;
            if (naturalResult === 1) isCriticalFail = true;
        }
        
        // Verificar críticos especiais para outros dados
        if (this.selectedDice !== 20) {
            // Para d4, d6, d8, d10, d12: crítico no valor máximo
            if (results.some(result => result === this.selectedDice)) {
                if (this.selectedDice <= 12) {
                    isCritical = true;
                }
            }
            
            // Falha crítica no valor mínimo
            if (results.some(result => result === 1)) {
                isCriticalFail = true;
            }
        }
        
        // Atualizar display
        this.updateDiceDisplay(total, isCritical, isCriticalFail);
        
        // Gerar texto do resultado
        const resultText = this.generateResultText(diceCount, mod, rType, results, total, isCritical, isCriticalFail);
        
        if (this.elements.diceResultText) {
            this.elements.diceResultText.textContent = resultText;
            this.elements.diceResultText.style.color = isCritical ? '#ffd93d' : 
                                                     isCriticalFail ? '#ff6b6b' : '#b8c1ec';
        }
        
        // Adicionar ao histórico
        const historyItem = {
            total: total,
            diceType: this.selectedDice,
            results: results,
            modifier: mod,
            rollType: rType,
            isCritical: isCritical,
            isCriticalFail: isCriticalFail,
            timestamp: new Date().toISOString(),
            userName: userName,
            actionType: actionType
        };
        
        DataSystem.diceResults.push(historyItem);
        this.diceHistory.push(historyItem);
        this.updateDiceHistory();
        
        // Criar mensagem de dados
        const diceMessage = {
            id: Utils.generateId(),
            content: textInput || resultText,
            user_name: userName,
            character_class: charClass,
            character_subclass: charSubclass,
            user_color: this.getUserColor(),
            action_type: actionType,
            created_at: new Date().toISOString(),
            is_dice_roll: true,
            dice_type: `d${this.selectedDice}`,
            dice_count: diceCount,
            dice_results: results,
            dice_total: total,
            dice_modifier: mod,
            roll_type: rType,
            is_critical: isCritical,
            is_critical_fail: isCriticalFail
        };
        
        DataSystem.messages.push(diceMessage);
        
        // Atualizar interface
        if (typeof MessagesSystem !== 'undefined') {
            MessagesSystem.updateListDisplay();
        }
        
        // Efeito visual
        this.animateDiceRoll();
        
        // Notificações
        this.showRollNotifications(resultText, isCritical, isCriticalFail);
        
        // Salvar dados
        await DataSystem.saveAllDataDebounced();
        
        // Atualizar estatísticas
        if (typeof DashboardSystem !== 'undefined') {
            DashboardSystem.updateRollStats();
            DashboardSystem.updateDashboardStats();
        }
        
        // Reabilitar botão
        setTimeout(() => {
            if (this.elements.rollDiceButton) {
                this.elements.rollDiceButton.disabled = false;
                this.elements.rollDiceButton.innerHTML = '<i class="fas fa-dice-d20"></i> ROLAR DADOS';
            }
        }, 500);
        
        return { total, results, isCritical, isCriticalFail };
    },
    
    // Rolar D20 rápido
    rollQuickD20: async function() {
        // Selecionar d20
        document.querySelectorAll('.dice-type').forEach(d => d.classList.remove('active'));
        const d20Element = document.querySelector('.dice-type[data-dice="20"]');
        if (d20Element) d20Element.classList.add('active');
        this.selectedDice = 20;
        
        // Configurar opções padrão
        if (this.elements.diceQuantity) this.elements.diceQuantity.value = '1';
        if (this.elements.modifier) this.elements.modifier.value = '0';
        if (this.elements.rollType) this.elements.rollType.value = 'normal';
        
        // Atualizar display
        this.updateDiceDisplayPreview();
        
        // Rolar
        await this.rollDiceWithOptions();
    },
    
    // Rolar dados simples (para uso por outros sistemas)
    rollSimpleDice: function(diceType, count = 1, modifier = 0) {
        let total = 0;
        const results = [];
        
        for (let i = 0; i < count; i++) {
            const result = Utils.rollDice(diceType);
            results.push(result);
            total += result;
        }
        
        total += modifier;
        
        const rollInfo = {
            total: total,
            results: results,
            modifier: modifier,
            diceType: diceType,
            count: count
        };
        
        // Adicionar ao histórico
        DataSystem.diceResults.push({
            ...rollInfo,
            timestamp: new Date().toISOString(),
            userName: 'Sistema',
            actionType: 'system'
        });
        
        this.updateDiceHistory();
        
        return rollInfo;
    },
    
    // =================== FUNÇÕES DE DISPLAY ===================
    
    // Atualizar display do dado
    updateDiceDisplay: function(value, isCritical = false, isCriticalFail = false) {
        if (!this.elements.diceDisplay) return;
        
        this.elements.diceDisplay.classList.remove('dice-rolling');
        
        // Determinar classe CSS baseada no resultado
        let displayClass = 'dice-display';
        if (isCritical) {
            displayClass += ' critical-hit';
            this.elements.diceDisplay.textContent = this.selectedDice === 20 ? '20!' : 'CRIT!';
        } else if (isCriticalFail) {
            displayClass += ' critical-fail';
            this.elements.diceDisplay.textContent = this.selectedDice === 20 ? '1!' : 'FAIL!';
        } else {
            this.elements.diceDisplay.textContent = value;
        }
        
        this.elements.diceDisplay.className = displayClass;
    },
    
    // Atualizar preview do display (antes de rolar)
    updateDiceDisplayPreview: function() {
        if (!this.elements.diceDisplay) return;
        
        // Mostrar o tipo de dado selecionado
        if (this.selectedDice === 100) {
            this.elements.diceDisplay.textContent = 'd%';
        } else {
            this.elements.diceDisplay.textContent = `d${this.selectedDice}`;
        }
        
        this.elements.diceDisplay.className = 'dice-display';
        
        // Atualizar texto informativo
        if (this.elements.diceResultText) {
            const diceCount = this.elements.diceQuantity?.value || '1';
            const modifier = this.elements.modifier?.value || '0';
            const rollType = this.elements.rollType?.value || 'normal';
            
            let previewText = `Pronto para rolar ${diceCount}d${this.selectedDice}`;
            
            if (parseInt(modifier) !== 0) {
                previewText += modifier > 0 ? ` +${modifier}` : ` ${modifier}`;
            }
            
            if (this.selectedDice === 20 && rollType !== 'normal') {
                previewText += ` (${rollType === 'advantage' ? 'Vantagem' : 'Desvantagem'})`;
            }
            
            this.elements.diceResultText.textContent = previewText;
            this.elements.diceResultText.style.color = '#8a8ac4';
        }
    },
    
    // Animação de rolagem
    animateDiceRoll: function() {
        if (!this.elements.diceDisplay) return;
        
        // Efeito de pulso
        this.elements.diceDisplay.style.transform = 'scale(1.2)';
        this.elements.diceDisplay.style.boxShadow = '0 0 40px rgba(157, 78, 221, 0.8)';
        
        // Som de rolagem (se suportado)
        this.playRollSound();
        
        // Retornar ao normal
        setTimeout(() => {
            if (this.elements.diceDisplay) {
                this.elements.diceDisplay.style.transform = 'scale(1)';
                this.elements.diceDisplay.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
            }
        }, 500);
    },
    
    // Reproduzir som de rolagem
    playRollSound: function() {
        // Verificar se som está habilitado nas configurações
        const soundEnabled = localStorage.getItem('rpg_sound_enabled') !== 'false';
        if (!soundEnabled) return;
        
        try {
            // Usar sons diferentes baseados no tipo de dado
            const sounds = {
                4: { frequency: 261.63, duration: 0.3 }, // C4
                6: { frequency: 293.66, duration: 0.4 }, // D4
                8: { frequency: 329.63, duration: 0.5 }, // E4
                10: { frequency: 349.23, duration: 0.4 }, // F4
                12: { frequency: 392.00, duration: 0.5 }, // G4
                20: { frequency: 440.00, duration: 0.6 }, // A4
                100: { frequency: 523.25, duration: 0.7 } // C5
            };
            
            const soundConfig = sounds[this.selectedDice] || sounds[20];
            
            if (typeof AudioContext !== 'undefined') {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                // Configurar tipo de onda (mais "dado-like")
                oscillator.type = 'sawtooth';
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Frequência aleatória dentro de um range para parecer mais natural
                const freqVariation = soundConfig.frequency * (0.9 + Math.random() * 0.2);
                oscillator.frequency.setValueAtTime(freqVariation, audioContext.currentTime);
                
                // Envelope de volume mais realista
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);
                
                // Adicionar um pouco de detune para textura
                oscillator.detune.setValueAtTime(Math.random() * 10, audioContext.currentTime);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + soundConfig.duration);
                
                // Fechar contexto após tocar
                setTimeout(() => {
                    audioContext.close();
                }, soundConfig.duration * 1000 + 100);
            }
        } catch (error) {
            console.log('Áudio não disponível ou desabilitado:', error);
        }
    },
    
    // =================== FUNÇÕES DE TEXTO E FORMATAÇÃO ===================
    
    // Gerar texto do resultado
    generateResultText: function(diceCount, modifier, rollType, results, total, isCritical, isCriticalFail) {
        let resultText = `🎲 Rolou ${diceCount}d${this.selectedDice}`;
        
        // Adicionar modificador
        if (modifier !== 0) {
            resultText += modifier > 0 ? ` +${modifier}` : ` ${modifier}`;
        }
        
        // Adicionar tipo de rolagem
        if (this.selectedDice === 20 && rollType !== 'normal') {
            resultText += ` (${rollType === 'advantage' ? 'Vantagem' : 'Desvantagem'})`;
        }
        
        // Adicionar resultados
        resultText += `: [${results.join(', ')}]`;
        
        // Adicionar total se houver múltiplos dados ou modificador
        if (results.length > 1 || modifier !== 0) {
            if (modifier > 0) {
                resultText += ` + ${modifier} = `;
            } else if (modifier < 0) {
                resultText += ` ${modifier} = `;
            } else {
                resultText += ` = `;
            }
            resultText += `<strong>${total}</strong>`;
        } else {
            resultText = resultText.replace(':', ':' + ` <strong>${total}</strong>`);
        }
        
        // Adicionar indicações especiais
        if (isCritical) {
            resultText += ' 🎉 CRÍTICO!';
        } else if (isCriticalFail) {
            resultText += ' 💀 FALHA CRÍTICA!';
        }
        
        return resultText;
    },
    
    // Obter cor do usuário
    getUserColor: function() {
        const selectedColor = document.querySelector('.user-color-picker .color-option.selected');
        return selectedColor ? selectedColor.getAttribute('data-color') : '#9d4edd';
    },
    
    // =================== FUNÇÕES DE HISTÓRICO ===================
    
    // Atualizar histórico de dados
    updateDiceHistory: function() {
        if (!this.elements.diceHistoryElement) return;
        
        this.elements.diceHistoryElement.innerHTML = '';
        
        // Mostrar últimos 10 resultados
        const recentResults = DataSystem.diceResults.slice(-10).reverse();
        
        if (recentResults.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'dice-history-empty';
            emptyMessage.textContent = 'Nenhuma rolagem ainda';
            emptyMessage.style.color = '#8a8ac4';
            emptyMessage.style.fontStyle = 'italic';
            emptyMessage.style.padding = '10px';
            emptyMessage.style.textAlign = 'center';
            this.elements.diceHistoryElement.appendChild(emptyMessage);
            return;
        }
        
        recentResults.forEach(result => {
            const historyItem = document.createElement('div');
            historyItem.className = 'dice-history-item';
            
            // Adicionar classes para críticos/falhas
            if (result.isCritical) historyItem.classList.add('critical');
            if (result.isCriticalFail) historyItem.classList.add('fail');
            
            // Criar texto do item
            let text = `${result.diceType === 100 ? 'd%' : 'd' + result.diceType}: ${result.total}`;
            
            // Adicionar emojis para resultados especiais
            if (result.isCritical) text = '🎯 ' + text;
            if (result.isCriticalFail) text = '💀 ' + text;
            
            historyItem.textContent = text;
            
            // Tooltip com detalhes
            let tooltipText = `Resultados: ${result.results.join(', ')}`;
            if (result.modifier !== 0) {
                tooltipText += `\nModificador: ${result.modifier > 0 ? '+' + result.modifier : result.modifier}`;
            }
            if (result.rollType !== 'normal') {
                tooltipText += `\nTipo: ${result.rollType === 'advantage' ? 'Vantagem' : 'Desvantagem'}`;
            }
            tooltipText += `\nData: ${new Date(result.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`;
            
            if (result.userName && result.userName !== 'Sistema') {
                tooltipText += `\nJogador: ${result.userName}`;
            }
            
            historyItem.title = tooltipText;
            
            // Adicionar evento de clique para re-rolar
            historyItem.style.cursor = 'pointer';
            historyItem.addEventListener('click', () => {
                this.reRollFromHistory(result);
            });
            
            this.elements.diceHistoryElement.appendChild(historyItem);
        });
    },
    
    // Re-rolar a partir do histórico
    reRollFromHistory: function(historyItem) {
        // Configurar opções baseadas no histórico
        this.selectedDice = historyItem.diceType;
        
        // Selecionar visualmente o tipo de dado
        document.querySelectorAll('.dice-type').forEach(d => d.classList.remove('active'));
        const diceElement = document.querySelector(`.dice-type[data-dice="${historyItem.diceType}"]`);
        if (diceElement) diceElement.classList.add('active');
        
        // Configurar quantidade de dados
        if (this.elements.diceQuantity) {
            this.elements.diceQuantity.value = historyItem.results.length;
        }
        
        // Configurar modificador
        if (this.elements.modifier) {
            this.elements.modifier.value = historyItem.modifier;
        }
        
        // Configurar tipo de rolagem
        if (this.elements.rollType) {
            this.elements.rollType.value = historyItem.rollType;
        }
        
        // Atualizar preview
        this.updateDiceDisplayPreview();
        
        // Notificar
        Notifications.addNotification(
            'Configuração carregada',
            `Pronto para re-rolar ${historyItem.results.length}d${historyItem.diceType}`,
            'info',
            true
        );
    },
    
    // =================== FUNÇÕES DE NOTIFICAÇÃO ===================
    
    // Mostrar notificações de rolagem
    showRollNotifications: function(resultText, isCritical, isCriticalFail) {
        if (isCritical) {
            Notifications.notifyCriticalHit(resultText);
        } else if (isCriticalFail) {
            Notifications.notifyCriticalFail(resultText);
        } else {
            Notifications.notifyDiceRolled(resultText);
        }
    },
    
    // =================== FUNÇÕES DE VALIDAÇÃO ===================
    
    // Validar entrada de dados
    validateInputs: function(diceCount, modifier) {
        const errors = [];
        
        if (isNaN(diceCount) || diceCount < 1 || diceCount > 100) {
            errors.push('Quantidade de dados deve ser entre 1 e 100.');
        }
        
        if (isNaN(modifier) || Math.abs(modifier) > 100) {
            errors.push('Modificador deve estar entre -100 e +100.');
        }
        
        if (this.selectedDice < 4 || this.selectedDice > 100) {
            errors.push('Tipo de dado inválido.');
        }
        
        if (errors.length > 0) {
            Notifications.addNotification('Erro de validação', errors.join(' '), 'danger', true);
            return false;
        }
        
        return true;
    },
    
    // =================== FUNÇÕES DE CONTROLE ===================
    
    // Selecionar tipo de dado
    selectDiceType: function(diceType) {
        this.selectedDice = diceType;
        
        // Atualizar visualmente
        document.querySelectorAll('.dice-type').forEach(d => d.classList.remove('active'));
        const selectedElement = document.querySelector(`.dice-type[data-dice="${diceType}"]`);
        if (selectedElement) {
            selectedElement.classList.add('active');
            
            // Efeito visual na seleção
            selectedElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                selectedElement.style.transform = '';
            }, 200);
        }
        
        // Atualizar display
        this.updateDiceDisplayPreview();
        
        // Adicionar ao log se houver sistema de iniciativa ativo
        if (typeof InitiativeSystem !== 'undefined' && DataSystem.isCombatActive) {
            const diceName = diceType === 100 ? 'd%' : `d${diceType}`;
            InitiativeSystem.addCombatLog(`Dados ${diceName} selecionados para rolagem`, 'system');
        }
    },
    
    // Resetar configurações para padrão
    resetToDefaults: function() {
        this.selectDiceType(20);
        
        if (this.elements.diceQuantity) this.elements.diceQuantity.value = '2';
        if (this.elements.modifier) this.elements.modifier.value = '0';
        if (this.elements.rollType) this.elements.rollType.value = 'normal';
        
        this.updateDiceDisplayPreview();
        
        Notifications.addNotification(
            'Configurações resetadas',
            'Configurações de dados redefinidas para padrão',
            'info',
            true
        );
    },
    
    // Limpar histórico
    clearHistory: function() {
        if (DataSystem.diceResults.length === 0) {
            alert('Não há histórico para limpar.');
            return;
        }
        
        if (confirm(`Tem certeza que deseja limpar o histórico de ${DataSystem.diceResults.length} rolagens?`)) {
            DataSystem.diceResults = [];
            this.diceHistory = [];
            this.updateDiceHistory();
            Notifications.addNotification('Histórico limpo', 'Todas as rolagens foram removidas', 'warning', true);
        }
    },
    
    // Exportar histórico
    exportHistory: function() {
        if (DataSystem.diceResults.length === 0) {
            alert('Não há histórico para exportar.');
            return;
        }
        
        const historyData = {
            diceResults: DataSystem.diceResults,
            exportDate: new Date().toISOString(),
            totalRolls: DataSystem.diceResults.length,
            criticals: DataSystem.diceResults.filter(r => r.isCritical).length,
            fails: DataSystem.diceResults.filter(r => r.isCriticalFail).length
        };
        
        const dataStr = JSON.stringify(historyData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `dice-history-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        Notifications.addNotification('Histórico exportado', 'Arquivo JSON baixado com sucesso', 'success', true);
    },
    
    // Alternar som
    toggleSound: function() {
        const currentSetting = localStorage.getItem('rpg_sound_enabled');
        const newSetting = currentSetting === 'false' ? 'true' : 'false';
        localStorage.setItem('rpg_sound_enabled', newSetting);
        
        Notifications.addNotification(
            'Som ' + (newSetting === 'true' ? 'ativado' : 'desativado'),
            'Efeitos sonoros de dados ' + (newSetting === 'true' ? 'ativados' : 'desativados'),
            'info',
            true
        );
        
        return newSetting === 'true';
    },
    
    // =================== FUNÇÕES ESTATÍSTICAS ===================
    
    // Obter estatísticas de rolagem
    getRollStatistics: function() {
        const stats = {
            totalRolls: DataSystem.diceResults.length,
            byDiceType: {},
            criticals: 0,
            fails: 0,
            averageRolls: {},
            highestRoll: { value: 0, diceType: null, timestamp: null },
            lowestRoll: { value: Infinity, diceType: null, timestamp: null }
        };
        
        DataSystem.diceResults.forEach(roll => {
            // Contar por tipo de dado
            const diceType = roll.diceType;
            if (!stats.byDiceType[diceType]) {
                stats.byDiceType[diceType] = {
                    count: 0,
                    total: 0,
                    criticals: 0,
                    fails: 0
                };
            }
            
            stats.byDiceType[diceType].count++;
            stats.byDiceType[diceType].total += roll.total;
            
            // Contar críticos e falhas
            if (roll.isCritical) {
                stats.criticals++;
                stats.byDiceType[diceType].criticals++;
            }
            if (roll.isCriticalFail) {
                stats.fails++;
                stats.byDiceType[diceType].fails++;
            }
            
            // Verificar maior e menor rolagem
            if (roll.total > stats.highestRoll.value) {
                stats.highestRoll = {
                    value: roll.total,
                    diceType: diceType,
                    timestamp: roll.timestamp
                };
            }
            
            if (roll.total < stats.lowestRoll.value) {
                stats.lowestRoll = {
                    value: roll.total,
                    diceType: diceType,
                    timestamp: roll.timestamp
                };
            }
        });
        
        // Calcular médias
        Object.keys(stats.byDiceType).forEach(diceType => {
            const data = stats.byDiceType[diceType];
            stats.averageRolls[diceType] = data.count > 0 ? (data.total / data.count).toFixed(2) : 0;
        });
        
        return stats;
    },
    
    // Mostrar estatísticas
showStatistics: function() {
    const stats = this.getRollStatistics();
    
    let statsHTML = `
        <div style="padding: 15px;">
            <h3 style="color: #ffd93d; margin-bottom: 15px;">
                <i class="fas fa-chart-bar"></i> Estatísticas de Rolagem
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div style="background: rgba(25, 25, 45, 0.8); padding: 10px; border-radius: 8px; border: 1px solid rgba(83, 52, 131, 0.3);">
                    <div style="color: #8a8ac4; font-size: 0.9rem;">Total de Rolagens</div>
                    <div style="color: #ffd93d; font-size: 1.5rem; font-weight: bold;">${stats.totalRolls}</div>
                </div>
                
                <div style="background: rgba(25, 25, 45, 0.8); padding: 10px; border-radius: 8px; border: 1px solid rgba(83, 52, 131, 0.3);">
                    <div style="color: #8a8ac4; font-size: 0.9rem;">Críticos</div>
                    <div style="color: #4ade80; font-size: 1.5rem; font-weight: bold;">${stats.criticals}</div>
                </div>
                
                <div style="background: rgba(25, 25, 45, 0.8); padding: 10px; border-radius: 8px; border: 1px solid rgba(83, 52, 131, 0.3);">
                    <div style="color: #8a8ac4; font-size: 0.9rem;">Falhas Críticas</div>
                    <div style="color: #ff6b6b; font-size: 1.5rem; font-weight: bold;">${stats.fails}</div>
                </div>
                
                <div style="background: rgba(25, 25, 45, 0.8); padding: 10px; border-radius: 8px; border: 1px solid rgba(83, 52, 131, 0.3);">
                    <div style="color: #8a8ac4; font-size: 0.9rem;">Tipos de Dados</div>
                    <div style="color: #9d4edd; font-size: 1.5rem; font-weight: bold;">${Object.keys(stats.byDiceType).length}</div>
                </div>
            </div>
            
            ${this.generateDetailedStatsHTML(stats)}
            
            <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="closeStats" class="btn-secondary" style="padding: 8px 15px;">Fechar</button>
                <button id="exportStats" class="btn-primary" style="padding: 8px 15px;">
                    <i class="fas fa-download"></i> Exportar
                </button>
            </div>
        </div>
    `;
    
    // ... código para exibir o modal e configurar eventos
}
