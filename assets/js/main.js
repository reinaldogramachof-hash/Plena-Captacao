// assets/js/main.js
// Plena Informática - Sistema de Captação de clientes v1.6.1

(function () {
    console.log("🧠 Plena Informática - Sistema inicializando...");

    // =============== SISTEMA DE PERFORMANCE ===============
    const performanceMetrics = {
        startTime: Date.now(),
        chartRenderTime: 0,
        leadLoadTime: 0,
        lastChartUpdate: 0
    };

    function trackPerformance(metric, startTime) {
        const duration = Date.now() - startTime;
        performanceMetrics[metric] = duration;
        
        if (duration > 1000) {
            console.warn(`⚠️ Performance: ${metric} levou ${duration}ms`);
        }
        
        return duration;
    }

    // =============== CACHE E DEBOUNCE ===============
    let chartUpdateTimeout;
    let chartCache = {
        lastUpdate: 0,
        dataHash: ''
    };

    function debouncedRenderCharts() {
        clearTimeout(chartUpdateTimeout);
        chartUpdateTimeout = setTimeout(() => {
            if (shouldUpdateCharts()) {
                renderCharts();
            }
        }, 300);
    }

    function shouldUpdateCharts() {
        const now = Date.now();
        const timeSinceLastUpdate = now - chartCache.lastUpdate;
        const leadsHash = JSON.stringify(window.plenaSystem.leads.map(l => ({ 
            id: l.id, 
            potential: l.potential,
            niche: l.niche,
            contactStatus: l.contactStatus
        })));
        
        return timeSinceLastUpdate > 30000 || chartCache.dataHash !== leadsHash;
    }

    // =============== FUNÇÕES AUXILIARES PARA CORES DOS GRÁFICOS ===============
    function getTextColor() {
        if (window.themeManager && window.themeManager.getChartTextColor) {
            return window.themeManager.getChartTextColor();
        }
        const html = document.documentElement;
        const theme = html.getAttribute("data-theme") || "dark";
        return theme === "dark" ? "#ffffff" : "#333333";
    }

    function getGridColor() {
        if (window.themeManager && window.themeManager.getChartGridColor) {
            return window.themeManager.getChartGridColor();
        }
        const html = document.documentElement;
        const theme = html.getAttribute("data-theme") || "dark";
        return theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    }

    function getBackgroundColor() {
        if (window.themeManager && window.themeManager.getChartBackgroundColor) {
            return window.themeManager.getChartBackgroundColor();
        }
        const html = document.documentElement;
        const theme = html.getAttribute("data-theme") || "dark";
        return theme === "dark" ? "#2e2e2e" : "#ffffff";
    }

    // =============== ESTADO GLOBAL DO SISTEMA ===============
    window.plenaSystem = {
        leads: [],
        currentSection: "dashboard",
        chartInstances: {},

        // Carrega leads do localStorage
        loadLeadsFromStorage() {
            const startTime = Date.now();
            try {
                const raw = localStorage.getItem("plena_leads");
                this.leads = raw ? JSON.parse(raw) : [];
                console.log(`📁 Leads carregados: ${this.leads.length} (${trackPerformance('leadLoad', startTime)}ms)`);
            } catch (err) {
                console.error("Erro ao carregar leads:", err);
                this.leads = [];
            }
        },

        // Salva leads no localStorage
        saveLeads() {
            try {
                localStorage.setItem("plena_leads", JSON.stringify(this.leads));
                console.log(`💾 Leads salvos: ${this.leads.length}`);
                
                // Atualiza hash do cache
                chartCache.dataHash = JSON.stringify(this.leads.map(l => ({ 
                    id: l.id, 
                    potential: l.potential,
                    niche: l.niche,
                    contactStatus: l.contactStatus
                })));
            } catch (err) {
                console.error("Erro ao salvar leads:", err);
            }
        },

        // Atualiza seção atual
        setSection(sectionId) {
            this.currentSection = sectionId;
        },

        // Carrega dados visuais de dashboard: contadores, oportunidades, gráficos
        loadDashboardData() {
            const startTime = Date.now();
            console.log("📊 Carregando dados do dashboard...");
            
            // Contadores
            const totalLeads = this.leads.length;
            const criticalLeads = this.leads.filter(l => l.status === "critical").length;
            const pendingActions = this.leads.filter(l => l.contactStatus === "pending").length;

            // taxa de conversão simples = leads fechados / total
            const closedWon = this.leads.filter(l => l.contactStatus === "closed_won").length;
            const conversionRate = totalLeads > 0
                ? Math.round((closedWon / totalLeads) * 100)
                : 0;

            // Popular dashboard
            setText("totalLeads", totalLeads);
            setText("criticalLeads", criticalLeads);
            setText("pendingActions", pendingActions);
            setText("conversionRate", conversionRate + "%");

            // Popular relatórios rápidos abaixo
            setText("reportTotalLeads", totalLeads);
            setText("reportConversion", conversionRate + "%");
            setText("reportResponseTime", "0h"); // mock inicial
            setText("reportPotential", calcularPotencialFinanceiro(this.leads));

            // Atualizar estatísticas rápidas da seção Leads
            setText("leadsTotal", totalLeads);
            setText("leadsContacted", this.leads.filter(l => l.lastContact !== "Nunca").length);
            setText("leadsNeverContacted", this.leads.filter(l => l.lastContact === "Nunca").length);

            // Atualiza alerta vermelho no menu lateral
            updateSidebarAlerts();

            // Atualiza área "Top Oportunidades do Dia"
            renderTopOpportunities();

            // Atualiza data/hora no topo do dashboard
            const timeEl = document.getElementById("dashboardTime");
            if (timeEl) {
                const agora = new Date();
                timeEl.textContent = `Última atualização: ${agora.toLocaleDateString(
                    "pt-BR"
                )} ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
            }

            // (Re)desenha gráficos com debounce
            debouncedRenderCharts();
            
            trackPerformance('dashboardLoad', startTime);
        },

        // Renderiza cards dos leads na tela "Gestão de Leads" com performance
        loadLeadsData(filter = "all") {
            const startTime = Date.now();
            console.log(`👥 Carregando leads com filtro: ${filter}`);
            const container = document.getElementById("leadsContainer");
            if (!container) {
                console.warn("Container de leads não encontrado");
                return;
            }

            // Mostrar skeleton loading
            container.innerHTML = `
                <div class="skeleton-loading" style="height: 100px; margin-bottom: 10px;"></div>
                <div class="skeleton-loading" style="height: 100px; margin-bottom: 10px;"></div>
                <div class="skeleton-loading" style="height: 100px;"></div>
            `;

            // Usar setTimeout para não travar a UI
            setTimeout(() => {
                container.innerHTML = "";
                let list = [...this.leads];

                // filtros
                if (filter === "critical") {
                    list = list.filter(l => l.status === "critical");
                }
                if (filter === "high") {
                    list = list.filter(l => l.potential >= 4 || l.conversionProbability >= 70);
                }
                if (filter === "never-contacted") {
                    list = list.filter(l => l.lastContact === "Nunca");
                }
                if (filter === "recent") {
                    list = list.slice(0, 10);
                }

                if (list.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">🤔</div>
                            <h3>Nenhum lead encontrado</h3>
                            <p>Tente ajustar os filtros ou cadastrar novos leads.</p>
                        </div>
                    `;
                    return;
                }

                // Usar documentFragment para performance
                const fragment = document.createDocumentFragment();

                list.forEach(lead => {
                    const badgeClass = getBadgeClass(lead);
                    const statusLabel = getStatusLabel(lead);

                    const card = document.createElement("div");
                    card.className = `lead-card ${lead.status || ""}`;
                    card.innerHTML = `
                        <div class="lead-header">
                            <div class="lead-title">
                                <div class="lead-name">${escapeHTML(lead.name)}</div>
                                <div class="lead-niche">${escapeHTML(lead.niche || lead.category || "—")}</div>
                            </div>
                            <div class="lead-badge ${badgeClass}">
                                ${lead.conversionProbability || 0}% chance
                            </div>
                        </div>

                        <div class="lead-info">
                            <div class="info-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span class="info-text">${escapeHTML(lead.address || "Sem endereço")}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-phone"></i>
                                <span class="info-text">${escapeHTML(lead.contact || "Sem contato")}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-globe"></i>
                                <span class="info-text">${lead.digitalPresence ? escapeHTML(lead.digitalPresence) : "Sem presença digital"}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-user-clock"></i>
                                <span class="info-text">${statusLabel}</span>
                            </div>
                        </div>

                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Probabilidade de Fechamento</span>
                                <span>${lead.conversionProbability || 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(lead.conversionProbability || 0, 100)}%"></div>
                            </div>
                        </div>

                        <div class="lead-actions">
                            <button class="btn btn-secondary btn-sm" onclick="openLeadDetails(${lead.id})" aria-label="Ver detalhes do lead ${escapeHTML(lead.name)}">
                                <i class="fas fa-eye"></i> Detalhes
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="markContacted(${lead.id})" aria-label="Marcar contato realizado com ${escapeHTML(lead.name)}">
                                <i class="fas fa-phone"></i> Contato Realizado
                            </button>
                        </div>
                    `;

                    fragment.appendChild(card);
                });

                container.appendChild(fragment);
                trackPerformance('leadsRender', startTime);
            }, 50);
        },

        // usado por botão "Ver Leads Críticos"
        filterLeads(category) {
            this.setSection("leads");
            showSection("leads");
            highlightSidebar("leads");
            this.loadLeadsData(category);
        },

        // Destruir gráficos antigos
        cleanupCharts() {
            Object.values(this.chartInstances).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
            this.chartInstances = {};
        }
    };


    // =============== HELPERS GERAIS ===============

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function calcularPotencialFinanceiro(leads) {
        let total = 0;
        leads.forEach(l => {
            const pot = l.potential || 0;
            total += pot * 1000;
        });
        return "R$ " + total.toLocaleString("pt-BR");
    }

    function getBadgeClass(lead) {
        const prob = lead.conversionProbability || 0;
        if (prob >= 75) return "badge-high";
        if (prob >= 50) return "badge-medium";
        return "badge-critical";
    }

    function getStatusLabel(lead) {
        if (!lead.contactStatus) return "Sem status";
        const mapping = {
            pending: "⏳ Pendente",
            contacted: "📞 Contactado",
            meeting_scheduled: "📅 Reunião Agendada",
            proposal_sent: "📨 Proposta Enviada",
            negotiation: "💼 Em Negociação",
            closed_won: "✅ Fechado (Ganho)",
            closed_lost: "❌ Fechado (Perdido)"
        };
        return mapping[lead.contactStatus] || lead.contactStatus;
    }

    function escapeHTML(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // =============== TOP OPORTUNIDADES ===============
    function renderTopOpportunities() {
        const wrapper = document.getElementById("topOpportunities");
        if (!wrapper) return;

        wrapper.innerHTML = "";

        if (!plenaSystem.leads.length) {
            wrapper.innerHTML = `
                <div class="action-card" style="cursor:default; opacity:0.7;">
                    <i class="fas fa-handshake-angle"></i>
                    <span>Nenhuma oportunidade ainda</span>
                </div>
            `;
            return;
        }

        // ordena por maior probabilidade
        const sorted = [...plenaSystem.leads]
            .sort((a, b) => (b.conversionProbability || 0) - (a.conversionProbability || 0))
            .slice(0, 3);

        sorted.forEach(lead => {
            const card = document.createElement("div");
            card.className = "action-card opportunity-card";
            card.style.cursor = "pointer";
            card.setAttribute("role", "button");
            card.setAttribute("aria-label", `Abrir detalhes do lead ${escapeHTML(lead.name)}`);
            card.onclick = () => {
                openLeadDetails(lead.id);
            };

            card.innerHTML = `
                <i class="fas fa-bolt" style="color: var(--secondary);"></i>
                <div class="opportunity-info">
                    <strong>${escapeHTML(lead.name)}</strong>
                    <span>${lead.niche || lead.category || "—"}</span>
                    <small>${lead.conversionProbability || 0}% chance de fechar</small>
                </div>
            `;
            wrapper.appendChild(card);
        });
    }

    // =============== DETALHES DO LEAD ===============
    window.openLeadDetails = function (id) {
        const lead = plenaSystem.leads.find(l => l.id === id);
        if (!lead) {
            console.warn(`Lead com ID ${id} não encontrado`);
            return;
        }

        // título
        const titleEl = document.getElementById("leadDetailsTitle");
        if (titleEl) {
            titleEl.innerHTML =
                `<i class="fas fa-user"></i> Detalhes do Lead - ${escapeHTML(lead.name)}`;
        }

        // preencher status atual
        const contactStatus = document.getElementById("contactStatus");
        if (contactStatus) {
            contactStatus.value = lead.contactStatus || "pending";
        }

        // próxima ação salva
        const nextFollowup = document.getElementById("nextFollowup");
        if (nextFollowup) {
            nextFollowup.value = lead.nextFollowup || "";
        }

        // notas
        const contactNotes = document.getElementById("contactNotes");
        if (contactNotes) {
            contactNotes.value = lead.notes || "";
        }

        // timeline
        const timelineContent = document.getElementById("timelineContent");
        if (timelineContent) {
            if (lead.contactHistory && lead.contactHistory.length > 0) {
                timelineContent.innerHTML = lead.contactHistory
                    .slice()
                    .reverse()
                    .map(evt => {
                        return `
                            <div class="timeline-item">
                                <div class="timeline-date">
                                    ${new Date(evt.timestamp).toLocaleString("pt-BR")}
                                </div>
                                <div class="timeline-action">
                                    ${escapeHTML(evt.action)}
                                </div>
                                <div class="timeline-details">
                                    ${escapeHTML(evt.details || "")}
                                </div>
                            </div>
                        `;
                    })
                    .join("");
            } else {
                timelineContent.innerHTML = `
                    <div class="timeline-empty">
                        <i class="fas fa-history"></i>
                        <p>Nenhum histórico ainda. Faça o primeiro contato.</p>
                    </div>
                `;
            }
        }

        // abrir modal
        const modal = document.getElementById("leadDetailsModal");
        if (modal) modal.style.display = "flex";

        // guarda ID do lead atualmente aberto (para salvar depois)
        window._currentLeadId = id;
    };

    window.markContacted = function (id) {
        const lead = plenaSystem.leads.find(l => l.id === id);
        if (!lead) return;

        // marcar contato
        const now = new Date().toISOString();
        lead.lastContact = now;
        lead.contactStatus = "contacted";

        // histórico
        lead.contactHistory = lead.contactHistory || [];
        lead.contactHistory.push({
            timestamp: now,
            action: "Contato realizado",
            details: "Contato marcado manualmente através do painel."
        });

        plenaSystem.saveLeads();
        plenaSystem.loadLeadsData();
        plenaSystem.loadDashboardData();

        if (window.notificationSystem && window.notificationSystem.showSuccessNotification) {
            window.notificationSystem.showSuccessNotification(
                "Contato registrado",
                `${lead.name} marcado como contactado.`
            );
        }
    };

    // =============== SALVAR ALTERAÇÕES DO MODAL DE LEAD ===============
    window.saveLeadDetails = function () {
        if (window._currentLeadId == null) return;
        const lead = plenaSystem.leads.find(l => l.id === window._currentLeadId);
        if (!lead) return;

        const notesEl = document.getElementById("contactNotes");
        const statusEl = document.getElementById("contactStatus");
        const followupEl = document.getElementById("nextFollowup");

        // atualiza dados
        const now = new Date().toISOString();

        if (notesEl) {
            lead.notes = notesEl.value.trim();
        }
        if (statusEl) {
            lead.contactStatus = statusEl.value;
        }
        if (followupEl) {
            lead.nextFollowup = followupEl.value;
        }

        // adiciona histórico
        lead.contactHistory = lead.contactHistory || [];
        lead.contactHistory.push({
            timestamp: now,
            action: "Atualização de status",
            details: `Status agora: ${getStatusLabel(lead)}`
        });

        plenaSystem.saveLeads();
        plenaSystem.loadLeadsData();
        plenaSystem.loadDashboardData();

        if (window.notificationSystem && window.notificationSystem.showSuccessNotification) {
            window.notificationSystem.showSuccessNotification(
                "Lead atualizado",
                "As informações foram salvas."
            );
        }

        const modal = document.getElementById("leadDetailsModal");
        if (modal) modal.style.display = "none";
    };

    // =============== CORREÇÃO ESPECÍFICA PARA RELATÓRIOS ===============
    function initReportsSection() {
        console.log("📊 Inicializando seção de relatórios...");
        
        const reportsSection = document.getElementById('reports');
        if (!reportsSection) {
            console.warn('Seção de relatórios não encontrada');
            return;
        }
        
        // Garantir que os gráficos sejam renderizados quando a seção for ativada
        const reportNavItem = document.querySelector('[data-section="reports"]');
        if (reportNavItem) {
            reportNavItem.addEventListener('click', function() {
                setTimeout(() => {
                    if (window.plenaSystem) {
                        window.plenaSystem.loadDashboardData();
                        console.log('📈 Gráficos de relatórios inicializados');
                    }
                }, 100);
            });
        }
        
        // Corrigir altura dos containers
        const reportCharts = reportsSection.querySelectorAll('.chart-card');
        reportCharts.forEach(chart => {
            chart.style.minHeight = '350px';
            const canvas = chart.querySelector('canvas');
            if (canvas) {
                canvas.style.height = '280px';
                canvas.style.minHeight = '280px';
            }
        });
    }

    // =============== NAVEGAÇÃO ENTRE SEÇÕES (SIDEBAR) ===============
    function initSectionNavigation() {
        const navItems = document.querySelectorAll(".nav-item[data-section]");
        const sections = document.querySelectorAll(".section");

        navItems.forEach(item => {
            item.addEventListener("click", () => {
                const target = item.getAttribute("data-section");

                // Visual sidebar
                navItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");

                // Mostrar/ocultar seções
                sections.forEach(sec => {
                    if (sec.id === target) {
                        sec.classList.add("active");
                        
                        // Inicialização específica por seção
                        if (target === "reports") {
                            setTimeout(() => {
                                initReportsSection();
                                if (window.plenaSystem) {
                                    window.plenaSystem.loadDashboardData();
                                }
                            }, 50);
                        }
                    } else {
                        sec.classList.remove("active");
                    }
                });

                // atualizar estado global
                plenaSystem.setSection(target);

                // se abrir Leads, renderiza leads
                if (target === "leads") {
                    plenaSystem.loadLeadsData();
                }

                // se abrir Dashboard, recarrega estatísticas
                if (target === "dashboard") {
                    plenaSystem.loadDashboardData();
                }

                // se abrir Alerts, gera alertas atuais
                if (target === "alerts" && window.notificationSystem && notificationSystem.renderAlertsList) {
                    notificationSystem.renderAlertsList();
                }
            });
        });

        // filtros da tela de leads
        const leadFilters = document.querySelectorAll("#leads .filter-btn[data-filter]");
        leadFilters.forEach(btn => {
            btn.addEventListener("click", () => {
                leadFilters.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const filter = btn.getAttribute("data-filter");
                plenaSystem.loadLeadsData(filter);
            });
        });

        // filtros da tela de alertas
        const alertFilters = document.querySelectorAll("#alerts .filter-btn[data-alert-type]");
        alertFilters.forEach(btn => {
            btn.addEventListener("click", () => {
                alertFilters.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const type = btn.getAttribute("data-alert-type");
                if (window.notificationSystem && notificationSystem.renderAlertsList) {
                    notificationSystem.renderAlertsList(type);
                }
            });
        });
    }

    function showSection(id) {
        const navItems = document.querySelectorAll(".nav-item[data-section]");
        const sections = document.querySelectorAll(".section");

        sections.forEach(sec => {
            if (sec.id === id) sec.classList.add("active");
            else sec.classList.remove("active");
        });

        navItems.forEach(i => {
            if (i.getAttribute("data-section") === id) {
                i.classList.add("active");
            } else {
                i.classList.remove("active");
            }
        });
    }

    function highlightSidebar(id) {
        const navItems = document.querySelectorAll(".nav-item[data-section]");
        navItems.forEach(i => {
            if (i.getAttribute("data-section") === id) {
                i.classList.add("active");
            } else {
                i.classList.remove("active");
            }
        });
    }

    // =============== ALERTAS / NOTIFICAÇÕES BADGE ===============
    function updateSidebarAlerts() {
        const badgeSidebar = document.getElementById("sidebarAlerts");
        const badgeHeader = document.getElementById("headerAlerts");

        let totalAlerts = 0;
        if (window.notificationSystem && notificationSystem.getUnreadCount) {
            totalAlerts = notificationSystem.getUnreadCount();
        } else {
            // fallback: conta leads pendentes como "alertas"
            totalAlerts = plenaSystem.leads.filter(l => l.contactStatus === "pending").length;
        }

        if (badgeSidebar) badgeSidebar.textContent = totalAlerts;
        if (badgeHeader) badgeHeader.textContent = totalAlerts;
    }

    // =============== GRÁFICOS DASHBOARD - COM TEMA DINÂMICO ===============
    let chartPotential = null;
    let chartNiche = null;
    let chartActivity = null;
    let chartConversion = null;
    let chartMonthly = null;
    let chartPerformance = null;
    let chartFunnel = null;
    let chartTimeline = null;

    function renderCharts() {
        const startTime = Date.now();
        
        renderPotentialChart();
        renderNicheChart();
        renderActivityChart();
        renderConversionChart();
        renderMonthlyLeadsChart();
        renderPerformanceChart();
        renderFunnelChart();
        renderTimelineChart();
        
        chartCache.lastUpdate = Date.now();
        performanceMetrics.chartRenderTime = trackPerformance('chartsRender', startTime);
        
        console.log(`📈 Gráficos renderizados em ${performanceMetrics.chartRenderTime}ms`);
    }

    // Utilitário generico pra criar gráfico só se canvas existe
    function createOrUpdateChart(ctxId, previous, type, data, options) {
        const ctx = document.getElementById(ctxId);
        if (!ctx) return previous;
        
        // Configurações padrão para todos os gráficos COM TEMA DINÂMICO
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: getTextColor(),
                        font: {
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: getBackgroundColor(),
                    titleColor: getTextColor(),
                    bodyColor: getTextColor(),
                    borderColor: getGridColor(),
                    borderWidth: 1,
                    titleFont: {
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    },
                    bodyFont: {
                        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: getTextColor(),
                        font: {
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                            size: 11
                        }
                    },
                    grid: {
                        color: getGridColor()
                    }
                },
                y: {
                    ticks: { 
                        color: getTextColor(),
                        font: {
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                            size: 11
                        }
                    },
                    grid: {
                        color: getGridColor()
                    }
                }
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };

        if (previous) {
            previous.data = data;
            previous.options = mergedOptions;
            previous.update();
            return previous;
        } else {
            const newChart = new Chart(ctx, { 
                type, 
                data, 
                options: mergedOptions 
            });
            plenaSystem.chartInstances[ctxId] = newChart;
            return newChart;
        }
    }

    function renderPotentialChart() {
        const buckets = { 5:0, 4:0, 3:0, 2:0, 1:0 };
        plenaSystem.leads.forEach(l => {
            const p = l.potential || 0;
            if (buckets[p] !== undefined) buckets[p] += 1;
        });

        const labels = ["⭐ 5 (Excelente)","4 (Alto)","3 (Médio)","2 (Baixo)","1 (Muito Baixo)"];
        const values = [buckets[5], buckets[4], buckets[3], buckets[2], buckets[1]];

        chartPotential = createOrUpdateChart(
            "potentialChart",
            chartPotential,
            "doughnut",
            {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        "var(--success)",
                        "var(--secondary)",
                        "var(--warning)",
                        "var(--info)",
                        "var(--danger)"
                    ],
                    borderWidth: 2,
                    borderColor: getBackgroundColor()
                }]
            },
            {
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: getTextColor()
                        }
                    }
                }
            }
        );
    }

    function renderNicheChart() {
        const nicheMap = {};
        plenaSystem.leads.forEach(l => {
            const n = l.niche || l.category || "Outro";
            nicheMap[n] = (nicheMap[n] || 0) + 1;
        });

        const labels = Object.keys(nicheMap);
        const values = Object.values(nicheMap);

        chartNiche = createOrUpdateChart(
            "nicheChart",
            chartNiche,
            "bar",
            {
                labels,
                datasets: [{
                    label: "Leads por Nicho",
                    data: values,
                    backgroundColor: "var(--secondary)",
                    borderColor: "var(--secondary)",
                    borderWidth: 1
                }]
            }
        );
    }

    function renderActivityChart() {
        const labels = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
        const values = [2,3,1,4,0,1,2];

        chartActivity = createOrUpdateChart(
            "activityChart",
            chartActivity,
            "line",
            {
                labels,
                datasets: [{
                    label: "Ações Registradas",
                    data: values,
                    fill: true,
                    backgroundColor: "rgba(255, 107, 53, 0.1)",
                    borderColor: "var(--secondary)",
                    tension: 0.4,
                    pointBackgroundColor: "var(--secondary)",
                    pointBorderColor: getBackgroundColor(),
                    pointBorderWidth: 2
                }]
            }
        );
    }

    function renderConversionChart() {
        const labels = ["Contato Feito","Reunião Agendada","Proposta Enviada","Fechado"];
        const values = [
            plenaSystem.leads.filter(l => l.contactStatus !== "pending").length,
            plenaSystem.leads.filter(l => l.contactStatus === "meeting_scheduled").length,
            plenaSystem.leads.filter(l => l.contactStatus === "proposal_sent").length,
            plenaSystem.leads.filter(l => l.contactStatus === "closed_won").length
        ];

        chartConversion = createOrUpdateChart(
            "conversionChart",
            chartConversion,
            "bar",
            {
                labels,
                datasets: [{
                    label: "Leads",
                    data: values,
                    backgroundColor: "var(--secondary)"
                }]
            }
        );
    }

    function renderMonthlyLeadsChart() {
        const labels = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        const values = [3,5,2,6,4,8,7,5,4,9,3,1];

        chartMonthly = createOrUpdateChart(
            "monthlyLeadsChart",
            chartMonthly,
            "line",
            {
                labels,
                datasets: [{
                    label: "Leads / mês",
                    data: values,
                    borderColor: "var(--secondary)",
                    backgroundColor: "rgba(255, 107, 53, 0.1)",
                    tension: 0.4,
                    fill: true
                }]
            }
        );
    }

    function renderPerformanceChart() {
        const labels = ["Profissionais Liberais", "Serviços", "Comércio", "Saúde"];
        const values = [
            pctFechamentoPorNicho(["Profissionais Liberais"]),
            pctFechamentoPorNicho(["Serviços Especializados"]),
            pctFechamentoPorNicho(["Comércio Local"]),
            pctFechamentoPorNicho(["Saúde e Bem-estar"]),
        ];

        chartPerformance = createOrUpdateChart(
            "performanceChart",
            chartPerformance,
            "bar",
            {
                labels,
                datasets: [{
                    label: "% Conversão",
                    data: values,
                    backgroundColor: "var(--secondary)"
                }]
            }
        );
    }

    function pctFechamentoPorNicho(niches) {
        const leadsDoNicho = plenaSystem.leads.filter(l => niches.includes(l.niche));
        if (!leadsDoNicho.length) return 0;
        const fechados = leadsDoNicho.filter(l => l.contactStatus === "closed_won").length;
        return Math.round((fechados / leadsDoNicho.length) * 100);
    }

    function renderFunnelChart() {
        const labels = ["Prospecção","Contato","Reunião","Proposta","Fechamento"];
        const steps = [
            plenaSystem.leads.length,
            plenaSystem.leads.filter(l => l.contactStatus !== "pending").length,
            plenaSystem.leads.filter(l => l.contactStatus === "meeting_scheduled").length,
            plenaSystem.leads.filter(l => l.contactStatus === "proposal_sent").length,
            plenaSystem.leads.filter(l => l.contactStatus === "closed_won").length
        ];

        chartFunnel = createOrUpdateChart(
            "funnelChart",
            chartFunnel,
            "bar",
            {
                labels,
                datasets: [{
                    label: "Leads no estágio",
                    data: steps,
                    backgroundColor: "var(--secondary)"
                }]
            },
            {
                indexAxis: "y"
            }
        );
    }

    function renderTimelineChart() {
        const labels = ["Semana 1","Semana 2","Semana 3","Semana 4"];
        const values = [4,7,3,5];

        chartTimeline = createOrUpdateChart(
            "timelineChart",
            chartTimeline,
            "line",
            {
                labels,
                datasets: [{
                    label: "Atividades",
                    data: values,
                    borderColor: "var(--secondary)",
                    backgroundColor: "rgba(255, 107, 53, 0.1)",
                    tension: 0.3,
                    fill: true
                }]
            }
        );
    }

    // =============== INICIALIZAÇÃO GERAL ===============
    document.addEventListener("DOMContentLoaded", () => {
        console.log("⚙️ Plena Informática - Sistema inicializado");

        // carregar leads salvos
        plenaSystem.loadLeadsFromStorage();

        // Render inicial do dashboard
        plenaSystem.loadDashboardData();

        // Render inicial de leads (se o usuário abrir a aba depois já está pronto)
        plenaSystem.loadLeadsData();

        // Inicializa navegação lateral e filtros
        initSectionNavigation();

        // Inicializar seção de relatórios
        initReportsSection();

        // Render lista de alertas (se o módulo de notificação existir)
        if (window.notificationSystem && notificationSystem.renderAlertsList) {
            notificationSystem.renderAlertsList();
        }

        // Listeners para mudança de tema
        window.addEventListener('themeChanged', () => {
            console.log('🎨 Tema alterado - atualizando gráficos...');
            debouncedRenderCharts();
        });

        console.log("✅ Plena Informática - Sistema pronto para uso");
    });

    // =============== DEBUG HELPERS ===============
    window.debugSystem = function() {
        return {
            performance: performanceMetrics,
            charts: {
                potential: !!chartPotential,
                niche: !!chartNiche,
                activity: !!chartActivity,
                conversion: !!chartConversion
            },
            theme: {
                textColor: getTextColor(),
                gridColor: getGridColor(),
                backgroundColor: getBackgroundColor()
            },
            cache: chartCache
        };
    };

    window.forceChartUpdate = function() {
        chartCache.lastUpdate = 0;
        chartCache.dataHash = '';
        renderCharts();
    };
})();