// =================== SISTEMA DE FICHAS DE PERSONAGENS ===================
const SheetsSystem = {
    // Configurações
    currentStep: 1,
    attributePoints: 27,
    selectedSheetColor: '#9d4edd',
    currentSheetBeingEdited: null,
    
    // Templates pré-definidos
    characterTemplates: {
        warrior: {
            name: 'Guerreiro do Reino',
            race: 'Humano',
            class: 'Guerreiro',
            subclass: 'Campeão',
            level: 1,
            hp: 12,
            ac: 16,
            speed: '9m',
            background: 'Soldado',
            str: 16,
            dex: 10,
            con: 14,
            int: 8,
            wis: 10,
            cha: 12,
            color: '#4d96ff'
        },
        wizard: {
            name: 'Mago Arcano',
            race: 'Elfo',
            class: 'Mago',
            subclass: 'Evocação',
            level: 1,
            hp: 8,
            ac: 12,
            speed: '9m',
            background: 'Sábio',
            str: 8,
            dex: 14,
            con: 10,
            int: 16,
            wis: 12,
            cha: 10,
            color: '#9d4edd'
        },
        rogue: {
            name: 'Ladino das Sombras',
            race: 'Halfling',
            class: 'Ladino',
            subclass: 'Ladrão',
            level: 1,
            hp: 10,
            ac: 14,
            speed: '7.5m',
            background: 'Criminoso',
            str: 8,
            dex: 16,
            con: 12,
            int: 10,
            wis: 10,
            cha: 14,
            color: '#6bcf7f'
        },
        cleric: {
            name: 'Clérigo Devoto',
            race: 'Anão',
            class: 'Clérigo',
            subclass: 'Domínio da Vida',
            level: 1,
            hp: 10,
            ac: 18,
            speed: '7.5m',
            background: 'Acólito',
            str: 12,
            dex: 8,
            con: 14,
            int: 10,
            wis: 16,
            cha: 10,
            color: '#ffd93d'
        }
    },
    
    // =================== FUNÇÕES PRINCIPAIS ===================
    
    // Atualizar exibição da lista de fichas
    updateSheetsDisplay: function() {
        const sheetsGrid = document.getElementById('sheetsGrid');
        const characterCount = document.getElementById('characterCount');
        
        if (!sheetsGrid) return;
        
        sheetsGrid.innerHTML = '';
        
        if (characterCount) {
            characterCount.textContent = `${DataSystem.characterSheets.length} Personagens`;
        }
        
        if (DataSystem.characterSheets.length === 0) {
            sheetsGrid.innerHTML = `
                <div class="empty-sheets">
                    <i class="fas fa-user-plus"></i>
                    <h3>Nenhuma ficha criada ainda</h3>
                    <p>Clique em "Nova Ficha" para começar</p>
                </div>
            `;
            return;
        }
        
        // Aplicar filtros
        const sheetClassFilter = document.getElementById('sheetClassFilter');
        const sheetLevelFilter = document.getElementById('sheetLevelFilter');
        
        const classFilter = sheetClassFilter ? sheetClassFilter.value : 'all';
        const levelFilter = sheetLevelFilter ? sheetLevelFilter.value : 'all';
        
        const filteredSheets = DataSystem.characterSheets.filter(sheet => {
            if (classFilter && classFilter !== 'all' && sheet.class !== classFilter) return false;
            if (levelFilter && levelFilter !== 'all') {
                const level = parseInt(sheet.level) || 1;
                if (levelFilter.includes('-')) {
                    const [min, max] = levelFilter.split('-').map(Number);
                    if (level < min || level > max) return false;
                } else if (parseInt(levelFilter) !== level) {
                    return false;
                }
            }
            return true;
        });
        
        filteredSheets.forEach((sheet) => {
            const sheetCard = document.createElement('div');
            sheetCard.className = 'character-sheet-card';
            sheetCard.dataset.id = sheet.id;
            
            const initiative = Utils.calculateAttributeModifier(sheet.dex || 10);
            const color = sheet.color || this.selectedSheetColor;
            
            sheetCard.innerHTML = `
                <div class="sheet-color-bar" style="background-color: ${color}"></div>
                <div class="sheet-header">
                    <div class="sheet-avatar" style="background-color: ${color}">
                        ${sheet.name ? sheet.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div class="sheet-info">
                        <h3>${sheet.name || 'Sem nome'}</h3>
                        <p>${sheet.race || 'Raça'} • ${sheet.class || 'Classe'} Nv. ${sheet.level || 1}</p>
                    </div>
                </div>
                <div class="sheet-stats">
                    <div class="stat">
                        <span class="stat-label">PV</span>
                        <span class="stat-value">${sheet.hp || 10}/${sheet.maxHP || sheet.hp || 10}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">CA</span>
                        <span class="stat-value">${sheet.ac || 10}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Iniciativa</span>
                        <span class="stat-value">${Utils.formatModifier(initiative)}</span>
                    </div>
                </div>
                <div class="sheet-attributes">
                    <span class="attr" title="Força">F: ${sheet.str || 10} (${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.str || 10))})</span>
                    <span class="attr" title="Destreza">D: ${sheet.dex || 10} (${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.dex || 10))})</span>
                    <span class="attr" title="Constituição">C: ${sheet.con || 10} (${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.con || 10))})</span>
                </div>
                <div class="sheet-actions">
                    <button class="btn-view" onclick="SheetsSystem.showSheetDetails('${sheet.id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn-edit" onclick="SheetsSystem.editSheet('${sheet.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="SheetsSystem.deleteSheet('${sheet.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            sheetsGrid.appendChild(sheetCard);
        });
    },
    
    // Mostrar detalhes da ficha no modal
    showSheetDetails: function(sheetId) {
        const sheet = DataSystem.findSheetById(sheetId);
        if (!sheet) {
            alert('Ficha não encontrada!');
            return;
        }
        
        const sheetModal = document.getElementById('sheetModal');
        const sheetModalBody = document.getElementById('sheetModalBody');
        const sheetModalAvatar = document.getElementById('sheetModalAvatar');
        const sheetModalName = document.getElementById('sheetModalName');
        const sheetModalDetails = document.getElementById('sheetModalDetails');
        
        if (!sheetModal || !sheetModalBody || !sheetModalAvatar || !sheetModalName || !sheetModalDetails) return;
        
        const color = sheet.color || this.selectedSheetColor;
        
        // Atualizar cabeçalho do modal
        sheetModalAvatar.textContent = sheet.name ? sheet.name.charAt(0).toUpperCase() : '?';
        sheetModalAvatar.style.backgroundColor = color;
        sheetModalName.textContent = sheet.name || 'Sem nome';
        sheetModalDetails.textContent = `${sheet.race || 'Raça'} • ${sheet.class || 'Classe'} ${sheet.subclass ? `(${sheet.subclass})` : ''} • Nível ${sheet.level || 1}`;
        
        // Atualizar corpo do modal
        sheetModalBody.innerHTML = `
            <div class="modal-section">
                <h3><i class="fas fa-heart"></i> Pontos de Vida</h3>
                <p>${sheet.hp || 10}/${sheet.maxHP || sheet.hp || 10}</p>
            </div>
            
            <div class="modal-section">
                <h3><i class="fas fa-shield-alt"></i> Defesa</h3>
                <p>Classe de Armadura: ${sheet.ac || 10}</p>
            </div>
            
            <div class="modal-section">
                <h3><i class="fas fa-running"></i> Movimento</h3>
                <p>${sheet.speed || '9m'}</p>
            </div>
            
            <div class="modal-section">
                <h3><i class="fas fa-book"></i> Informações</h3>
                <p><strong>Antecedente:</strong> ${sheet.background || 'Não definido'}</p>
                ${sheet.description ? `<p><strong>Descrição:</strong> ${sheet.description}</p>` : ''}
            </div>
            
            <div class="modal-section">
                <h3><i class="fas fa-chart-line"></i> Atributos</h3>
                <div class="modal-attributes">
                    <div class="modal-attr">
                        <span class="attr-name">Força</span>
                        <span class="attr-value">${sheet.str || 10} (${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.str || 10))})</span>
                    </div>
                    <div class="modal-attr">
                        <span class="attr-name">Destreza</span>
                        <span class="attr-value">${sheet.dex || 10} (${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.dex || 10))})</span>
                    </div>
                    <div class="modal-attr">
                        <span class="attr-name">Constituição</span>
                        <span class="attr-value">${sheet.con || 10} (${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.con || 10))})</span>
                    </div>
                    <div class="modal-attr">
                        <span class="attr-name">Inteligência</span>
                        <span class="attr-value">${sheet.int || 10} (${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.int || 10))})</span>
                    </div>
                    <div class="modal-attr">
                        <span class="attr-name">Sabedoria</span>
                        <span class="attr-value">${sheet.wis || 10} (${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.wis || 10))})</span>
                    </div>
                    <div class="modal-attr">
                        <span class="attr-name">Carisma</span>
                        <span class="attr-value">${sheet.cha || 10} (${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.cha || 10))})</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-section">
                <h3><i class="fas fa-swords"></i> Iniciativa</h3>
                <p>${Utils.formatModifier(Utils.calculateAttributeModifier(sheet.dex || 10))}</p>
            </div>

            <div class="modal-section">
                <h3><i class="fas fa-bolt"></i> Ações Rápidas</h3>
                <div class="quick-actions">
                    <button class="btn-action-quick" data-action="dialog" onclick="SheetsSystem.createQuickAction('${sheet.id}', 'dialog')">
                        <i class="fas fa-comments"></i> Diálogo
                    </button>
                    <button class="btn-action-quick" data-action="attack" onclick="SheetsSystem.createQuickAction('${sheet.id}', 'attack')">
                        <i class="fas fa-fist-raised"></i> Ataque
                    </button>
                    <button class="btn-action-quick" data-action="magic" onclick="SheetsSystem.createQuickAction('${sheet.id}', 'magic')">
                        <i class="fas fa-hat-wizard"></i> Magia
                    </button>
                    <button class="btn-action-quick" data-action="skill" onclick="SheetsSystem.createQuickAction('${sheet.id}', 'skill')">
                        <i class="fas fa-running"></i> Habilidade
                    </button>
                </div>
            </div>
        `;
        
        // Configurar botões do modal
        const btnUseSheet = document.querySelector('.btn-use-sheet');
        const btnCloseModal = document.querySelector('.btn-close-modal');
        
        if (btnUseSheet) {
            btnUseSheet.onclick = () => this.useSheetInGame(sheetId);
        }
        
        if (btnCloseModal) {
            btnCloseModal.onclick = this.closeModal;
        }
        
        // Mostrar modal
        sheetModal.style.display = 'flex';
    },
    
    // Fechar modal
    closeModal: function() {
        const sheetModal = document.getElementById('sheetModal');
        if (sheetModal) {
            sheetModal.style.display = 'none';
        }
    },
    
    // =================== FUNÇÕES DE WIZARD ===================
    
    // Navegar entre passos do wizard
    goToStep: function(step) {
        if (step < 1 || step > 4) return;
        
        // Validar passo atual antes de avançar
        if (step > this.currentStep) {
            if (!this.validateCurrentStep()) {
                return;
            }
        }
        
        // Oculta todos os steps
        document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.wizard-step-content').forEach(c => c.classList.remove('active'));
        
        // Mostra o step atual
        document.querySelector(`.wizard-step[data-step="${step}"]`).classList.add('active');
        document.querySelector(`.wizard-step-content[data-step="${step}"]`).classList.add('active');
        
        // Atualiza botões
        const prevStepButton = document.getElementById('prevStepButton');
        const nextStepButton = document.getElementById('nextStepButton');
        const finishSheetButton = document.getElementById('finishSheetButton');
        
        if (prevStepButton) prevStepButton.disabled = step === 1;
        if (nextStepButton) nextStepButton.style.display = step < 4 ? 'block' : 'none';
        if (finishSheetButton) finishSheetButton.style.display = step === 4 ? 'block' : 'none';
        
        this.currentStep = step;
        
        // Atualiza preview no passo 4
        if (step === 4) {
            this.updateCharacterPreview();
        }
    },
    
    // Validar passo atual
    validateCurrentStep: function() {
        const sheetNameInput = document.getElementById('sheetName');
        const sheetClassInput = document.getElementById('sheetClass');
        const sheetHpInput = document.getElementById('sheetHp');
        const sheetAcInput = document.getElementById('sheetAc');
        
        switch(this.currentStep) {
            case 1: // Informações básicas
                if (!sheetNameInput.value.trim()) {
                    alert('Por favor, digite um nome para o personagem.');
                    sheetNameInput.focus();
                    return false;
                }
                if (!sheetClassInput.value) {
                    alert('Por favor, selecione uma classe.');
                    sheetClassInput.focus();
                    return false;
                }
                break;
                
            case 2: // Atributos
                if (this.attributePoints < 0 || this.attributePoints > 27) {
                    alert('Você deve usar exatamente 27 pontos de atributo! Ajuste os valores.');
                    return false;
                }
                break;
                
            case 3: // Detalhes
                if (!sheetHpInput.value || parseInt(sheetHpInput.value) < 1) {
                    alert('PV deve ser um número positivo.');
                    sheetHpInput.focus();
                    return false;
                }
                if (!sheetAcInput.value || parseInt(sheetAcInput.value) < 1) {
                    alert('CA deve ser um número positivo.');
                    sheetAcInput.focus();
                    return false;
                }
                break;
        }
        return true;
    },
    
    // Atualizar preview do personagem
    updateCharacterPreview: function() {
        const sheetNameInput = document.getElementById('sheetName');
        const sheetRaceInput = document.getElementById('sheetRace');
        const sheetClassInput = document.getElementById('sheetClass');
        const sheetLevelInput = document.getElementById('sheetLevel');
        const sheetHpInput = document.getElementById('sheetHp');
        const sheetAcInput = document.getElementById('sheetAc');
        const sheetSpeedInput = document.getElementById('sheetSpeed');
        const sheetBackgroundInput = document.getElementById('sheetBackground');
        
        const previewName = document.getElementById('previewName');
        const previewAvatar = document.getElementById('previewAvatar');
        const previewRace = document.getElementById('previewRace');
        const previewClass = document.getElementById('previewClass');
        const previewLevel = document.getElementById('previewLevel');
        const previewHp = document.getElementById('previewHp');
        const previewAc = document.getElementById('previewAc');
        const previewSpeed = document.getElementById('previewSpeed');
        const previewBackground = document.getElementById('previewBackground');
        
        if (!previewName || !previewAvatar) return;
        
        const name = sheetNameInput.value.trim() || 'Sem nome';
        previewName.textContent = name;
        previewAvatar.textContent = name.charAt(0).toUpperCase();
        
        if (previewRace) previewRace.textContent = sheetRaceInput.value || 'Raça não definida';
        if (previewClass) previewClass.textContent = sheetClassInput.value || 'Classe';
        if (previewLevel) previewLevel.textContent = sheetLevelInput.value || '1';
        if (previewHp) previewHp.textContent = sheetHpInput.value || '10';
        if (previewAc) previewAc.textContent = sheetAcInput.value || '10';
        if (previewSpeed) previewSpeed.textContent = sheetSpeedInput.value || '9m';
        if (previewBackground) previewBackground.textContent = sheetBackgroundInput.value || 'Não definido';
        
        // Atualizar atributos no preview
        const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        attributes.forEach(attr => {
            const scoreInput = document.getElementById(`${attr}Score`);
            const previewElement = document.getElementById(`preview${attr.charAt(0).toUpperCase() + attr.slice(1)}`);
            
            if (scoreInput && previewElement) {
                const score = parseInt(scoreInput.value) || 10;
                const mod = Utils.calculateAttributeModifier(score);
                previewElement.textContent = `${score} (${Utils.formatModifier(mod)})`;
            }
        });
    },
    
    // =================== FUNÇÕES DE ATRIBUTOS ===================
    
    // Atualizar modificadores de atributos
    updateAttributeModifiers: function() {
        const attributes = {
            str: document.getElementById('strScore'),
            dex: document.getElementById('dexScore'),
            con: document.getElementById('conScore'),
            int: document.getElementById('intScore'),
            wis: document.getElementById('wisScore'),
            cha: document.getElementById('chaScore')
        };
        
        for (const [attr, input] of Object.entries(attributes)) {
            if (input) {
                const score = parseInt(input.value) || 10;
                const mod = Utils.calculateAttributeModifier(score);
                const modElement = document.getElementById(`${attr}Mod`);
                if (modElement) {
                    modElement.textContent = Utils.formatModifier(mod);
                }
            }
        }
    },
    
    // Atualizar pontos de atributo
    updateAttributePoints: function() {
        const baseCost = 27;
        const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        let totalCost = 0;
        
        attributes.forEach(attr => {
            const input = document.getElementById(`${attr}Score`);
            if (input) {
                const score = parseInt(input.value) || 10;
                totalCost += Utils.getAttributeCost(score);
            }
        });
        
        this.attributePoints = baseCost - totalCost;
        const attrPointsElement = document.getElementById('attrPoints');
        if (attrPointsElement) {
            attrPointsElement.textContent = this.attributePoints;
        }
        
        // Atualizar estado dos botões
        document.querySelectorAll('.attr-increase').forEach(btn => {
            const attribute = btn.closest('.attribute-card').dataset.attribute;
            const currentValue = parseInt(document.getElementById(`${attribute}Score`)?.value) || 10;
            btn.disabled = this.attributePoints <= 0 || currentValue >= 18;
        });
        
        document.querySelectorAll('.attr-decrease').forEach(btn => {
            const attribute = btn.closest('.attribute-card').dataset.attribute;
            const currentValue = parseInt(document.getElementById(`${attribute}Score`)?.value) || 10;
            btn.disabled = currentValue <= 8;
        });
    },
    
    // Aumentar atributo
    increaseAttribute: function(attribute) {
        if (this.attributePoints <= 0) return;
        
        const input = document.getElementById(`${attribute}Score`);
        if (!input) return;
        
        let value = parseInt(input.value) || 10;
        
        if (value < 18) {
            value++;
            input.value = value;
            this.updateAttributeModifiers();
            this.updateAttributePoints();
            if (this.currentStep === 4) this.updateCharacterPreview();
        }
    },
    
    // Diminuir atributo
    decreaseAttribute: function(attribute) {
        const input = document.getElementById(`${attribute}Score`);
        if (!input) return;
        
        let value = parseInt(input.value) || 10;
        
        if (value > 8) {
            value--;
            input.value = value;
            this.updateAttributeModifiers();
            this.updateAttributePoints();
            if (this.currentStep === 4) this.updateCharacterPreview();
        }
    },
    
    // =================== FUNÇÕES DE CRIAÇÃO/EDIÇÃO ===================
    
    // Criar novo personagem
    createNewCharacter: function() {
        this.currentSheetBeingEdited = null;
        
        // Resetar formulário
        const inputs = [
            'sheetName', 'sheetRace', 'sheetClass', 'sheetSubclass', 
            'sheetLevel', 'sheetHp', 'sheetAc', 'sheetSpeed', 'sheetBackground', 'sheetDescription'
        ];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'sheetLevel') element.value = '1';
                else if (id === 'sheetHp') element.value = '10';
                else if (id === 'sheetAc') element.value = '10';
                else if (id === 'sheetSpeed') element.value = '9m';
                else element.value = '';
            }
        });
        
        // Resetar atributos
        const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        attributes.forEach(attr => {
            const input = document.getElementById(`${attr}Score`);
            if (input) input.value = '10';
        });
        
        // Resetar subclasses
        const subclassSelect = document.getElementById('sheetSubclass');
        if (subclassSelect) {
            subclassSelect.innerHTML = '<option value="">Selecione uma classe primeiro</option>';
        }
        
        // Resetar cor
        this.selectedSheetColor = '#9d4edd';
        document.querySelectorAll('#new-character .sheet-color-picker .color-option').forEach((opt, index) => {
            if (index === 0) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        // Resetar pontos
        this.attributePoints = 27;
        this.updateAttributeModifiers();
        this.updateAttributePoints();
        
        // Ir para o primeiro passo
        this.goToStep(1);
        
        Notifications.addNotification('Nova ficha', 'Começando a criar um novo personagem', 'info', true);
    },
    
    // Editar ficha
    editSheet: function(sheetId) {
        const sheet = DataSystem.findSheetById(sheetId);
        if (!sheet) return;
        
        this.currentSheetBeingEdited = sheetId;
        
        // Preencher o formulário
        const inputs = {
            'sheetName': sheet.name || '',
            'sheetRace': sheet.race || '',
            'sheetClass': sheet.class || '',
            'sheetLevel': sheet.level || 1,
            'sheetHp': sheet.hp || 10,
            'sheetAc': sheet.ac || 10,
            'sheetSpeed': sheet.speed || '9m',
            'sheetBackground': sheet.background || '',
            'sheetDescription': sheet.description || ''
        };
        
        Object.entries(inputs).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
        
        // Atributos
        const attributes = {
            'str': sheet.str || 10,
            'dex': sheet.dex || 10,
            'con': sheet.con || 10,
            'int': sheet.int || 10,
            'wis': sheet.wis || 10,
            'cha': sheet.cha || 10
        };
        
        Object.entries(attributes).forEach(([attr, value]) => {
            const input = document.getElementById(`${attr}Score`);
            if (input) input.value = value;
        });
        
        // Cor da ficha
        this.selectedSheetColor = sheet.color || this.selectedSheetColor;
        document.querySelectorAll('#new-character .sheet-color-picker .color-option').forEach(opt => {
            if (opt.getAttribute('data-color') === this.selectedSheetColor) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        // Atualizar subclasses
        this.updateSheetSubclasses();
        if (sheet.subclass) {
            setTimeout(() => {
                const subclassInput = document.getElementById('sheetSubclass');
                if (subclassInput) subclassInput.value = sheet.subclass;
            }, 100);
        }
        
        // Atualizar pontos e modificadores
        this.updateAttributeModifiers();
        this.updateAttributePoints();
        
        // Ir para o primeiro passo
        this.goToStep(1);
        
        // Trocar para aba de criação
        this.switchToTab('new-character');
        
        Notifications.addNotification('Editando ficha', `Editando ${sheet.name}`, 'info', true);
    },
    
    // Finalizar criação da ficha
    finishCharacterSheet: async function() {
        if (!this.validateCurrentStep()) return;
        
        const sheetNameInput = document.getElementById('sheetName');
        const sheetRaceInput = document.getElementById('sheetRace');
        const sheetClassInput = document.getElementById('sheetClass');
        const sheetSubclassInput = document.getElementById('sheetSubclass');
        const sheetLevelInput = document.getElementById('sheetLevel');
        const sheetHpInput = document.getElementById('sheetHp');
        const sheetAcInput = document.getElementById('sheetAc');
        const sheetSpeedInput = document.getElementById('sheetSpeed');
        const sheetBackgroundInput = document.getElementById('sheetBackground');
        const sheetDescriptionInput = document.getElementById('sheetDescription');
        
        if (!sheetNameInput || !sheetClassInput) return;
        
        // Coletar dados
        const characterSheet = {
            id: this.currentSheetBeingEdited || Utils.generateId(),
            name: sheetNameInput.value.trim(),
            race: sheetRaceInput.value,
            class: sheetClassInput.value,
            subclass: sheetSubclassInput.value,
            level: parseInt(sheetLevelInput.value) || 1,
            hp: parseInt(sheetHpInput.value) || 10,
            maxHP: parseInt(sheetHpInput.value) || 10,
            ac: parseInt(sheetAcInput.value) || 10,
            speed: sheetSpeedInput.value || '9m',
            background: sheetBackgroundInput.value,
            description: sheetDescriptionInput.value.trim(),
            color: this.selectedSheetColor,
            // Atributos
            str: parseInt(document.getElementById('strScore').value) || 10,
            dex: parseInt(document.getElementById('dexScore').value) || 10,
            con: parseInt(document.getElementById('conScore').value) || 10,
            int: parseInt(document.getElementById('intScore').value) || 10,
            wis: parseInt(document.getElementById('wisScore').value) || 10,
            cha: parseInt(document.getElementById('chaScore').value) || 10,
            // Data
            created: this.currentSheetBeingEdited ? undefined : new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        if (!characterSheet.name) {
            alert('Por favor, digite um nome para o personagem.');
            sheetNameInput.focus();
            return;
        }
        
        if (!characterSheet.class) {
            alert('Por favor, selecione uma classe.');
            sheetClassInput.focus();
            return;
        }
        
        // Salvar ou atualizar
        if (this.currentSheetBeingEdited) {
            // Atualizar ficha existente
            const index = DataSystem.characterSheets.findIndex(s => s.id === this.currentSheetBeingEdited);
            if (index !== -1) {
                // Manter data de criação
                characterSheet.created = DataSystem.characterSheets[index].created;
                DataSystem.characterSheets[index] = characterSheet;
                Notifications.addNotification('Ficha atualizada', `${characterSheet.name} foi atualizado`, 'success');
            }
        } else {
            // Adicionar nova ficha
            DataSystem.characterSheets.push(characterSheet);
            Notifications.notifySheetCreated(characterSheet.name);
        }
        
        // Salvar e compartilhar
        await DataSystem.saveAllDataDebounced();
        
        // Trocar para aba de listagem
        this.switchToTab('sheets-list');
        
        // Resetar
        this.currentSheetBeingEdited = null;
    },
    
    // Cancelar criação
    cancelCharacterSheet: function() {
        if (confirm('Tem certeza que deseja cancelar a criação da ficha? Os dados não salvos serão perdidos.')) {
            this.switchToTab('sheets-list');
            this.currentSheetBeingEdited = null;
        }
    },
    
    // =================== FUNÇÕES AUXILIARES ===================
    
    // Deletar ficha
    deleteSheet: async function(sheetId) {
        if (!confirm('Tem certeza que deseja excluir esta ficha?')) return;
        
        const sheet = DataSystem.findSheetById(sheetId);
        if (!sheet) return;
        
        DataSystem.characterSheets = DataSystem.characterSheets.filter(s => s.id !== sheetId);
        
        // Salvar localmente e no servidor
        await DataSystem.saveAllDataDebounced();
        
        Notifications.addNotification('Ficha excluída', `${sheet.name} foi removido`, 'warning', true);
    },
    
    // Usar ficha na mesa
    useSheetInGame: function(sheetId) {
        const sheet = DataSystem.findSheetById(sheetId);
        if (!sheet) return;
        
        // Preencher campos do formulário principal
        const userNameInput = document.getElementById('userName');
        const characterClassInput = document.getElementById('characterClass');
        const characterSubclassInput = document.getElementById('characterSubclass');
        const initiativeModInput = document.getElementById('initiativeMod');
        
        if (userNameInput) userNameInput.value = sheet.name || '';
        
        // Classe e Subclasse
        if (characterClassInput) {
            characterClassInput.value = sheet.class || '';
            MessagesSystem.updateSubclasses();
            
            // Definir subclasse após um pequeno delay
            setTimeout(() => {
                if (characterSubclassInput && sheet.subclass) {
                    characterSubclassInput.value = sheet.subclass || '';
                }
            }, 100);
        }
        
        // Modificador de iniciativa baseado na Destreza
        if (initiativeModInput) {
            const dexMod = Utils.calculateAttributeModifier(sheet.dex || 10);
            initiativeModInput.value = dexMod;
        }
        
        // Definir a cor do usuário
        const userColor = sheet.color || this.selectedSheetColor;
        document.querySelectorAll('.user-color-picker .color-option').forEach(opt => {
            if (opt.getAttribute('data-color') === userColor) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        // Fechar modal
        this.closeModal();
        
        // Adicionar ação ao histórico automaticamente
        const actionText = `Personagem "${sheet.name}" entrou na mesa!`;
        const textInput = document.getElementById('textInput');
        if (textInput && !textInput.value.trim()) {
            textInput.value = actionText;
        }
        
        // Adicionar notificação
        Notifications.addNotification(
            'Ficha carregada na mesa', 
            `${sheet.name} (${sheet.class} Nv.${sheet.level}) está pronto para ação!`, 
            'success', 
            true
        );
        
        // Opcional: Adicionar registro automático ao diário
        const autoMessage = {
            id: Utils.generateId(),
            content: `${sheet.name} (${sheet.class} Nv.${sheet.level}) entrou na aventura!`,
            user_name: sheet.name,
            character_class: sheet.class,
            character_subclass: sheet.subclass,
            user_color: userColor,
            action_type: 'narrative',
            created_at: new Date().toISOString(),
            is_dice_roll: false
        };
        
        DataSystem.messages.push(autoMessage);
        MessagesSystem.updateListDisplay();
        DataSystem.saveAllDataDebounced();
    },
    
    // Criar ação rápida baseada na ficha
    createQuickAction: function(sheetId, actionType = 'narrative', customText = '') {
        const sheet = DataSystem.findSheetById(sheetId);
        if (!sheet) return;
        
        // Primeiro carrega a ficha na mesa
        this.useSheetInGame(sheetId);
        
        // Depois preenche ação baseada no tipo
        setTimeout(() => {
            this.createActionFromSheet(sheetId, actionType);
            this.closeModal();
        }, 300);
    },
    
    // Criar ação baseada na ficha
    createActionFromSheet: function(sheetId, actionType = 'narrative', customText = '') {
        const sheet = DataSystem.findSheetById(sheetId);
        if (!sheet) return;
        
        const userName = document.getElementById('userName')?.value.trim() || sheet.name || 'Aventureiro';
        const charClass = document.getElementById('characterClass')?.value || sheet.class || '';
        const charSubclass = document.getElementById('characterSubclass')?.value || sheet.subclass || '';
        
        // Se não houver texto personalizado, criar um padrão
        let actionText = customText;
        if (!actionText) {
            const actionTypes = {
                'attack': `prepara-se para o combate`,
                'magic': `prepara seus feitiços`,
                'skill': `se prepara para usar suas habilidades`,
                'dialog': `se apresenta ao grupo`,
                'narrative': `entra em cena`,
                'other': `se junta à aventura`
            };
            
            actionText = `${sheet.name} ${actionTypes[actionType] || 'entra na aventura'}`;
        }
        
        // Preencher campos
        const textInput = document.getElementById('textInput');
        const actionTypeInput = document.getElementById('actionType');
        
        if (textInput) textInput.value = actionText;
        if (actionTypeInput) actionTypeInput.value = actionType;
        
        // Focar no campo de descrição
        if (textInput) textInput.focus();
        
        Notifications.addNotification(
            'Ação preparada',
            `Pronto para registrar ação de ${sheet.name}`,
            'success',
            true
        );
    },
    
    // Trocar entre abas
    switchToTab: function(tabId) {
        // Remover classe active de todas as abas
        document.querySelectorAll('.sheet-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.sheet-tab-content').forEach(content => content.classList.remove('active'));
        
        // Adicionar classe active na aba selecionada
        const selectedTab = document.querySelector(`.sheet-tab[data-tab="${tabId}"]`);
        const selectedContent = document.getElementById(tabId);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedContent) selectedContent.classList.add('active');
        
        // Se for a aba de listagem, atualizar a exibição
        if (tabId === 'sheets-list') {
            this.updateSheetsDisplay();
        }
    },
    
    // Aplicar template
    applyTemplate: function(templateName) {
        const template = this.characterTemplates[templateName];
        if (!template) return;
        
        this.createNewCharacter();
        
        // Preencher com dados do template
        const inputs = {
            'sheetName': template.name,
            'sheetRace': template.race,
            'sheetClass': template.class,
            'sheetLevel': template.level,
            'sheetHp': template.hp,
            'sheetAc': template.ac,
            'sheetSpeed': template.speed,
            'sheetBackground': template.background
        };
        
        Object.entries(inputs).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
        
        // Atributos
        const attributes = {
            'str': template.str,
            'dex': template.dex,
            'con': template.con,
            'int': template.int,
            'wis': template.wis,
            'cha': template.cha
        };
        
        Object.entries(attributes).forEach(([attr, value]) => {
            const input = document.getElementById(`${attr}Score`);
            if (input) input.value = value;
        });
        
        // Cor
        this.selectedSheetColor = template.color;
        document.querySelectorAll('#new-character .sheet-color-picker .color-option').forEach(opt => {
            if (opt.getAttribute('data-color') === this.selectedSheetColor) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        // Atualizar subclasses
        this.updateSheetSubclasses();
        setTimeout(() => {
            const subclassInput = document.getElementById('sheetSubclass');
            if (subclassInput) subclassInput.value = template.subclass;
            this.updateAttributeModifiers();
            this.updateAttributePoints();
            this.updateCharacterPreview();
        }, 100);
        
        Notifications.addNotification('Template aplicado', `Template "${template.name}" carregado`, 'success', true);
    },
    
    // Atualizar subclasses
    updateSheetSubclasses: function() {
        const sheetClassInput = document.getElementById('sheetClass');
        const subclassSelect = document.getElementById('sheetSubclass');
        
        if (!sheetClassInput || !subclassSelect) return;
        
        const selectedClass = sheetClassInput.value;
        
        subclassSelect.innerHTML = '<option value="">Selecione uma subclasse...</option>';
        
        if (selectedClass && subclasses[selectedClass]) {
            subclasses[selectedClass].forEach(subclass => {
                const option = document.createElement('option');
                option.value = subclass;
                option.textContent = subclass;
                subclassSelect.appendChild(option);
            });
        }
    },
    
    // =================== INICIALIZAÇÃO ===================
    
    init: function() {
        console.log('SheetsSystem inicializado');
        
        // Atualizar display inicial
        this.updateSheetsDisplay();
        
        // Inicializar atributos
        this.updateAttributeModifiers();
        this.updateAttributePoints();
        
        // Configurar event listeners
        this.setupEventListeners();
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Abas das fichas
        document.querySelectorAll('.sheet-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                this.switchToTab(tabId);
            });
        });
        
        // Botão para criar nova ficha na aba de listagem
        const createNewSheetButton = document.getElementById('createNewSheetButton');
        if (createNewSheetButton) {
            createNewSheetButton.addEventListener('click', () => {
                this.createNewCharacter();
                this.switchToTab('new-character');
            });
        }
        
        // Botão para atualizar lista de fichas
        const refreshSheetsButton = document.getElementById('refreshSheetsButton');
        if (refreshSheetsButton) {
            refreshSheetsButton.addEventListener('click', async () => {
                refreshSheetsButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                await DataSystem.loadAllData();
                this.updateSheetsDisplay();
                setTimeout(() => {
                    refreshSheetsButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
                    Notifications.addNotification('Fichas sincronizadas', 
                                  'Dados atualizados do servidor', 
                                  'success', true);
                }, 500);
            });
        }
        
        // Filtros de fichas
        const sheetClassFilter = document.getElementById('sheetClassFilter');
        const sheetLevelFilter = document.getElementById('sheetLevelFilter');
        
        if (sheetClassFilter) {
            sheetClassFilter.addEventListener('change', () => this.updateSheetsDisplay());
        }
        
        if (sheetLevelFilter) {
            sheetLevelFilter.addEventListener('change', () => this.updateSheetsDisplay());
        }
        
        // Wizard de criação de ficha
        const prevStepButton = document.getElementById('prevStepButton');
        const nextStepButton = document.getElementById('nextStepButton');
        const finishSheetButton = document.getElementById('finishSheetButton');
        const cancelSheetButton = document.getElementById('cancelSheetButton');
        
        if (prevStepButton) {
            prevStepButton.addEventListener('click', () => this.goToStep(this.currentStep - 1));
        }
        
        if (nextStepButton) {
            nextStepButton.addEventListener('click', () => this.goToStep(this.currentStep + 1));
        }
        
        if (finishSheetButton) {
            finishSheetButton.addEventListener('click', () => this.finishCharacterSheet());
        }
        
        if (cancelSheetButton) {
            cancelSheetButton.addEventListener('click', () => this.cancelCharacterSheet());
        }
        
        // Botões de atributos
        document.querySelectorAll('.attr-decrease').forEach(btn => {
            btn.addEventListener('click', function() {
                const attribute = this.closest('.attribute-card').dataset.attribute;
                SheetsSystem.decreaseAttribute(attribute);
            });
        });
        
        document.querySelectorAll('.attr-increase').forEach(btn => {
            btn.addEventListener('click', function() {
                const attribute = this.closest('.attribute-card').dataset.attribute;
                SheetsSystem.increaseAttribute(attribute);
            });
        });
        
        // Botão para resetar atributos
        const resetAttributesButton = document.getElementById('resetAttributesButton');
        if (resetAttributesButton) {
            resetAttributesButton.addEventListener('click', () => {
                const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
                attributes.forEach(attr => {
                    const input = document.getElementById(`${attr}Score`);
                    if (input) input.value = '10';
                });
                this.updateAttributeModifiers();
                this.updateAttributePoints();
                if (this.currentStep === 4) this.updateCharacterPreview();
            });
        }
        
        // Wizard steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.addEventListener('click', () => {
                const stepNumber = parseInt(step.dataset.step);
                if (stepNumber < this.currentStep) {
                    this.goToStep(stepNumber);
                }
            });
        });
        
        // Atualizar subclasses quando a classe for alterada
        const sheetClassInput = document.getElementById('sheetClass');
        if (sheetClassInput) {
            sheetClassInput.addEventListener('change', () => {
                this.updateSheetSubclasses();
            });
        }
        
        // Atualizar atributos quando os valores mudarem
        ['strScore', 'dexScore', 'conScore', 'intScore', 'wisScore', 'chaScore'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => {
                    this.updateAttributeModifiers();
                    this.updateAttributePoints();
                    if (this.currentStep === 4) this.updateCharacterPreview();
                });
            }
        });
        
        // Atualizar preview quando os campos básicos mudarem
        ['sheetName', 'sheetRace', 'sheetClass', 'sheetSubclass', 
         'sheetLevel', 'sheetHp', 'sheetAc', 'sheetSpeed', 'sheetBackground'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    if (this.currentStep === 4) this.updateCharacterPreview();
                });
            }
        });
        
        // Selecionar cor da ficha
        document.querySelectorAll('#new-character .sheet-color-picker .color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('#new-character .sheet-color-picker .color-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
                this.selectedSheetColor = option.getAttribute('data-color');
                if (this.currentStep === 4) this.updateCharacterPreview();
            });
        });
        
        // Templates rápidos
        document.querySelectorAll('.use-template-btn').forEach(button => {
            button.addEventListener('click', function() {
                const templateName = this.getAttribute('data-template');
                SheetsSystem.applyTemplate(templateName);
            });
        });
        
        // Modal da ficha
        const closeSheetModal = document.querySelector('.close-sheet-modal');
        const closeModalButton = document.querySelector('.btn-close-modal');
        
        if (closeSheetModal) {
            closeSheetModal.addEventListener('click', this.closeModal);
        }
        
        if (closeModalButton) {
            closeModalButton.addEventListener('click', this.closeModal);
        }
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (event) => {
            const sheetModal = document.getElementById('sheetModal');
            if (sheetModal && event.target === sheetModal) {
                this.closeModal();
            }
        });
    }
};

// Exportar para uso global
window.SheetsSystem = SheetsSystem;
