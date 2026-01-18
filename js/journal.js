function initJournalModule() {
    const newEntryBtn = document.getElementById('new-entry');
    
    if (newEntryBtn) {
        newEntryBtn.addEventListener('click', createNewEntry);
    }
    
    updateJournalEntries();
}

function updateJournalEntries() {
    const entriesContainer = document.getElementById('journal-entries');
    if (!entriesContainer) return;
    
    entriesContainer.innerHTML = '';
    
    if (AppState.journalEntries.length === 0) {
        entriesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open fa-3x"></i>
                <p>Nenhuma entrada no diário ainda.</p>
                <button id="create-first-entry" class="btn-primary">
                    <i class="fas fa-plus"></i> Criar Primeira Entrada
                </button>
            </div>
        `;
        
        document.getElementById('create-first-entry')?.addEventListener('click', createNewEntry);
        return;
    }
    
    AppState.journalEntries.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'journal-entry';
        entryElement.innerHTML = `
            <div class="entry-header">
                <h3>${entry.title}</h3>
                <span class="entry-date">${new Date(entry.date).toLocaleDateString()}</span>
            </div>
            <p>${entry.content.substring(0, 150)}${entry.content.length > 150 ? '...' : ''}</p>
            <div class="entry-actions">
                <button class="btn-view-entry" data-index="${index}">Ler</button>
                <button class="btn-edit-entry" data-index="${index}">Editar</button>
                <button class="btn-delete-entry" data-index="${index}">Excluir</button>
            </div>
        `;
        
        entriesContainer.appendChild(entryElement);
    });
    
    // Adicionar eventos
    document.querySelectorAll('.btn-view-entry').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            viewJournalEntry(index);
        });
    });
}

function createNewEntry() {
    const title = prompt('Título da entrada:');
    if (!title) return;
    
    const content = prompt('Conteúdo da entrada:');
    if (!content) return;
    
    const newEntry = {
        id: Date.now(),
        title,
        content,
        date: new Date().toISOString(),
        author: AppState.currentUser || 'Jogador'
    };
    
    AppState.journalEntries.unshift(newEntry);
    
    saveToJSONBin('journal', AppState.journalEntries).then(success => {
        if (success) {
            showNotification('Entrada criada com sucesso!', 'success');
            updateJournalEntries();
        }
    });
}
