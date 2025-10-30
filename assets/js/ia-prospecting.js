/**
 * IA de Prospecção Inteligente
 * Sistema de busca e análise de leads potenciais
 * @version 2.1
 */

class IAProspecting {
    constructor() {
        this.isSearching = false;
        this.currentResults = [];
        this.searchConfig = {
            niche: 'Profissionais Liberais',
            location: 'São José dos Campos',
            filters: {
                digitalPresence: true,
                recentBusiness: true,
                highPotential: false
            }
        };
        
        this.init();
    }

    init() {
        console.log('🔍 IA Prospecting inicializada');
        this.bindEvents();
        this.loadConfig();
    }

    bindEvents() {
        // Eventos são bindados via HTML onclick
    }

    loadConfig() {
        const saved = localStorage.getItem('iaProspectingConfig');
        if (saved) {
            this.searchConfig = { ...this.searchConfig, ...JSON.parse(saved) };
            this.updateUIFromConfig();
        }
    }

    saveConfig() {
        localStorage.setItem('iaProspectingConfig', JSON.stringify(this.searchConfig));
    }

    updateUIFromConfig() {
        const nicheSelect = document.getElementById('prospectNiche');
        const locationInput = document.getElementById('prospectLocation');
        const digitalFilter = document.getElementById('filterDigital');
        const recentFilter = document.getElementById('filterRecent');
        const highPotentialFilter = document.getElementById('filterHighPotential');

        if (nicheSelect) nicheSelect.value = this.searchConfig.niche;
        if (locationInput) locationInput.value = this.searchConfig.location;
        if (digitalFilter) digitalFilter.checked = this.searchConfig.filters.digitalPresence;
        if (recentFilter) recentFilter.checked = this.searchConfig.filters.recentBusiness;
        if (highPotentialFilter) highPotentialFilter.checked = this.searchConfig.filters.highPotential;
    }

    updateConfigFromUI() {
        const nicheSelect = document.getElementById('prospectNiche');
        const locationInput = document.getElementById('prospectLocation');
        const digitalFilter = document.getElementById('filterDigital');
        const recentFilter = document.getElementById('filterRecent');
        const highPotentialFilter = document.getElementById('filterHighPotential');

        if (nicheSelect) this.searchConfig.niche = nicheSelect.value;
        if (locationInput) this.searchConfig.location = locationInput.value;
        if (digitalFilter) this.searchConfig.filters.digitalPresence = digitalFilter.checked;
        if (recentFilter) this.searchConfig.filters.recentBusiness = recentFilter.checked;
        if (highPotentialFilter) this.searchConfig.filters.highPotential = highPotentialFilter.checked;

        this.saveConfig();
    }

    startProspecting() {
        if (this.isSearching) {
            this.showNotification('Busca em andamento...', 'warning');
            return;
        }

        this.updateConfigFromUI();
        this.isSearching = true;

        this.showLoadingState();
        this.showNotification('Iniciando busca inteligente...', 'info');

        // Simulação de processamento com IA
        setTimeout(() => {
            this.executeSearch();
        }, 1500);
    }

    executeSearch() {
        try {
            const results = this.generateMockResults();
            this.currentResults = results;
            this.displayResults(results);
            this.isSearching = false;

            this.showNotification(`Encontrados ${results.length} leads potenciais!`, 'success');

            // Adiciona notificação de sucesso
            if (window.notificationSystem) {
                window.notificationSystem.showSuccessNotification(
                    'Busca IA Concluída',
                    `${results.length} novos leads encontrados no nicho ${this.searchConfig.niche}`
                );
            }

        } catch (error) {
            console.error('Erro na busca IA:', error);
            this.isSearching = false;
            this.showErrorState();
            this.showNotification('Erro na busca. Tente novamente.', 'error');
        }
    }

    generateMockResults() {
        const niches = {
            'Profissionais Liberais': [
                'Dr. João Silva - Cardiologista',
                'Dra. Maria Santos - Dermatologista',
                'Dr. Pedro Costa - Ortopedista',
                'Dra. Ana Oliveira - Pediatra',
                'Dr. Carlos Lima - Dentista'
            ],
            'Serviços Especializados': [
                'Elétrica Residencial São José',
                'Encanador Express 24h',
                'Dedetizadora Clean House',
                'Serralheria Forte',
                'Pintura Premium'
            ],
            'Comércio Local': [
                'Padaria Pão Quente',
                'Mercado Bom Preço',
                'Loja de Roupas Estilo',
                'Pet Shop Amigo Animal',
                'Farmácia Saúde Total'
            ],
            'Saúde e Bem-estar': [
                'Academia Corpo Ativo',
                'Studio Yoga & Paz',
                'Clínica Estética Bella',
                'Nutricionista Vida Saudável',
                'Massoterapia Relax'
            ]
        };

        const baseResults = niches[this.searchConfig.niche] || niches['Profissionais Liberais'];
        
        return baseResults.map((name, index) => ({
            id: Date.now() + index,
            name: name,
            niche: this.searchConfig.niche,
            address: this.generateMockAddress(),
            contact: this.generateMockPhone(),
            digitalPresence: this.generateDigitalPresence(),
            potential: Math.floor(Math.random() * 5) + 3,
            status: this.generateStatus(),
            conversionProbability: Math.floor(Math.random() * 30) + 60,
            notes: this.generateMockNotes(this.searchConfig.niche),
            lastContact: 'Nunca',
            nextAction: 'Primeiro contato',
            contactHistory: [],
            contactStatus: 'pending',
            createdAt: new Date().toISOString(),
            isNew: true
        }));
    }

    generateMockAddress() {
        const streets = ['Rua das Flores', 'Avenida São João', 'Rua XV de Novembro', 'Avenida Andrômeda', 'Rua Professor Moraes'];
        const numbers = ['123', '456', '789', '100', '200'];
        const neighborhoods = ['Centro', 'Jardim das Indústrias', 'Urbanova', 'Santana', 'Vila Ema'];
        
        return `${streets[Math.floor(Math.random() * streets.length)]}, ${numbers[Math.floor(Math.random() * numbers.length)]} - ${neighborhoods[Math.floor(Math.random() * neighborhoods.length)]}, São José dos Campos`;
    }

    generateMockPhone() {
        const ddd = '12';
        const prefixes = ['3456', '9876', '2345', '8765', '1234'];
        const suffixes = ['7890', '1234', '5678', '9012', '3456'];
        
        return `(${ddd}) ${prefixes[Math.floor(Math.random() * prefixes.length)]}-${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    }

    generateDigitalPresence() {
        const presences = [
            '',
            'instagram.com/negocio_local',
            'facebook.com/meunegocio',
            'meunegocio.com.br',
            'google.com/maps/place/negocio'
        ];
        return presences[Math.floor(Math.random() * presences.length)];
    }

    generateStatus() {
        const statuses = ['high', 'medium', 'critical'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    generateMockNotes(niche) {
        const notes = {
            'Profissionais Liberais': 'Profissional estabelecido, potencial para presença digital aprimorada',
            'Serviços Especializados': 'Serviço essencial, alta demanda local, pouca presença online',
            'Comércio Local': 'Estabelecimento tradicional, oportunidade para e-commerce',
            'Saúde e Bem-estar': 'Mercado em crescimento, clientes buscam agendamento online'
        };
        return notes[niche] || 'Lead com bom potencial para desenvolvimento digital';
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('prospectResults');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h4>Nenhum lead encontrado</h4>
                    <p>Tente ajustar os filtros de busca</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div class="results-header">
                <h4><i class="fas fa-list"></i> ${results.length} Leads Encontrados</h4>
                <button class="btn btn-sm btn-primary" onclick="iaProspecting.importAllResults()">
                    <i class="fas fa-download"></i> Importar Todos
                </button>
            </div>
            <div class="results-grid">
                ${results.map(lead => this.renderLeadCard(lead)).join('')}
            </div>
        `;
    }

    renderLeadCard(lead) {
        const statusIcons = {
            'high': '🟢',
            'medium': '🟡', 
            'critical': '🔴'
        };

        return `
            <div class="prospect-card" data-id="${lead.id}">
                <div class="prospect-header">
                    <h5>${lead.name}</h5>
                    <span class="status-badge ${lead.status}">
                        ${statusIcons[lead.status]} ${lead.potential}/5
                    </span>
                </div>
                
                <div class="prospect-info">
                    <p><i class="fas fa-tag"></i> ${lead.niche}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${lead.address.split(',')[0]}</p>
                    <p><i class="fas fa-phone"></i> ${lead.contact}</p>
                    ${lead.digitalPresence ? `<p><i class="fas fa-globe"></i> ${lead.digitalPresence}</p>` : '<p><i class="fas fa-globe" style="color: var(--danger);"></i> Sem presença digital</p>'}
                </div>
                
                <div class="prospect-notes">
                    <p>${lead.notes}</p>
                </div>
                
                <div class="prospect-actions">
                    <button class="btn btn-sm btn-outline" onclick="iaProspecting.importSingleLead(${lead.id})">
                        <i class="fas fa-plus"></i> Importar
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="iaProspecting.viewLeadDetails(${lead.id})">
                        <i class="fas fa-eye"></i> Detalhes
                    </button>
                </div>
            </div>
        `;
    }

    importSingleLead(leadId) {
        const lead = this.currentResults.find(l => l.id === leadId);
        if (!lead) {
            this.showNotification('Lead não encontrado', 'error');
            return;
        }

        if (window.plenaSystem) {
            // Remove a flag isNew antes de importar
            const { isNew, ...leadToImport } = lead;
            
            window.plenaSystem.leads.unshift(leadToImport);
            window.plenaSystem.saveLeads();
            window.plenaSystem.loadDashboardData();
            window.plenaSystem.loadLeadsData();

            this.showNotification(`Lead "${lead.name}" importado com sucesso!`, 'success');
            
            // Remove o card da lista
            const card = document.querySelector(`.prospect-card[data-id="${leadId}"]`);
            if (card) {
                card.style.opacity = '0.5';
                card.querySelector('.prospect-actions').innerHTML = `
                    <span class="imported-badge">
                        <i class="fas fa-check"></i> Importado
                    </span>
                `;
            }
        } else {
            this.showNotification('Sistema principal não disponível', 'error');
        }
    }

    importAllResults() {
        if (this.currentResults.length === 0) {
            this.showNotification('Nenhum lead para importar', 'warning');
            return;
        }

        if (window.plenaSystem) {
            const leadsToImport = this.currentResults.map(lead => {
                const { isNew, ...cleanLead } = lead;
                return cleanLead;
            });

            window.plenaSystem.leads.unshift(...leadsToImport);
            window.plenaSystem.saveLeads();
            window.plenaSystem.loadDashboardData();
            window.plenaSystem.loadLeadsData();

            this.showNotification(`${leadsToImport.length} leads importados com sucesso!`, 'success');
            this.displayResults([]);
        } else {
            this.showNotification('Sistema principal não disponível', 'error');
        }
    }

    viewLeadDetails(leadId) {
        const lead = this.currentResults.find(l => l.id === leadId);
        if (!lead) return;

        const detailsHtml = `
            <div class="lead-details-modal">
                <h4>${lead.name}</h4>
                <div class="details-grid">
                    <div><strong>Nicho:</strong> ${lead.niche}</div>
                    <div><strong>Endereço:</strong> ${lead.address}</div>
                    <div><strong>Contato:</strong> ${lead.contact}</div>
                    <div><strong>Presença Digital:</strong> ${lead.digitalPresence || 'Nenhuma'}</div>
                    <div><strong>Potencial:</strong> ${lead.potential}/5</div>
                    <div><strong>Probabilidade de Conversão:</strong> ${lead.conversionProbability}%</div>
                </div>
                <div class="details-notes">
                    <strong>Observações:</strong>
                    <p>${lead.notes}</p>
                </div>
                <div class="details-actions">
                    <button class="btn btn-primary" onclick="iaProspecting.importSingleLead(${lead.id}); document.querySelector('.lead-details-modal').remove()">
                        Importar Lead
                    </button>
                    <button class="btn btn-outline" onclick="document.querySelector('.lead-details-modal').remove()">
                        Fechar
                    </button>
                </div>
            </div>
        `;

        // Remove modal existente
        const existingModal = document.querySelector('.lead-details-modal');
        if (existingModal) existingModal.remove();

        // Adiciona novo modal
        const resultsContainer = document.getElementById('prospectResults');
        const modal = document.createElement('div');
        modal.innerHTML = detailsHtml;
        resultsContainer.appendChild(modal.firstElementChild);
    }

    showLoadingState() {
        const resultsContainer = document.getElementById('prospectResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <h4>Buscando leads inteligentes...</h4>
                <p>Analisando mercado local e identificando oportunidades</p>
                <div class="loading-steps">
                    <div class="step active"><i class="fas fa-search"></i> Mapeando área</div>
                    <div class="step"><i class="fas fa-filter"></i> Aplicando filtros</div>
                    <div class="step"><i class="fas fa-brain"></i> Analisando potencial</div>
                </div>
            </div>
        `;

        // Anima os steps
        let currentStep = 0;
        const steps = document.querySelectorAll('.loading-steps .step');
        const interval = setInterval(() => {
            if (currentStep > 0) {
                steps[currentStep - 1].classList.remove('active');
            }
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                currentStep++;
            } else {
                clearInterval(interval);
            }
        }, 800);
    }

    showErrorState() {
        const resultsContainer = document.getElementById('prospectResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Erro na Busca</h4>
                <p>Não foi possível completar a busca. Verifique sua conexão e tente novamente.</p>
                <button class="btn btn-primary" onclick="iaProspecting.startProspecting()">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification('IA Prospecção', message, type);
        } else {
            console.log(`🔍 IA Prospecting: ${message}`);
        }
    }

    // Método para integração com o sistema principal
    integrateWithMainSystem() {
        if (window.plenaSystem) {
            console.log('✅ IA Prospecting integrada com sistema principal');
        }
    }

    // Gera relatório de performance da IA
    generatePerformanceReport() {
        return {
            totalSearches: parseInt(localStorage.getItem('iaTotalSearches') || '0'),
            totalLeadsFound: parseInt(localStorage.getItem('iaTotalLeadsFound') || '0'),
            mostSearchedNiche: localStorage.getItem('iaMostSearchedNiche') || 'Profissionais Liberais',
            lastSearch: localStorage.getItem('iaLastSearch') || 'Nunca'
        };
    }
}

// Inicialização global
window.iaProspecting = new IAProspecting();

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IAProspecting;
}
// Adicione esta linha no final do arquivo ia-prospecting.js (após a classe)

// Inicialização e integração automática
document.addEventListener('DOMContentLoaded', function() {
    // Garante que o modal existe no DOM
    if (!document.getElementById('iaProspectModal')) {
        console.warn('Modal IA Prospecção não encontrado no DOM');
        return;
    }
    
    // Inicializa a IA de Prospecção
    window.iaProspecting = new IAProspecting();
    
    // Integra com o sistema principal após carregamento
    setTimeout(() => {
        if (window.iaProspecting) {
            window.iaProspecting.integrateWithMainSystem();
        }
    }, 1000);
    
    console.log('✅ IA Prospecting inicializada e integrada');
});