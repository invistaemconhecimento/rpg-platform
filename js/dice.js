// =================== SISTEMA DE DADOS ===================
const DiceSystem = {
    // Configurações
    selectedDice: 20,
    diceHistory: [],
    
    // =================== FUNÇÕES PRINCIPAIS ===================
    
    // Rolar dados com todas as opções
    rollDiceWithOptions: async function() {
        const userName = document.getElementById('userName')?.value.trim() || 'Aventureiro';
        const charClass = document.getElementById('characterClass')?.value || '';
        const charSubclass = document.getElementById('characterSubclass')?.value || '';
        const actionType = document.getElementById('actionType')?.value || '';
        const diceCount = parseInt(document.getElementById('diceQuantity')?.value) || 1;
        const mod = parseInt(document.getElementById('modifier')?.value) || 0;
        const rType = document.getElementById('rollType')?.value || 'normal';
        const textInput = document.getElementById('textInput')?.value.trim() || '';
        
        const diceDisplay = document.getElementById('diceDisplay');
        const diceResultText = document.getElementById('diceResultText');
        const rollDiceButton = document.getElementById('rollDiceButton');
        
        if (!diceDisplay || !diceResultText || !rollDiceButton) {
            console.error('Elementos de dados não encontrados');
            return;
        }
        
        // Desabilitar botão durante rolagem
        rollDiceButton.disabled = true;
        
        // Animação de rolagem
        diceDisplay.classList.add('dice-rolling');
        diceDisplay.textContent = '...';
        diceResultText.textContent = 'Rolando dados...';
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let results = [];
        let total = 0;
        let isCritical = false;
        let isCriticalFail = false;
        let naturalRoll = 0;
        
        // Lógica de rolagem
        if (this.selectedDice !== 20 || rType === 'normal') {
            for (let i = 0; i < diceCount; i++) {
                const result = Utils.rollDice(this.selectedDice);
                results.push(result);
                total += result;
            }
            naturalRoll = results[0] || 0;
        } else if (this.selectedDice === 20 && (rType === 'advantage' || rType === 'disadvantage')) {
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
        
        total += mod;
        
        // Verificar críticos (apenas para d20)
        if (this.selectedDice === 20) {
            if (naturalRoll === 20) isCritical = true;
            if (naturalRoll === 1) isCriticalFail = true;
        }
        
        // Atualizar display
        diceDisplay.classList.remove('dice-rolling');
        
        if (isCritical) {
            diceDisplay.className = 'dice-display critical-hit';
            diceDisplay.textContent = '20!';
        } else if (isCriticalFail) {
            diceDisplay.className = 'dice-display critical-fail';
            diceDisplay.textContent = '1!';
        } else {
            diceDisplay.className = 'dice-display';
            diceDisplay.textContent = total;
        }
        
        // Gerar texto do resultado
        let resultText = `Rolou ${diceCount}d${this.selectedDice}`;
        if (mod !== 0) resultText += mod > 0 ? ` +${mod}` : ` ${mod}`;
        
        if (this.selectedDice === 20 && rType !== 'normal') {
            resultText += ` (${rType === 'advantage' ? 'Vantagem' : 'Desvantagem'})`;
        }
        
        resultText += `: [${results.join(', ')}]`;
        if (mod !== 0) resultText += ` + ${mod} = ${total}`;
        else if (results.length > 1) resultText += ` = ${total}`;
        
        if (isCritical) resultText += ' 🎉 CRÍTICO!';
        if (isCriticalFail) resultText += ' 💀 FALHA CRÍTICA!';
        
        diceResultText.textContent = resultText;
        
        // Adicionar ao histórico
        const historyItem = {
            total: total,
            diceType: this.selectedDice,
            results: results,
            modifier: mod,
            rollType: rType,
            isCritical: isCritical,
            isCriticalFail: isCriticalFail,
            timestamp: new Date().toISOString()
        };
        
        DataSystem.diceResults.push(historyItem);
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
        MessagesSystem.updateListDisplay();
        
        // Efeito visual
        diceDisplay.style.transform = 'scale(1.2)';
        diceDisplay.style.boxShadow = '0 0 30px rgba(157, 78, 221, 0.8)';
        
        setTimeout(() => {
            diceDisplay.style.transform = 'scale(1)';
            diceDisplay.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
        }, 500);
        
        // Notificações
        if (isCritical) {
            Notifications.notifyCriticalHit(resultText);
        } else if (isCriticalFail) {
            Notifications.notifyCriticalFail(resultText);
        } else {
            Notifications.notifyDiceRolled(resultText);
        }
        
        // Salvar dados
        await DataSystem.saveAllDataDebounced();
        
        // Reabilitar botão
        rollDiceButton.disabled = false;
        
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
        const diceQuantity = document.getElementById('diceQuantity');
        const modifier = document.getElementById('modifier');
        const rollType = document.getElementById('rollType');
        
        if (diceQuantity) diceQuantity.value = '1';
        if (modifier) modifier.value = '0';
        if (rollType) rollType.value = 'normal';
        
        // Rolar
        await this.rollDiceWithOptions();
    },
    
    // =================== FUNÇÕES AUXILIARES ===================
    
    // Atualizar histórico de dados
    updateDiceHistory: function() {
        const diceHistory = document.getElementById('diceHistory');
        if (!diceHistory) return;
        
        diceHistory.innerHTML = '';
        
        const recentResults = DataSystem.diceResults.slice(-10);
        
        recentResults.forEach(result => {
            const historyItem = document.createElement('div');
            historyItem.className = 'dice-history-item';
            
            if (result.isCritical) historyItem.classList.add('critical');
            if (result.isCriticalFail) historyItem.classList.add('fail');
            
            let text = `${result.diceType === 100 ? 'd%' : 'd' + result.diceType}: ${result.total}`;
            if (result.isCritical) text = '🎯 ' + text;
            if (result.isCriticalFail) text = '💀 ' + text;
            
            historyItem.textContent = text;
            historyItem.title = `${result.results.join(', ')} ${result.modifier > 0 ? '+' + result.modifier : result.modifier < 0 ? result.modifier : ''}`;
            
            diceHistory.appendChild(historyItem);
        });
    },
    
    // Obter cor do usuário
    getUserColor: function() {
        const selectedColor = document.querySelector('.user-color-picker .color-option.selected');
        return selectedColor ? selectedColor.getAttribute('data-color') : '#9d4edd';
    },
    
    // Selecionar tipo de dado
    selectDiceType: function(diceType) {
        this.selectedDice = diceType;
        
        // Atualizar visualmente
        document.querySelectorAll('.dice-type').forEach(d => d.classList.remove('active'));
        const selectedElement = document.querySelector(`.dice-type[data-dice="${diceType}"]`);
        if (selectedElement) selectedElement.classList.add('active');
        
        // Atualizar display
        const diceDisplay = document.getElementById('diceDisplay');
        if (diceDisplay) {
            diceDisplay.textContent = diceType === 100 ? 'd%' : diceType;
            diceDisplay.className = 'dice-display';
        }
    },
    
    // Rolar dados simples
    rollSimpleDice: function(diceType, count = 1, modifier = 0) {
        let total = 0;
        const results = [];
        
        for (let i = 0; i < count; i++) {
            const result = Utils.rollDice(diceType);
            results.push(result);
            total += result;
        }
        
        total += modifier;
        
        return {
            total: total,
            results: results,
            modifier: modifier
        };
    },
    
    // =================== INICIALIZAÇÃO ===================
    
    init: function() {
        console.log('DiceSystem inicializado');
        
        // Carregar histórico
        this.diceHistory = DataSystem.diceResults || [];
        this.updateDiceHistory();
        
        // Configurar event listeners
        this.setupEventListeners();
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Botão de rolar dados
        const rollDiceButton = document.getElementById('rollDiceButton');
        if (rollDiceButton) {
            rollDiceButton.addEventListener('click', () => {
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
        
        // Atalho de teclado (Ctrl + D)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.rollQuickD20();
            }
        });
    }
};

// Exportar para uso global
window.DiceSystem = DiceSystem;
