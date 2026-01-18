function initJournalModule() {
    console.log('Inicializando módulo de diário...');
    
    const newEntryBtn = document.getElementById('new-entry');
    if (newEntryBtn) {
        newEntryBtn.addEventListener('click', createJournalEntry);
    }
    
    updateJournalDisplay();
}

function updateJournalDisplay() {
    const entriesDiv = document.getElementById('journal-entries');
    if (!entriesDiv) return;
    
    entriesDiv.innerHTML = '';
    
    if (AppState.journalEntries.length === 0) {
        entriesDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #888;">
                <i class="fas fa-book-open" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Diário Vazio</h3>
                <p>Registre suas aventuras aqui!</p>
            </div>
        `;
        return;
    }
    
    AppState.journalEntries.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry';
        entryDiv.style.cssText = `
            background: #16213e;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
            border-left: 4px solid #5e35b1;
        `;
        
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        entryDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <h4 style="color: #ff9800; margin: 0;">${entry.title}</h4>
                <small style="color: #888;">${formattedDate}</small>
            </div>
            <p style="color: #ccc; line-height: 1.5;">${entry.content}</p>
            <div style="margin-top: 15px; font-size: 0.9em; color: #888;">
                <i class="fas fa-user"></i> Por ${entry.author}
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="deleteJournalEntry(${index})" style="padding: 5px 10px; background: #f44336; border: none; border-radius: 3px; color: white; font-size: 0.9em;">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
        
        entriesDiv.appendChild(entryDiv);
    });
}

function createJournalEntry() {
    const title = prompt('Título da entrada:');
    if (!title) return;
    
    const content = prompt('Descreva sua aventura:');
    if (!content) return;
    
    const entry = {
        id: Date.now(),
        title,
        content,
        date: new Date().toISOString(),
        author: AppState.currentUser
    };
    
    AppState.journalEntries.unshift(entry);
    
    saveToJSONBin('journal', AppState.journalEntries).then(success => {
        if (success) {
            showNotification('Entrada salva no diário!', 'success');
            updateJournalDisplay();
        }
    });
}

function deleteJournalEntry(index) {
    if (confirm('Excluir esta entrada do diário?')) {
        AppState.journalEntries.splice(index, 1);
        
        saveToJSONBin('journal', AppState.journalEntries).then(success => {
            if (success) {
                showNotification('Entrada excluída!', 'success');
                updateJournalDisplay();
            }
        });
    }
}

window.createJournalEntry = createJournalEntry;
window.deleteJournalEntry = deleteJournalEntry;
