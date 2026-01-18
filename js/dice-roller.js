function initDiceModule() {
    const diceButtons = document.querySelectorAll('.dice-btn');
    const rollButton = document.getElementById('roll-dice');
    
    let selectedDice = 20; // Padrão D20
    
    diceButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            selectedDice = parseInt(this.dataset.sides);
            diceButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    rollButton.addEventListener('click', function() {
        const count = parseInt(document.getElementById('dice-count').value) || 1;
        const results = [];
        let total = 0;
        
        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * selectedDice) + 1;
            results.push(roll);
            total += roll;
        }
        
        // Exibir resultado
        const resultHTML = `
            <div class="roll-result">
                <h4>${count}d${selectedDice}</h4>
                <p>Resultados: ${results.join(', ')}</p>
                ${count > 1 ? `<p><strong>Total: ${total}</strong></p>` : ''}
                <small>${new Date().toLocaleTimeString()}</small>
            </div>
        `;
        
        // Adicionar ao histórico
        const history = document.getElementById('dice-history');
        history.insertAdjacentHTML('afterbegin', resultHTML);
        
        // Mostrar resultado atual
        document.getElementById('current-roll').innerHTML = `
            <div class="current-roll-display">
                <h3>${count}d${selectedDice} = ${total}</h3>
                <p>${results.join(' + ')}</p>
            </div>
        `;
        
        // Salvar no histórico do estado
        AppState.diceHistory.unshift({
            dice: `${count}d${selectedDice}`,
            results,
            total,
            timestamp: new Date().toISOString()
        });
    });
}
