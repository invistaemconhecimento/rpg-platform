function initCharacterModule() {
    const newCharacterBtn = document.getElementById('new-character');
    const characterList = document.getElementById('character-list');
    
    if (newCharacterBtn) {
        newCharacterBtn.addEventListener('click', showCharacterForm);
    }
    
    // Carregar personagens existentes
    updateCharacterList();
}

function updateCharacterList() {
    const characterList = document.getElementById('character-list');
    if (!characterList) return;
    
    characterList.innerHTML = '';
    
    if (AppState.characters.length === 0) {
        characterList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users fa-3x"></i>
                <p>Nenhum personagem criado ainda.</p>
                <button id="create-first-character" class="btn-primary">
                    <i class="fas fa-plus"></i> Criar Primeiro Personagem
                </button>
            </div>
        `;
        
        document.getElementById('create-first-character')?.addEventListener('click', showCharacterForm);
        return;
    }
    
    AppState.characters.forEach((character, index) => {
        const characterCard = document.createElement('div');
        characterCard.className = 'character-card';
        characterCard.innerHTML = `
            <h3>${character.name}</h3>
            <p><strong>Classe:</strong> ${character.class} (Nível ${character.level})</p>
            <p><strong>Raça:</strong> ${character.race}</p>
            <p><strong>Jogador:</strong> ${character.player}</p>
            <div class="character-info">
                <div><strong>HP:</strong> ${character.hp.current}/${character.hp.max}</div>
                <div><strong>CA:</strong> ${character.ac}</div>
                <div><strong>For:</strong> ${character.abilities.str}</div>
                <div><strong>Des:</strong> ${character.abilities.dex}</div>
            </div>
            <div class="character-actions">
                <button class="btn-view" data-index="${index}">Ver</button>
                <button class="btn-edit" data-index="${index}">Editar</button>
                <button class="btn-delete" data-index="${index}">Excluir</button>
            </div>
        `;
        
        characterList.appendChild(characterCard);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            viewCharacter(index);
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            editCharacter(index);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            deleteCharacter(index);
        });
    });
}

function showCharacterForm(character = null) {
    const isEdit = character !== null;
    const characterForm = document.getElementById('character-form');
    const characterList = document.getElementById('character-list');
    
    if (characterList) characterList.style.display = 'none';
    if (characterForm) characterForm.style.display = 'block';
    
    characterForm.innerHTML = `
        <h3>${isEdit ? 'Editar' : 'Criar'} Personagem</h3>
        <form id="character-form-data">
            <div class="form-grid">
                <div class="form-group">
                    <label for="char-name">Nome do Personagem *</label>
                    <input type="text" id="char-name" value="${isEdit ? character.name : ''}" required>
                </div>
                <div class="form-group">
                    <label for="char-player">Jogador *</label>
                    <input type="text" id="char-player" value="${isEdit ? character.player : ''}" required>
                </div>
                <div class="form-group">
                    <label for="char-class">Classe *</label>
                    <select id="char-class" required>
                        <option value="">Selecione...</option>
                        <option value="Guerreiro" ${isEdit && character.class === 'Guerreiro' ? 'selected' : ''}>Guerreiro</option>
                        <option value="Mago" ${isEdit && character.class === 'Mago' ? 'selected' : ''}>Mago</option>
                        <option value="Ladino" ${isEdit && character.class === 'Ladino' ? 'selected' : ''}>Ladino</option>
                        <option value="Clérigo" ${isEdit && character.class === 'Clérigo' ? 'selected' : ''}>Clérigo</option>
                        <option value="Bárbaro" ${isEdit && character.class === 'Bárbaro' ? 'selected' : ''}>Bárbaro</option>
                        <option value="Bardo" ${isEdit && character.class === 'Bardo' ? 'selected' : ''}>Bardo</option>
                        <option value="Druida" ${isEdit && character.class === 'Druida' ? 'selected' : ''}>Druida</option>
                        <option value="Monge" ${isEdit && character.class === 'Monge' ? 'selected' : ''}>Monge</option>
                        <option value="Paladino" ${isEdit && character.class === 'Paladino' ? 'selected' : ''}>Paladino</option>
                        <option value="Patrulheiro" ${isEdit && character.class === 'Patrulheiro' ? 'selected' : ''}>Patrulheiro</option>
                        <option value="Feiticeiro" ${isEdit && character.class === 'Feiticeiro' ? 'selected' : ''}>Feiticeiro</option>
                        <option value="Bruxo" ${isEdit && character.class === 'Bruxo' ? 'selected' : ''}>Bruxo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="char-race">Raça *</label>
                    <select id="char-race" required>
                        <option value="">Selecione...</option>
                        <option value="Humano" ${isEdit && character.race === 'Humano' ? 'selected' : ''}>Humano</option>
                        <option value="Elfo" ${isEdit && character.race === 'Elfo' ? 'selected' : ''}>Elfo</option>
                        <option value="Anão" ${isEdit && character.race === 'Anão' ? 'selected' : ''}>Anão</option>
                        <option value="Halfling" ${isEdit && character.race === 'Halfling' ? 'selected' : ''}>Halfling</option>
                        <option value="Draconato" ${isEdit && character.race === 'Draconato' ? 'selected' : ''}>Draconato</option>
                        <option value="Gnomo" ${isEdit && character.race === 'Gnomo' ? 'selected' : ''}>Gnomo</option>
                        <option value="Meio-Elfo" ${isEdit && character.race === 'Meio-Elfo' ? 'selected' : ''}>Meio-Elfo</option>
                        <option value="Meio-Orc" ${isEdit && character.race === 'Meio-Orc' ? 'selected' : ''}>Meio-Orc</option>
                        <option value="Tiefling" ${isEdit && character.race === 'Tiefling' ? 'selected' : ''}>Tiefling</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="char-level">Nível *</label>
                    <input type="number" id="char-level" min="1" max="20" value="${isEdit ? character.level : 1}" required>
                </div>
                <div class="form-group">
                    <label for="char-hp">Pontos de Vida *</label>
                    <input type="number" id="char-hp" value="${isEdit ? character.hp.max : 10}" required>
                </div>
                <div class="form-group">
                    <label for="char-ac">Classe de Armadura (CA) *</label>
                    <input type="number" id="char-ac" min="10" max="30" value="${isEdit ? character.ac : 10}" required>
                </div>
            </div>
            
            <h4>Atributos</h4>
            <div class="attributes-grid">
                <div class="attribute">
                    <label for="char-str">Força</label>
                    <input type="number" id="char-str" min="1" max="30" value="${isEdit ? character.abilities.str : 10}">
                </div>
                <div class="attribute">
                    <label for="char-dex">Destreza</label>
                    <input type="number" id="char-dex" min="1" max="30" value="${isEdit ? character.abilities.dex : 10}">
                </div>
                <div class="attribute">
                    <label for="char-con">Constituição</label>
                    <input type="number" id="char-con" min="1" max="30" value="${isEdit ? character.abilities.con : 10}">
                </div>
                <div class="attribute">
                    <label for="char-int">Inteligência</label>
                    <input type="number" id="char-int" min="1" max="30" value="${isEdit ? character.abilities.int : 10}">
                </div>
                <div class="attribute">
                    <label for="char-wis">Sabedoria</label>
                    <input type="number" id="char-wis" min="1" max="30" value="${isEdit ? character.abilities.wis : 10}">
                </div>
                <div class="attribute">
                    <label for="char-cha">Carisma</label>
                    <input type="number" id="char-cha" min="1" max="30" value="${isEdit ? character.abilities.cha : 10}">
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">${isEdit ? 'Atualizar' : 'Criar'} Personagem</button>
                <button type="button" id="cancel-form" class="btn-secondary">Cancelar</button>
            </div>
        </form>
    `;
    
    // Configurar evento de submit
    document.getElementById('character-form-data').addEventListener('submit', function(e) {
        e.preventDefault();
        if (isEdit) {
            updateCharacter(character.index);
        } else {
            createCharacter();
        }
    });
    
    // Configurar botão de cancelar
    document.getElementById('cancel-form').addEventListener('click', function() {
        characterForm.style.display = 'none';
        if (characterList) characterList.style.display = 'grid';
    });
}

function createCharacter() {
    const character = {
        name: document.getElementById('char-name').value,
        player: document.getElementById('char-player').value,
        class: document.getElementById('char-class').value,
        race: document.getElementById('char-race').value,
        level: parseInt(document.getElementById('char-level').value),
        hp: {
            current: parseInt(document.getElementById('char-hp').value),
            max: parseInt(document.getElementById('char-hp').value)
        },
        ac: parseInt(document.getElementById('char-ac').value),
        abilities: {
            str: parseInt(document.getElementById('char-str').value),
            dex: parseInt(document.getElementById('char-dex').value),
            con: parseInt(document.getElementById('char-con').value),
            int: parseInt(document.getElementById('char-int').value),
            wis: parseInt(document.getElementById('char-wis').value),
            cha: parseInt(document.getElementById('char-cha').value)
        },
        createdAt: new Date().toISOString()
    };
    
    AppState.characters.push(character);
    
    // Salvar no JSONBin
    saveToJSONBin('characters', AppState.characters).then(success => {
        if (success) {
            showNotification('Personagem criado com sucesso!', 'success');
            updateCharacterList();
            
            // Voltar para a lista
            document.getElementById('character-form').style.display = 'none';
            document.getElementById('character-list').style.display = 'grid';
        } else {
            showNotification('Erro ao salvar personagem', 'error');
        }
    });
}

// Implementar viewCharacter, editCharacter, deleteCharacter conforme necessário
