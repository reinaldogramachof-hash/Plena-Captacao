// =============================================
// PLENA CAPTAÇÃO v1.0 - SISTEMA PRINCIPAL OTIMIZADO - CORRIGIDO
// =============================================

class PlenaCaptacaoSystem {
    constructor() {
        this.leads = JSON.parse(localStorage.getItem('plenaLeads')) || [];
        this.currentSection = 'dashboard';
        this.isLoading = false;
        this.init();
    }

    // ===== INICIALIZAÇÃO DO SISTEMA =====
    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupSearch();
        this.loadDashboardData();
        this.initializeCharts();
        
        console.log('🚀 Plena Captação v1.0 - Sistema Iniciado com Sucesso');
        this.showWelcomeNotification();
    }

    // ===== CONFIGURAÇÃO DE NAVEGAÇÃO =====
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (this.isLoading) return;
                
                // Remove active de todos os itens
                document.querySelectorAll('.nav-item').forEach(i => {
                    i.classList.remove('active');
                });
                
                // Adiciona active no item clicado
                item.classList.add('active');
                
                // Mostra a seção correspondente
                const targetSection = item.getAttribute('data-section');
                this.showSection(targetSection);
            });
        });

        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case '1':
                        this.showSection('dashboard');
                        break;
                    case '2':
                        this.showSection('leads');
                        break;
                    case '3':
                        this.showSection('strategies');
                        break;
                    case '4':
                        this.showSection('reports');
                        break;
                    case '5':
                        this.showSection('alerts');
                        break;
                }
            }
        });
    }

    // ===== MOSTRA SEÇÃO ESPECÍFICA =====
    showSection(sectionName) {
        if (this.isLoading) return;
        
        this.setLoading(true);
        
        // Esconde todas as seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostra a seção alvo
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            setTimeout(() => {
                targetSection.classList.add('active');
                this.currentSection = sectionName;
                
                // Atualiza o título da página
                document.title = `${this.getSectionTitle(sectionName)} - Plena Captação v1.0`;
                
                // Carrega dados específicos da seção
                this.loadSectionData(sectionName);
                this.setLoading(false);
            }, 300);
        }
    }

    // ===== RETORNA TÍTULO DA SEÇÃO =====
    getSectionTitle(sectionName) {
        const titles = {
            'dashboard': 'Dashboard Overview',
            'leads': 'Gestão de Leads',
            'strategies': 'Estratégias IA',
            'reports': 'Relatórios Avançados',
            'alerts': 'Central de Alertas'
        };
        return titles[sectionName] || 'Plena Captação';
    }

    // ===== CONTROLE DE LOADING =====
    setLoading(loading) {
        this.isLoading = loading;
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.toggle('loading', loading);
        }
    }

    // ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
    setupEventListeners() {
        // Fechar modais ao clicar fora
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Tecla Escape para fechar modais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Event listener para mudança de tema
        window.addEventListener('themeChanged', (e) => {
            this.refreshCharts();
            this.updateUIForTheme();
        });

        // Event listener para atualizações de leads
        window.addEventListener('leadsUpdated', () => {
            this.loadDashboardData();
            if (this.currentSection === 'leads') {
                this.loadLeadsData();
            }
        });

        // Filtros de leads
        this.setupLeadFilters();
    }

    // ===== CONFIGURA FILTROS DE LEADS =====
    setupLeadFilters() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const filter = e.target.getAttribute('data-filter');
                this.filterLeads(filter);
                
                // Atualiza estado dos botões
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
            }
        });
    }

    // ===== CONFIGURAÇÃO DO SISTEMA DE BUSCA =====
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                this.setLoading(true);
                
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value.trim());
                    this.setLoading(false);
                }, 500);
            });

            // Limpar busca
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    this.performSearch('');
                }
            });
        }
    }

    // ===== EXECUTA BUSCA =====
    performSearch(query) {
        if (!query) {
            this.loadSectionData(this.currentSection);
            return;
        }

        const lowerQuery = query.toLowerCase();
        
        switch(this.currentSection) {
            case 'leads':
                this.searchLeads(lowerQuery);
                break;
            case 'strategies':
                this.searchStrategies(lowerQuery);
                break;
            case 'reports':
                this.searchReports(lowerQuery);
                break;
            default:
                this.showNotification('Busca', `Buscando por "${query}" em ${this.currentSection}`, 'info');
        }
    }

    // ===== BUSCA EM LEADS =====
    searchLeads(query) {
        const filteredLeads = this.leads.filter(lead => 
            lead.name.toLowerCase().includes(query) ||
            lead.niche.toLowerCase().includes(query) ||
            lead.address.toLowerCase().includes(query) ||
            lead.category.toLowerCase().includes(query) ||
            lead.contact.includes(query)
        );
        
        this.renderLeads(filteredLeads);
        
        // Feedback visual
        if (query && filteredLeads.length === 0) {
            this.showNotification('Busca', `Nenhum lead encontrado para "${query}"`, 'info');
        }
    }

    // ===== BUSCA EM ESTRATÉGIAS =====
    searchStrategies(query) {
        const strategyCards = document.querySelectorAll('.recommendation-card');
        let found = false;
        
        strategyCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const isVisible = text.includes(query);
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) found = true;
        });
        
        if (!found && query) {
            this.showNotification('Busca', `Nenhuma estratégia encontrada para "${query}"`, 'info');
        }
    }

    // ===== BUSCA EM RELATÓRIOS =====
    searchReports(query) {
        // Implementar busca em relatórios
        console.log('Buscando em relatórios:', query);
    }

    // ===== CARREGA DADOS DA SEÇÃO =====
    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'leads':
                this.loadLeadsData();
                break;
            case 'strategies':
                this.loadStrategiesData();
                break;
            case 'reports':
                this.loadReportsData();
                break;
            case 'alerts':
                this.loadAlertsData();
                break;
        }
    }

    // ==================== DASHBOARD ====================

    loadDashboardData() {
        this.updateStats();
        this.loadAIRecommendations();
        this.initializeCharts();
        this.updateDashboardTime();
    }

    // ===== ATUALIZA ESTATÍSTICAS =====
    updateStats() {
        const totalLeads = this.leads.length;
        const criticalLeads = this.leads.filter(lead => lead.status === 'critical').length;
        const highPotentialLeads = this.leads.filter(lead => lead.potential >= 4).length;
        
        // Calcular taxa de conversão
        const convertedLeads = this.leads.filter(lead => 
            lead.contactStatus === 'closed_won' || lead.contactStatus === 'negotiation'
        ).length;
        const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

        // Atualizar elementos DOM com animação
        this.animateCounter('totalLeads', totalLeads);
        this.animateCounter('criticalLeads', criticalLeads);
        this.animateCounter('highPotential', highPotentialLeads);
        this.animateCounter('conversionRate', conversionRate, '%');
        
        // Ações pendentes vêm do sistema de notificações
        const pendingActions = notificationSystem?.notifications.filter(n => !n.read).length || 0;
        this.animateCounter('pendingActions', pendingActions);
    }

    // ===== ANIMA CONTADORES =====
    animateCounter(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const duration = 1000; // 1 segundo
        const steps = 60;
        const stepValue = (targetValue - currentValue) / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const value = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = value + suffix;

            if (currentStep >= steps) {
                element.textContent = targetValue + suffix;
                clearInterval(timer);
            }
        }, duration / steps);
    }

    // ===== ATUALIZA ELEMENTO DE TEXTO =====
    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    // ===== CARREGA RECOMENDAÇÕES DA IA =====
    loadAIRecommendations() {
        const recommendationsContainer = document.getElementById('aiRecommendations');
        if (!recommendationsContainer) return;

        const criticalLeads = this.leads.filter(lead => lead.status === 'critical');
        const neverContacted = this.leads.filter(lead => lead.lastContact === 'Nunca');
        const highPotential = this.leads.filter(lead => lead.potential >= 4);
        const recentLeads = this.leads.filter(lead => {
            const leadDate = new Date(lead.id);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return leadDate > weekAgo;
        });

        const recommendations = [
            {
                title: '🎯 Prioridade Máxima',
                content: `Você tem <strong>${criticalLeads.length} leads críticos</strong> que precisam de contato imediato. Estes são os que mais precisam de presença digital.`,
                priority: 'high'
            },
            {
                title: '💡 Oportunidade Imediata',
                content: `<strong>${neverContacted.length} leads</strong> nunca foram contactados. Contate hoje mesmo para máxima conversão.`,
                priority: 'medium'
            },
            {
                title: '🚀 Alto Potencial',
                content: `<strong>${highPotential.length} leads</strong> com alta probabilidade de fechamento. Foque nestes para resultados rápidos.`,
                priority: 'high'
            },
            {
                title: '📊 Estratégia do Dia',
                content: `Foque em <strong>profissionais liberais</strong> - taxa de conversão de 42% comprovada. Use o script de ligação específico.`,
                priority: 'medium'
            },
            {
                title: '🆕 Leads Recentes',
                content: `<strong>${recentLeads.length} novos leads</strong> adicionados esta semana. Mantenha o momentum!`,
                priority: 'low'
            }
        ];

        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card" data-priority="${rec.priority}">
                <h4>${rec.title}</h4>
                <p>${rec.content}</p>
            </div>
        `).join('');
    }

    // ===== ATUALIZA HORÁRIO DO DASHBOARD =====
    updateDashboardTime() {
        const now = new Date();
        const timeString = now.toLocaleString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const timeElement = document.getElementById('dashboardTime');
        if (timeElement) {
            timeElement.textContent = timeString.charAt(0).toUpperCase() + timeString.slice(1);
        }
    }

    // ==================== GRÁFICOS ====================

    // ===== INICIALIZA GRÁFICOS =====
    initializeCharts() {
        this.createPotentialChart();
        this.createNicheChart();
        this.createActivityChart();
    }

    // ===== GRÁFICO DE DISTRIBUIÇÃO POR POTENCIAL =====
    createPotentialChart() {
        const ctx = document.getElementById('potentialChart');
        if (!ctx) return;

        const potentialData = this.calculatePotentialDistribution();
        
        // Destruir gráfico existente se houver
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        const isDark = isDarkTheme();
        const textColor = isDark ? '#ffffff' : '#212529';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        ctx.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Alto (5⭐)', 'Médio-Alto (4⭐)', 'Médio (3⭐)', 'Baixo (1-2⭐)'],
                datasets: [{
                    data: potentialData,
                    backgroundColor: [
                        '#00C853', // Verde - Alto
                        '#FFB300', // Amarelo - Médio-Alto
                        '#FF4444', // Vermelho - Médio
                        '#6c757d'  // Cinza - Baixo
                    ],
                    borderWidth: 2,
                    borderColor: isDark ? '#2d2d2d' : '#ffffff',
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: textColor,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    // ===== GRÁFICO DE LEADS POR NICHO =====
    createNicheChart() {
        const ctx = document.getElementById('nicheChart');
        if (!ctx) return;

        const nicheData = this.calculateNicheDistribution();

        // Destruir gráfico existente se houver
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        const isDark = isDarkTheme();
        const textColor = isDark ? '#ffffff' : '#212529';

        ctx.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: nicheData.labels,
                datasets: [{
                    data: nicheData.values,
                    backgroundColor: [
                        '#FF6B35', '#2196F3', '#00C853', 
                        '#FFB300', '#9C27B0', '#607D8B',
                        '#795548', '#009688', '#E91E63'
                    ],
                    borderWidth: 2,
                    borderColor: isDark ? '#2d2d2d' : '#ffffff',
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            color: textColor,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    // ===== GRÁFICO DE ATIVIDADE =====
    createActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        const activityData = this.calculateActivityData();

        // Destruir gráfico existente se houver
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        const isDark = isDarkTheme();
        const textColor = isDark ? '#ffffff' : '#212529';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        ctx.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: activityData.labels,
                datasets: [{
                    label: 'Leads Adicionados',
                    data: activityData.values,
                    borderColor: '#FF6B35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FF6B35',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    x: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
    }

    // ===== CALCULA DISTRIBUIÇÃO POR POTENCIAL =====
    calculatePotentialDistribution() {
        const high = this.leads.filter(lead => lead.potential === 5).length;
        const mediumHigh = this.leads.filter(lead => lead.potential === 4).length;
        const medium = this.leads.filter(lead => lead.potential === 3).length;
        const low = this.leads.filter(lead => lead.potential <= 2).length;
        
        return [high, mediumHigh, medium, low];
    }

    // ===== CALCULA DISTRIBUIÇÃO POR NICHO =====
    calculateNicheDistribution() {
        const niches = {};
        
        this.leads.forEach(lead => {
            niches[lead.category] = (niches[lead.category] || 0) + 1;
        });
        
        return {
            labels: Object.keys(niches),
            values: Object.values(niches)
        };
    }

    // ===== CALCULA DADOS DE ATIVIDADE =====
    calculateActivityData() {
        // Simula dados de atividade dos últimos 7 dias
        const labels = [];
        const values = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('pt-BR', { weekday: 'short' }));
            
            // Simula leads adicionados nesse dia
            const leadsThisDay = this.leads.filter(lead => {
                const leadDate = new Date(lead.id);
                return leadDate.toDateString() === date.toDateString();
            }).length;
            
            values.push(leadsThisDay || Math.floor(Math.random() * 5));
        }
        
        return { labels, values };
    }

    // ===== ATUALIZA GRÁFICOS =====
    refreshCharts() {
        // Remove gráficos existentes
        const charts = ['potentialChart', 'nicheChart', 'activityChart'];
        charts.forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas && canvas.chart) {
                canvas.chart.destroy();
            }
        });
        
        // Recria gráficos
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
    }

    // ===== ATUALIZA UI PARA O TEMA =====
    updateUIForTheme() {
        // Atualiza cores específicas baseadas no tema
        const elements = document.querySelectorAll('[data-theme-update]');
        elements.forEach(element => {
            const attribute = element.getAttribute('data-theme-update');
            // Implementar atualizações específicas de tema se necessário
        });
    }

    // ==================== LEADS ====================

    // ===== CARREGA DADOS DE LEADS =====
    loadLeadsData() {
        this.renderLeads(this.leads);
        this.updateLeadsStats();
    }

    // ===== ATUALIZA ESTATÍSTICAS DE LEADS =====
    updateLeadsStats() {
        const total = this.leads.length;
        const contacted = this.leads.filter(lead => lead.lastContact !== 'Nunca').length;
        const neverContacted = this.leads.filter(lead => lead.lastContact === 'Nunca').length;
        
        document.getElementById('leadsTotal')?.textContent = total;
        document.getElementById('leadsContacted')?.textContent = contacted;
        document.getElementById('leadsNeverContacted')?.textContent = neverContacted;
    }

    // ===== RENDERIZA LEADS =====
    renderLeads(leadsToRender = this.leads) {
        const container = document.getElementById('leadsContainer');
        if (!container) return;

        if (leadsToRender.length === 0) {
            container.innerHTML = this.getEmptyLeadsState();
            return;
        }

        container.innerHTML = leadsToRender.map(lead => this.createLeadCard(lead)).join('');
    }

    // ===== ESTADO VAZIO DE LEADS =====
    getEmptyLeadsState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3>Nenhum lead cadastrado</h3>
                <p>Comece adicionando seu primeiro lead para ver os dados aqui.</p>
                <button class="btn btn-primary" onclick="openAddLeadModal()">
                    <i class="fas fa-plus"></i> Adicionar Primeiro Lead
                </button>
                <button class="btn btn-outline" onclick="plenaSystem.addSampleLeads()" style="margin-top: 10px;">
                    <i class="fas fa-magic"></i> Carregar Dados de Exemplo
                </button>
            </div>
        `;
    }

    // ===== CRIA CARD DE LEAD =====
    createLeadCard(lead) {
        const badgeClass = this.getBadgeClass(lead.potential);
        const statusClass = this.getStatusClass(lead.status);
        const daysSinceContact = this.getDaysSinceContact(lead.lastContact);
        
        return `
            <div class="lead-card ${statusClass}" onclick="plenaSystem.openLeadDetails(${lead.id})">
                <div class="lead-header">
                    <div>
                        <div class="lead-name">${lead.name}</div>
                        <span class="lead-niche">${lead.niche}</span>
                    </div>
                    <span class="lead-badge ${badgeClass}">
                        ${lead.potential}⭐
                    </span>
                </div>
                
                <div class="lead-info">
                    <div><i class="fas fa-phone"></i> ${lead.contact}</div>
                    <div><i class="fas fa-map-marker-alt"></i> ${lead.address}</div>
                    <div><i class="fas fa-clock"></i> ${this.formatLastContact(lead.lastContact, daysSinceContact)}</div>
                </div>

                <div class="progress-container">
                    <div class="progress-label">
                        <span>Probabilidade de Conversão</span>
                        <span>${lead.conversionProbability}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${lead.conversionProbability}%"></div>
                    </div>
                </div>

                <div class="lead-next-action">
                    <strong>Próxima ação:</strong> ${lead.nextAction}
                </div>

                <div class="lead-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); plenaSystem.contactLead(${lead.id})">
                        <i class="fas fa-phone"></i> Ligar Agora
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); plenaSystem.openLeadDetails(${lead.id})">
                        <i class="fas fa-edit"></i> Gerenciar
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); plenaSystem.viewStrategy(${lead.id})">
                        <i class="fas fa-chess-knight"></i> Estratégia
                    </button>
                </div>
            </div>
        `;
    }

    // ===== RETORNA CLASSE DO BADGE =====
    getBadgeClass(potential) {
        if (potential >= 4.5) return 'badge-high';
        if (potential >= 3.5) return 'badge-medium';
        return 'badge-critical';
    }

    // ===== RETORNA CLASSE DE STATUS =====
    getStatusClass(status) {
        return status === 'critical' ? 'critical' : status === 'high' ? 'high' : '';
    }

    // ===== CALCULA DIAS DESDE O ÚLTIMO CONTATO =====
    getDaysSinceContact(lastContact) {
        if (lastContact === 'Nunca') return Infinity;
        // Implementar cálculo real baseado em datas
        return Math.floor(Math.random() * 30); // Simulação
    }

    // ===== FORMATA ÚLTIMO CONTATO =====
    formatLastContact(lastContact, daysSince) {
        if (lastContact === 'Nunca') return 'Nunca contactado';
        if (daysSince === 0) return 'Hoje';
        if (daysSince === 1) return 'Ontem';
        return `Há ${daysSince} dias`;
    }

    // ===== FILTRA LEADS =====
    filterLeads(filterType) {
        let filteredLeads = [];
        
        switch(filterType) {
            case 'all':
                filteredLeads = this.leads;
                break;
            case 'critical':
                filteredLeads = this.leads.filter(lead => lead.status === 'critical');
                break;
            case 'high':
                filteredLeads = this.leads.filter(lead => lead.potential >= 4);
                break;
            case 'never-contacted':
                filteredLeads = this.leads.filter(lead => lead.lastContact === 'Nunca');
                break;
            case 'recent':
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                filteredLeads = this.leads.filter(lead => new Date(lead.id) > weekAgo);
                break;
            default:
                filteredLeads = this.leads;
        }
        
        this.renderLeads(filteredLeads);
    }

    // ===== ABRE DETALHES DO LEAD =====
    openLeadDetails(leadId) {
        const lead = this.leads.find(l => l.id === leadId);
        if (!lead) return;

        // Implementar modal de detalhes
        this.showLeadDetailsModal(lead);
    }

    // ===== MOSTRA MODAL DE DETALHES =====
    showLeadDetailsModal(lead) {
        // Aqui você implementaria o modal de detalhes completo
        const strategy = window.iaAssistant?.generateStrategy(lead) || { scriptLigacao: 'Estratégia padrão' };
        
        alert(`📋 DETALHES DO LEAD: ${lead.name}\n\n` +
              `📞 Contato: ${lead.contact}\n` +
              `🏢 Nicho: ${lead.niche}\n` +
              `📍 Endereço: ${lead.address}\n` +
              `⭐ Potencial: ${lead.potential}/5\n` +
              `🎯 Probabilidade: ${lead.conversionProbability}%\n\n` +
              `💡 ESTRATÉGIA SUGERIDA:\n${strategy.scriptLigacao}`);
    }

    // ===== CONTATA LEAD =====
    contactLead(leadId) {
        const lead = this.leads.find(l => l.id === leadId);
        if (!lead) return;

        const strategy = window.iaAssistant?.generateStrategy(lead) || { 
            scriptLigacao: 'Olá, gostaria de conversar sobre como podemos melhorar sua presença digital.' 
        };
        
        // Atualiza último contato
        lead.lastContact = new Date().toLocaleDateString('pt-BR');
        this.saveLeads();
        
        this.showNotification('Ligação', `Discando para: ${lead.name}`, 'info');
        
        setTimeout(() => {
            alert(`📞 LIGANDO PARA: ${lead.name}\n\n` +
                  `📱 ${lead.contact}\n\n` +
                  `🎯 ESTRATÉGIA SUGERIDA:\n${strategy.scriptLigacao}\n\n` +
                  `💡 Dica: Anote o resultado do contato no sistema.`);
        }, 1000);
    }

    // ===== VISUALIZA ESTRATÉGIA DO LEAD =====
    viewStrategy(leadId) {
        const lead = this.leads.find(l => l.id === leadId);
        if (!lead) return;

        const strategy = window.iaAssistant?.generateStrategy(lead) || { 
            scriptLigacao: 'Estratégia personalizada será implementada na próxima versão.' 
        };
        
        alert(`🎯 ESTRATÉGIA PARA: ${lead.name}\n\n` +
              `📞 Script de Ligação:\n${strategy.scriptLigacao}\n\n` +
              `✉️ Email Sugerido:\n${strategy.emailTemplate || 'Template de email será implementado.'}\n\n` +
              `🛡️ Tratativa de Objeções:\n${strategy.objecaoHandling || 'Tratativa de objeções será implementada.'}`);
    }

    // ==================== FUNÇÕES GLOBAIS ====================

    // ===== ADICIONA LEADS DE EXEMPLO =====
    addSampleLeads() {
        const sampleLeads = [
            {
                id: Date.now() + 1,
                name: "DRA. FERNANDA SILVA - ODONTOLOGIA",
                niche: "Odontologia Geral",
                address: "Rua das Flores, 123 - Centro, São José dos Campos",
                contact: "(12) 3923-4578",
                potential: 5,
                status: "critical",
                category: "Profissionais Liberais",
                conversionProbability: 92,
                notes: "12 anos de mercado, excelente reputação, ZERO presença digital.",
                lastContact: "Nunca",
                nextAction: "Contato urgente - Alto potencial",
                contactHistory: [],
                contactStatus: "pending",
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                name: "MECÂNICA SÃO JOSÉ",
                niche: "Oficina Mecânica",
                address: "Av. Heitor Villa Lobos, 567 - Campos de São José",
                contact: "(12) 3928-3344",
                potential: 4,
                status: "high",
                category: "Serviços Especializados",
                conversionProbability: 76,
                notes: "Google Meu Negócio incompleto, sem fotos.",
                lastContact: "1 mês atrás",
                nextAction: "Demonstração sistema agendamento",
                contactHistory: [],
                contactStatus: "pending",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: Date.now() + 3,
                name: "ACADEMIA FORTE E FORMA",
                niche: "Academia",
                address: "Rua XV de Novembro, 789 - Santana",
                contact: "(12) 3945-6677",
                potential: 3,
                status: "medium",
                category: "Saúde e Bem-estar",
                conversionProbability: 65,
                notes: "Boa localização, precisa de site responsivo.",
                lastContact: "2 semanas atrás",
                nextAction: "Enviar proposta site",
                contactHistory: [],
                contactStatus: "contacted",
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        this.leads = [...sampleLeads, ...this.leads];
        this.saveLeads();
        this.loadDashboardData();
        
        if (this.currentSection === 'leads') {
            this.loadLeadsData();
        }
        
        this.showNotification('Sucesso', '3 leads de exemplo adicionados com sucesso!', 'success');
    }

    // ===== SALVA LEADS =====
    saveLeads() {
        localStorage.setItem('plenaLeads', JSON.stringify(this.leads));
        window.dispatchEvent(new CustomEvent('leadsUpdated'));
    }

    // ===== NOTIFICAÇÃO DE BOAS-VINDAS =====
    showWelcomeNotification() {
        setTimeout(() => {
            if (notificationSystem) {
                notificationSystem.showInfoNotification(
                    'Bem-vindo ao Plena Captação!',
                    'Sistema carregado com sucesso. Comece explorando o dashboard ou adicione seus primeiros leads.'
                );
            }
        }, 2000);
    }

    // ===== MOSTRA NOTIFICAÇÃO =====
    showNotification(title, message, type = 'info') {
        if (notificationSystem) {
            notificationSystem.addNotification({
                title: title,
                message: message,
                type: type,
                relatedTo: this.currentSection,
                timestamp: new Date(),
                read: false
            });
        }
    }

    // ===== FECHA MODAIS =====
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // ==================== SEÇÕES ESPECÍFICAS ====================

    loadStrategiesData() {
        // Carrega estratégias padrão
        console.log('Estratégias carregadas');
    }

    loadReportsData() {
        // Inicializa relatórios
        this.initializeReportCharts();
    }

    loadAlertsData() {
        // Garante que as notificações estão atualizadas
        if (notificationSystem) {
            notificationSystem.renderNotifications();
        }
    }

    // ===== INICIALIZA GRÁFICOS DE RELATÓRIOS =====
    initializeReportCharts() {
        // Implementar gráficos específicos de relatórios
        console.log('Gráficos de relatórios inicializados');
    }
}

// ===== FUNÇÕES GLOBAIS =====
function openAddLeadModal() {
    const modal = document.getElementById('addLeadModal');
    if (modal) {
        modal.style.display = 'flex';
        // Foca no primeiro campo
        const nameInput = document.getElementById('newLeadName');
        if (nameInput) {
            setTimeout(() => nameInput.focus(), 300);
        }
    }
}

function showTodaysStrategy() {
    const strategy = window.iaAssistant?.generateStrategy({
        nicho: 'Profissionais Liberais',
        name: 'Lead do Dia'
    }) || { scriptLigacao: 'Estratégia do dia será implementada na próxima versão.' };
    
    alert(`🎯 ESTRATÉGIA DO DIA - Profissionais Liberais\n\n${strategy.scriptLigacao}`);
}

function generateQuickReport() {
    const totalLeads = plenaSystem.leads.length;
    const criticalLeads = plenaSystem.leads.filter(lead => lead.status === 'critical').length;
    const contactedLeads = plenaSystem.leads.filter(lead => lead.lastContact !== 'Nunca').length;
    const conversionRate = plenaSystem.leads.filter(lead => 
        lead.contactStatus === 'closed_won' || lead.contactStatus === 'negotiation'
    ).length;
    
    alert(`📊 RELATÓRIO RÁPIDO - ${new Date().toLocaleDateString('pt-BR')}\n\n` +
          `• Total de Leads: ${totalLeads}\n` +
          `• Leads Críticos: ${criticalLeads}\n` +
          `• Leads Contactados: ${contactedLeads}\n` +
          `• Em Negociação: ${conversionRate}\n\n` +
          `💡 Próximas Ações:\n` +
          `- Focar nos ${criticalLeads} leads críticos\n` +
          `- Contactar ${totalLeads - contactedLeads} leads pendentes\n` +
          `- Acompanhar ${conversionRate} negociações`);
}

function runIAProspecting() {
    alert('🤖 IA DE PROSPECÇÃO\n\n' +
          'Funcionalidade em desenvolvimento:\n' +
          '• Busca inteligente por novos leads\n' +
          '• Análise de mercado automatizada\n' +
          '• Sugestões de nichos promissores\n' +
          '• Geração automática de contatos\n\n' +
          'Disponível na próxima atualização!');
}

// ===== INICIALIZAÇÃO DO SISTEMA =====
document.addEventListener('DOMContentLoaded', () => {
    window.plenaSystem = new PlenaCaptacaoSystem();
    
    // Adiciona leads de exemplo se não houver leads
    setTimeout(() => {
        if (plenaSystem.leads.length === 0) {
            if (confirm('Deseja carregar dados de exemplo para testar o sistema?')) {
                plenaSystem.addSampleLeads();
            }
        }
    }, 1000);
});

// ===== EXPORT PARA USO GLOBAL =====
window.PlenaCaptacaoSystem = PlenaCaptacaoSystem;

// ===== TRATAMENTO DE ERROS GLOBAL =====
window.addEventListener('error', (e) => {
    console.error('Erro global capturado:', e.error);
    if (notificationSystem) {
        notificationSystem.showErrorNotification(
            'Erro no Sistema',
            'Ocorreu um erro inesperado. Recarregue a página se o problema persistir.'
        );
    }
});

// ===== OFFLINE SUPPORT =====
window.addEventListener('online', () => {
    if (notificationSystem) {
        notificationSystem.showSuccessNotification('Conexão Restaurada', 'Sistema sincronizado com sucesso.');
    }
});

window.addEventListener('offline', () => {
    if (notificationSystem) {
        notificationSystem.showWarningNotification('Modo Offline', 'Algumas funcionalidades podem estar limitadas.');
    }
});