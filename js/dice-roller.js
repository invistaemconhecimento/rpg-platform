function initDiceModule() {
    console.log('Inicializando módulo de dados...');
    
    const diceButtons = document.querySelectorAll('.dice-btn');
    const rollButton = document.getElementById('roll-dice');
    
    let selectedDice = 20;
    
    // Selecionar dado
    diceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            selectedDice = parseInt(this.dataset.sides);
            
            // Remover seleção anterior
            diceButtons.forEach(b => {
                b.style.backgroundColor = '';
                b.style.borderColor = '';
            });
            
            // Marcar como selecionado
            this.style.backgroundColor = '#5e35b1';
            this.style.borderColor = '#ff9800';
            
            console.log('Dado selecionado: D' + selectedDice);
        });
    });
    
    // Selecionar D20 por padrão
    if (diceButtons.length > 0) {
        const d20Btn = Array.from(diceButtons).find(btn => btn.dataset.sides === '20');
        if (d20Btn) d20Btn.click();
    }
    
    // Rolagem de dados
    if (rollButton) {
        rollButton.addEventListener('click', rollDice);
    }
}

function rollDice() {
    const countInput = document.getElementById('dice-count');
    const count = parseInt(countInput.value) || 1;
    
    if (count < 1 || count > 20) {
        showNotification('Quantidade deve ser entre 1 e 20', 'error');
        return;
    }
    
    const results = [];
    let total = 0;
    
    // Rolagens individuais
    for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * selectedDice) + 1;
        results.push(roll);
        total += roll;
    }
    
    // Criar resultado
    const rollResult = {
        dice: `${count}d${selectedDice}`,
        results: results,
        total: total,
        timestamp: new Date().toISOString()
    };
    
    // Adicionar ao histórico
    AppState.diceHistory.unshift(rollResult);
    
    // Atualizar interface
    updateDiceDisplay(rollResult);
    
    // Som de dados (opcional)
    playDiceSound();
    
    console.log('Rolagem:', rollResult);
}

function updateDiceDisplay(roll) {
    // Atualizar histórico
    const historyDiv = document.getElementById('dice-history');
    if (historyDiv) {
        const rollElement = document.createElement('div');
        rollElement.className = 'roll-history-item';
        rollElement.innerHTML = `
            <strong>${roll.dice}</strong>: ${roll.results.join(' + ')} = ${roll.total}
            <small>${new Date(roll.timestamp).toLocaleTimeString()}</small>
        `;
        rollElement.style.cssText = `
            background: rgba(0,0,0,0.2);
            padding: 8px;
            margin: 5px 0;
            border-radius: 4px;
            border-left: 3px solid #ff9800;
        `;
        
        // Manter apenas últimos 10 resultados
        historyDiv.insertBefore(rollElement, historyDiv.firstChild);
        if (historyDiv.children.length > 10) {
            historyDiv.removeChild(historyDiv.lastChild);
        }
    }
    
    // Atualizar resultado atual
    const currentDiv = document.getElementById('current-roll');
    if (currentDiv) {
        currentDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h3 style="font-size: 2em; margin: 10px 0; color: #ff9800;">${roll.total}</h3>
                <p>${roll.dice}: ${roll.results.join(' + ')}</p>
                <small>${roll.results.length > 1 ? 'Total' : 'Resultado'}</small>
            </div>
        `;
    }
}

function playDiceSound() {
    // Som simples de dados (pode ser substituído por arquivo de áudio)
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Som de dados (simulado)');
    }
}
