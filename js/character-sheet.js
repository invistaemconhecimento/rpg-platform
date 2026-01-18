function initCharacterModule() {
    console.log('Inicializando módulo de personagens...');
    
    const newCharBtn = document.getElementById('new-character');
    if (newCharBtn) {
        newCharBtn.addEventListener('click', () => showCharacterForm());
    }
    
    updateCharacterList();
}

function updateCharacterList() {
    const listDiv = document.getElementById('character-list');
    if (!listDiv) return;
    
    listDiv.innerHTML = '';
    
    if (AppState.characters.length === 0) {
        listDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #888;">
                <i class="fas fa-users" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Nenhum personagem criado</h3>
                <p>Crie seu primeiro personagem para começar!</p>
                <button onclick="showCharacterForm()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Criar Personagem
                </button>
            </div>
        `;
        return;
    }
    
    AppState.characters.forEach((char, index) => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.style.cssText = `
            background: #16213e;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
            border-left: 4px solid #ff9800;
            cursor: pointer;
        `;
        
        card.innerHTML = `
            <h3 style="color: #ff9800; margin-bottom: 10px;">${char.name}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div><strong>Classe:</strong> ${char.class}</div>
                <div><strong>Raça:</strong> ${char.race}</div>
                <div><strong>Nível:</strong> ${char.level}</div>
                <div><strong>Jogador:</strong> ${char.player}</div>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <div><strong>HP:</strong> ${char.hp?.current || 0}/${char.hp?.max || 0}</div>
                <div><strong>CA:</strong> ${char.ac || 10}</div>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="editCharacter(${index})" style="padding: 5px 10px; background: #ff9800; border: none; border-radius: 3px; color: white;">
                    Editar
                </button>
                <button onclick="deleteCharacter(${index})" style="padding: 5px 10px; background: #f44336; border: none; border-radius: 3px; color: white;">
                    Excluir
                </button>
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                viewCharacter(index);
            }
        });
        
        listDiv.appendChild(card);
    });
}

function showCharacterForm(character = null) {
    const isEdit = character !== null;
    const formDiv = document.getElementById('character-form');
    const listDiv = document.getElementById('character-list');
    
    if (listDiv) listDiv.style.display = 'none';
    if (formDiv) formDiv.style.display = 'block';
    
    formDiv.innerHTML = `
        <div style="background: #16213e; padding: 20px; border-radius: 10px;">
            <h3 style="margin-bottom: 20px; color: #ff9800;">
                <i class="fas fa-${isEdit ? 'edit' : 'plus'}"></i>
                ${isEdit ? 'Editar' : 'Criar'} Personagem
            </h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label>Nome *</label>
                    <input type="text" id="char-name" value="${isEdit ? character.name : ''}" 
                           style="width: 100%; padding: 8px; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                </div>
                <div>
                    <label>Jogador *</label>
                    <input type="text" id="char-player" value="${isEdit ? character.player : AppState.currentUser}" 
                           style="width: 100%; padding: 8px; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                </div>
                <div>
                    <label>Classe *</label>
                    <select id="char-class" style="width: 100%; padding: 8px; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                        <option value="">Selecione...</option>
                        <option value="Guerreiro" ${isEdit && character.class === 'Guerreiro' ? 'selected' : ''}>Guerreiro</option>
                        <option value="Mago" ${isEdit && character.class === 'Mago' ? 'selected' : ''}>Mago</option>
                        <option value="Ladino" ${isEdit && character.class === 'Ladino' ? 'selected' : ''}>Ladino</option>
                        <option value="Clérigo" ${isEdit && character.class === 'Clérigo' ? 'selected' : ''}>Clérigo</option>
                    </select>
                </div>
                <div>
                    <label>Raça *</label>
                    <select id="char-race" style="width: 100%; padding: 8px; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                        <option value="">Selecione...</option>
                        <option value="Humano" ${isEdit && character.race === 'Humano' ? 'selected' : ''}>Humano</option>
                        <option value="Elfo" ${isEdit && character.race === 'Elfo' ? 'selected' : ''}>Elfo</option>
                        <option value="Anão" ${isEdit && character.race === 'Anão' ? 'selected' : ''}>Anão</option>
                        <option value="Halfling" ${isEdit && character.race === 'Halfling' ? 'selected' : ''}>Halfling</option>
                    </select>
                </div>
                <div>
                    <label>Nível *</label>
                    <input type="number" id="char-level" min="1" max="20" value="${isEdit ? character.level : 1}" 
                           style="width: 100%; padding: 8px; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                </div>
                <div>
                    <label>Pontos de Vida *</label>
                    <input type="number" id="char-hp" value="${isEdit ? (character.hp?.max || 10) : 10}" 
                           style="width: 100%; padding: 8px; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                </div>
                <div>
                    <label>Classe de Armadura (CA) *</label>
                    <input type="number" id="char-ac" min="10" max="30" value="${isEdit ? character.ac : 10}" 
                           style="width: 100%; padding: 8px; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                </div>
            </div>
            
            <h4 style="color: #ff9800; margin: 20px 0 10px 0;">Atributos</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center;">
                    <label>Força</label>
                    <input type="number" id="char-str" min="1" max="30" value="${isEdit ? (character.abilities?.str || 10) : 10}" 
                           style="width: 80px; padding: 8px; text-align: center; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                </div>
                <div style="text-align: center;">
                    <label>Destreza</label>
                    <input type="number" id="char-dex" min="1" max="30" value="${isEdit ? (character.abilities?.dex || 10) : 10}" 
                           style="width: 80px; padding: 8px; text-align: center; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                </div>
                <div style="text-align: center;">
                    <label>Constituição</label>
                    <input type="number" id="char-con" min="1" max="30" value="${isEdit ? (character.abilities?.con || 10) : 10}" 
                           style="width: 80px; padding: 8px; text-align: center; background: #1a1a2e; border: 1px solid #5e35b1; color: white; border-radius: 4px;">
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="saveCharacter(${isEdit ? index : null})" 
                        style="padding: 10px 20px; background: #4CAF50; border: none; border-radius: 4px; color: white; cursor: pointer;">
                    <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Salvar'}
                </button>
                <button onclick="cancelCharacterForm()" 
                        style="padding: 10px 20px; background: #666; border: none; border-radius: 4px; color: white; cursor: pointer;">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        </div>
    `;
}

function saveCharacter(index = null) {
    const name = document.getElementById('char-name').value;
    const player = document.getElementById('char-player').value;
    const charClass = document.getElementById('char-class').value;
    const race = document.getElementById('char-race').value;
    const level = parseInt(document.getElementById('char-level').value);
    const hp = parseInt(document.getElementById('char-hp').value);
    const ac = parseInt(document.getElementById('char-ac').value);
    const str = parseInt(document.getElementById('char-str').value);
    const dex = parseInt(document.getElementById('char-dex').value);
    const con = parseInt(document.getElementById('char-con').value);
    
    // Validação básica
    if (!name || !player || !charClass || !race) {
        showNotification('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const character = {
        name,
        player,
        class: charClass,
        race,
        level,
        hp: { current: hp, max: hp },
        ac,
        abilities: { str, dex, con, int: 10, wis: 10, cha: 10 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (index !== null) {
        // Editar existente
        AppState.characters[index] = character;
    } else {
        // Novo personagem
        AppState.characters.push(character);
    }
    
    // Salvar no JSONBin
    saveToJSONBin('characters', AppState.characters).then(success => {
        if (success) {
            showNotification(`Personagem ${index !== null ? 'atualizado' : 'criado'} com sucesso!`, 'success');
            cancelCharacterForm();
            updateCharacterList();
        } else {
            showNotification('Erro ao salvar personagem', 'error');
        }
    });
}

function cancelCharacterForm() {
    const formDiv = document.getElementById('character-form');
    const listDiv = document.getElementById('character-list');
    
    if (formDiv) formDiv.style.display = 'none';
    if (listDiv) {
        listDiv.style.display = 'grid';
        updateCharacterList();
    }
}

function editCharacter(index) {
    if (AppState.characters[index]) {
        showCharacterForm(AppState.characters[index], index);
    }
}

function deleteCharacter(index) {
    if (confirm('Tem certeza que deseja excluir este personagem?')) {
        AppState.characters.splice(index, 1);
        
        saveToJSONBin('characters', AppState.characters).then(success => {
            if (success) {
                showNotification('Personagem excluído!', 'success');
                updateCharacterList();
            }
        });
    }
}

function viewCharacter(index) {
    const char = AppState.characters[index];
    if (!char) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    if (modal && modalBody) {
        modalBody.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: #ff9800;">${char.name}</h2>
                <p><strong>Jogador:</strong> ${char.player}</p>
                <p><strong>Classe/Nível:</strong> ${char.class} ${char.race} (Nível ${char.level})</p>
                <hr>
                <h3>Atributos</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0;">
                    <div><strong>Força:</strong> ${char.abilities.str}</div>
                    <div><strong>Destreza:</strong> ${char.abilities.dex}</div>
                    <div><strong>Constituição:</strong> ${char.abilities.con}</div>
                    <div><strong>Inteligência:</strong> ${char.abilities.int}</div>
                    <div><strong>Sabedoria:</strong> ${char.abilities.wis}</div>
                    <div><strong>Carisma:</strong> ${char.abilities.cha}</div>
                </div>
                <div style="margin-top: 20px;">
                    <button onclick="editCharacter(${index})" style="padding: 10px; background: #ff9800; color: white; border: none; border-radius: 4px;">
                        Editar Personagem
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Fechar modal
        document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target == modal) modal.style.display = 'none';
        };
    }
}

// Exportar funções globais
window.showCharacterForm = showCharacterForm;
window.saveCharacter = saveCharacter;
window.cancelCharacterForm = cancelCharacterForm;
window.editCharacter = editCharacter;
window.deleteCharacter = deleteCharacter;
window.viewCharacter = viewCharacter;
