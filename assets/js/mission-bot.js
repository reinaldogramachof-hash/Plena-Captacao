/* =====================================================
   🤖 MISSION BOT – ASSISTENTE DE PERFORMANCE COMERCIAL
   Sistema Inteligente de Captação · Coach de Ação
   Desenvolvido por Plena Informática © 2025
   (Foco: execução diária / follow-up / urgências)
===================================================== */

(function () {
    // ==============================
    // ESTADO / VARS INTERNAS
    // ==============================
    let panelOpen = false;

    // ==============================
    // CRIA ELEMENTO FLUTUANTE
    // ==============================
    const missionBtn = document.createElement('div');
    missionBtn.id = 'missionBotButton';
    missionBtn.innerHTML = `
        <div class="mission-icon">
            <i class="fas fa-bolt"></i>
        </div>
        <div class="mission-tooltip">
            Missões do Dia
        </div>
    `;
    document.body.appendChild(missionBtn);

    // ==============================
    // CRIA PAINEL LATERAL OCULTO
    // ==============================
    const missionPanel = document.createElement('div');
    missionPanel.id = 'missionBotPanel';
    missionPanel.innerHTML = `
        <div class="mission-panel-header">
            <div class="mission-panel-title">
                <i class="fas fa-clipboard-check"></i>
                <div class="mission-panel-text">
                    <strong>Missão do Dia</strong>
                    <small>Sistema Inteligente de Captação</small>
                </div>
            </div>
            <button class="mission-close-btn" id="missionCloseBtn">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <div class="mission-panel-body" id="missionPanelBody">
            <div class="mission-section">
                <h4><i class="fas fa-fire"></i> Prioridades Imediatas</h4>
                <div class="mission-section-content" id="missionCriticalLeads">
                    <p class="mission-empty">Carregando...</p>
                </div>
            </div>

            <div class="mission-section">
                <h4><i class="fas fa-phone-volume"></i> Follow-ups Pendentes</h4>
                <div class="mission-section-content" id="missionFollowups">
                    <p class="mission-empty">Carregando...</p>
                </div>
            </div>

            <div class="mission-section">
                <h4><i class="fas fa-bullseye"></i> Meta do Dia</h4>
                <div class="mission-kpi-row" id="missionKpiRow">
                    <!-- KPIs gerados dinamicamente -->
                </div>
            </div>

            <div class="mission-section">
                <h4><i class="fas fa-lightbulb"></i> Recomendação Tática</h4>
                <div class="mission-tip" id="missionSuggestion">
                    <!-- sugestão gerada dinamicamente -->
                </div>
            </div>
        </div>

        <div class="mission-panel-footer">
            <small>Desenvolvido por <strong>Plena Informática</strong> © 2025 · Todos os direitos reservados.</small>
        </div>
    `;
    document.body.appendChild(missionPanel);

    // ==============================
    // EVENTOS DO BOTÃO / PAINEL
    // ==============================
    missionBtn.addEventListener('click', () => {
        toggleMissionPanel(true);
    });

    missionPanel.querySelector('#missionCloseBtn').addEventListener('click', () => {
        toggleMissionPanel(false);
    });

    function toggleMissionPanel(open) {
        panelOpen = open;
        if (open) {
            missionPanel.classList.add('open');
            updateMissionData();
        } else {
            missionPanel.classList.remove('open');
        }
    }

    // ==============================
    // LÓGICA: COLETA DADOS DO SISTEMA
    // ==============================
    function getSystemLeads() {
        if (!window.plenaSystem || !Array.isArray(window.plenaSystem.leads)) {
            return [];
        }
        return window.plenaSystem.leads;
    }

    function getCriticalLeads(max = 3) {
        // leads marcados como críticos OU potencial alto OU em negociação / fechado
        const leads = getSystemLeads()
            .filter(lead =>
                lead.status === 'critical' ||
                lead.potential >= 4 ||
                lead.contactStatus === 'negotiation' ||
                lead.contactStatus === 'closed_won'
            )
            .sort((a, b) => {
                // ordenar por mais urgente:
                // 1) negociação
                // 2) critical
                // 3) potencial
                const scoreA = urgencyScore(a);
                const scoreB = urgencyScore(b);
                return scoreB - scoreA;
            });

        return leads.slice(0, max);
    }

    function urgencyScore(lead) {
        let score = 0;
        if (lead.contactStatus === 'negotiation') score += 50;
        if (lead.contactStatus === 'closed_won') score += 40;
        if (lead.status === 'critical') score += 30;
        if (lead.potential >= 4) score += (lead.potential * 5);
        return score;
    }

    function getFollowups(max = 4) {
        // leads com próximo followup definido / pendente
        const now = Date.now();

        return getSystemLeads()
            .filter(lead => !!lead.nextFollowup || lead.contactStatus === 'pending' || lead.contactStatus === 'contacted')
            .map(lead => {
                let ts = null;
                if (lead.nextFollowup) {
                    // tentar parsear datetime
                    ts = Date.parse(lead.nextFollowup);
                    if (isNaN(ts)) ts = null;
                }
                return {
                    ...lead,
                    _followupTs: ts
                };
            })
            .sort((a, b) => {
                // primeiro os que já passaram da hora
                const aPast = a._followupTs !== null && a._followupTs < now;
                const bPast = b._followupTs !== null && b._followupTs < now;
                if (aPast && !bPast) return -1;
                if (!aPast && bPast) return 1;

                // depois, mais próximo no tempo
                if (a._followupTs !== null && b._followupTs !== null) {
                    return a._followupTs - b._followupTs;
                }

                // aqueles sem horário vão pro final
                if (a._followupTs === null && b._followupTs !== null) return 1;
                if (a._followupTs !== null && b._followupTs === null) return -1;

                return 0;
            })
            .slice(0, max);
    }

    function computeKPIs() {
        const leads = getSystemLeads();
        const total = leads.length;

        const contacted = leads.filter(l => l.lastContact && l.lastContact !== 'Nunca').length;
        const negotiation = leads.filter(l => l.contactStatus === 'negotiation').length;
        const closedWon = leads.filter(l => l.contactStatus === 'closed_won').length;
        const critical = leads.filter(l => l.status === 'critical').length;

        let contactRate = 0;
        if (total > 0) {
            contactRate = Math.round((contacted / total) * 100);
        }

        return {
            total,
            contacted,
            negotiation,
            closedWon,
            critical,
            contactRate
        };
    }

    function buildSuggestion(kpi) {
        // tática simples: empurrar o gargalo atual
        if (kpi.negotiation > 0) {
            return `
                <p>
                    Você tem <strong>${kpi.negotiation}</strong> lead(s) em negociação.
                    Não deixe esfriar. Hoje precisa fechar proposta e transformar isso em faturamento.
                </p>
                <p class="mission-suggestion-call">
                    Ação recomendada: enviar mensagem de urgência comercial e agendar retorno.
                </p>
            `;
        }

        if (kpi.critical > 0 && kpi.contactRate < 60) {
            return `
                <p>
                    Existem <strong>${kpi.critical}</strong> lead(s) críticos e sua taxa de contato está em
                    <strong>${kpi.contactRate}%</strong>. Isso está baixo.
                </p>
                <p class="mission-suggestion-call">
                    Prioridade: ligar ou mandar áudio agora para cada crítico que ainda não respondeu.
                </p>
            `;
        }

        if (kpi.total > 0 && kpi.contactRate < 40) {
            return `
                <p>
                    O funil está grande (${kpi.total} leads), mas você só falou com ${kpi.contactRate}% deles.
                    Isso sugere que tem dinheiro parado na mesa.
                </p>
                <p class="mission-suggestion-call">
                    Meta de hoje: iniciar primeiro contato com pelo menos 5 leads frios.
                </p>
            `;
        }

        return `
            <p>
                Funil saudável, follow-ups agendados e conversas ativas.
                Continue pressionando os leads que já demonstraram interesse.
            </p>
            <p class="mission-suggestion-call">
                Objetivo hoje: nutrir relacionamento e gerar pedido de orçamento formal.
            </p>
        `;
    }

    // ==============================
    // RENDER DAS SESSÕES
    // ==============================
    function renderCriticalLeads() {
        const container = document.getElementById('missionCriticalLeads');
        const list = getCriticalLeads();

        if (!container) return;
        if (!list.length) {
            container.innerHTML = `<p class="mission-empty"><i class="fas fa-check-circle"></i> Nenhum lead crítico agora.</p>`;
            return;
        }

        container.innerHTML = list.map(lead => {
            return `
                <div class="mission-lead-card">
                    <div class="mission-lead-main">
                        <div class="mission-lead-name">${lead.name || 'SEM NOME'}</div>
                        <div class="mission-lead-meta">
                            ${lead.address ? `<span><i class="fas fa-map-marker-alt"></i> ${lead.address}</span>` : ''}
                            ${lead.contact ? `<span><i class="fas fa-phone"></i> ${lead.contact}</span>` : ''}
                        </div>
                    </div>
                    <div class="mission-lead-status">
                        ${lead.contactStatus === 'negotiation' ? '<span class="badge badge-hot">Negociação</span>' : ''}
                        ${lead.status === 'critical' ? '<span class="badge badge-critical">Crítico</span>' : ''}
                        ${lead.potential ? `<span class="badge badge-pot">${lead.potential}⭐</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderFollowups() {
        const container = document.getElementById('missionFollowups');
        const list = getFollowups();

        if (!container) return;
        if (!list.length) {
            container.innerHTML = `<p class="mission-empty"><i class="fas fa-coffee"></i> Nenhum follow-up urgente por agora.</p>`;
            return;
        }

        container.innerHTML = list.map(lead => {
            const dateInfo = lead._followupTs
                ? formatFollowupTime(lead._followupTs)
                : 'Sem horário definido';

            return `
                <div class="mission-followup-card">
                    <div class="mission-followup-head">
                        <div class="mission-followup-name">${lead.name || 'SEM NOME'}</div>
                        <div class="mission-followup-when">${dateInfo}</div>
                    </div>
                    <div class="mission-followup-body">
                        <div class="mission-followup-line">
                            ${lead.contact ? `<i class="fas fa-phone"></i> ${lead.contact}` : '<i class="fas fa-phone-slash"></i> Sem contato salvo'}
                        </div>
                        <div class="mission-followup-line">
                            <i class="fas fa-sticky-note"></i> ${lead.nextAction || 'Sem próxima ação definida'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function formatFollowupTime(ts) {
        const d = new Date(ts);
        const hoje = new Date();
        const sameDay =
            d.getDate() === hoje.getDate() &&
            d.getMonth() === hoje.getMonth() &&
            d.getFullYear() === hoje.getFullYear();

        const hh = d.getHours().toString().padStart(2, '0');
        const mm = d.getMinutes().toString().padStart(2, '0');

        if (sameDay) {
            return `Hoje ${hh}:${mm}`;
        }

        const dd = d.getDate().toString().padStart(2, '0');
        const mo = (d.getMonth() + 1).toString().padStart(2, '0');
        return `${dd}/${mo} ${hh}:${mm}`;
    }

    function renderKPIs() {
        const row = document.getElementById('missionKpiRow');
        if (!row) return;

        const kpi = computeKPIs();

        row.innerHTML = `
            <div class="mission-kpi-box">
                <div class="mission-kpi-value">${kpi.total}</div>
                <div class="mission-kpi-label">Leads Totais</div>
            </div>
            <div class="mission-kpi-box">
                <div class="mission-kpi-value">${kpi.contactRate}%</div>
                <div class="mission-kpi-label">Taxa de Contato</div>
            </div>
            <div class="mission-kpi-box">
                <div class="mission-kpi-value">${kpi.negotiation}</div>
                <div class="mission-kpi-label">Em Negociação</div>
            </div>
            <div class="mission-kpi-box">
                <div class="mission-kpi-value">${kpi.closedWon}</div>
                <div class="mission-kpi-label">Fechados ✅</div>
            </div>
        `;

        // sugestão tática baseada nesses KPIs
        const sug = document.getElementById('missionSuggestion');
        if (sug) {
            sug.innerHTML = buildSuggestion(kpi);
        }
    }

    // ==============================
    // LOOP DE ATUALIZAÇÃO
    // ==============================
    function updateMissionData() {
        renderCriticalLeads();
        renderFollowups();
        renderKPIs();
    }

    // primeira atualização com leve atraso pra garantir plenaSystem carregado
    setTimeout(updateMissionData, 1500);

    // expor publicamente se precisar debugar
    window.missionBot = {
        refresh: updateMissionData
    };

    // ==============================
    // ESTILOS DO BOT E PAINEL
    // ==============================
    const styleEl = document.createElement('style');
    styleEl.textContent = `
/* ===== BOTÃO FLUTUANTE ===== */
#missionBotButton {
    position: fixed;
    bottom: 100px;
    right: 25px;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%);
    border-radius: 50%;
    box-shadow: 0 10px 25px rgba(255,107,53,0.4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    transition: all 0.25s ease;
    border: 2px solid rgba(0,0,0,0.4);
}
#missionBotButton:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 14px 30px rgba(255,107,53,0.55);
}
#missionBotButton .mission-icon {
    color: #fff;
    font-size: 1.25rem;
    line-height: 1;
}
#missionBotButton .mission-tooltip {
    position: absolute;
    right: 70px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 0.8rem;
    line-height: 1.2;
    box-shadow: var(--shadow-lg);
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s ease;
}
#missionBotButton:hover .mission-tooltip {
    opacity: 1;
    transform: translateX(-4px);
}

/* ===== PAINEL ===== */
#missionBotPanel {
    position: fixed;
    bottom: 25px;
    right: 25px;
    width: 340px;
    max-height: 70vh;
    background: var(--bg-card);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 9999;

    opacity: 0;
    pointer-events: none;
    transform: translateY(15px) scale(0.96);
    transition: all 0.25s ease;
}
#missionBotPanel.open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(1);
}

/* HEADER DO PAINEL */
.mission-panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    background: linear-gradient(135deg, var(--primary) 0%, #2d2d2d 100%);
    color: #fff;
    padding: 16px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
}
.mission-panel-title {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}
.mission-panel-title i {
    color: var(--secondary);
    font-size: 1.2rem;
}
.mission-panel-text strong {
    font-size: 0.95rem;
    line-height: 1.3;
    color: #fff;
    font-weight: 600;
}
.mission-panel-text small {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.7);
}
.mission-close-btn {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.4);
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:0.8rem;
    transition: all 0.2s ease;
}
.mission-close-btn:hover {
    background: rgba(255,255,255,0.1);
}

/* CORPO */
.mission-panel-body {
    padding: 16px;
    overflow-y: auto;
    flex: 1;
}
.mission-section {
    margin-bottom: 16px;
}
.mission-section h4 {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px;
    display:flex;
    align-items:center;
    gap:6px;
}
.mission-section h4 i {
    color: var(--secondary);
}

/* CARDS DE LEAD */
.mission-lead-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 8px;
    box-shadow: var(--shadow);
}
.mission-lead-main {
    margin-bottom: 6px;
}
.mission-lead-name {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 0.9rem;
    line-height:1.3;
}
.mission-lead-meta {
    color: var(--text-secondary);
    font-size: 0.75rem;
    line-height:1.4;
    display:flex;
    flex-direction:column;
    gap:4px;
}
.mission-lead-meta i {
    color: var(--secondary);
    width:14px;
}
.mission-lead-status {
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    font-size:0.7rem;
}
.badge {
    display:inline-block;
    font-weight:600;
    line-height:1.2;
    padding:4px 6px;
    border-radius:6px;
    font-size:0.7rem;
}
.badge-hot {
    background: rgba(255,193,7,0.15);
    color: #ffc107;
    border:1px solid rgba(255,193,7,0.4);
}
.badge-critical {
    background: rgba(255,68,68,0.15);
    color: var(--danger);
    border:1px solid rgba(255,68,68,0.5);
}
.badge-pot {
    background: rgba(255,107,53,0.15);
    color: var(--secondary);
    border:1px solid rgba(255,107,53,0.5);
}

/* FOLLOWUPS */
.mission-followup-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 8px;
}
.mission-followup-head {
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    margin-bottom:6px;
    gap:8px;
}
.mission-followup-name {
    font-weight:600;
    color:var(--text-primary);
    font-size:0.9rem;
    line-height:1.3;
}
.mission-followup-when {
    font-size:0.7rem;
    font-weight:500;
    color:var(--secondary);
    white-space:nowrap;
}
.mission-followup-body {
    font-size:0.75rem;
    line-height:1.4;
    color:var(--text-secondary);
    display:flex;
    flex-direction:column;
    gap:4px;
}
.mission-followup-line i {
    color:var(--secondary);
    width:14px;
}

/* KPIs */
.mission-kpi-row {
    display:grid;
    grid-template-columns: repeat(2, 1fr);
    gap:8px;
}
.mission-kpi-box {
    background: var(--bg-secondary);
    border:1px solid var(--border-color);
    border-radius:10px;
    text-align:center;
    padding:10px 8px;
}
.mission-kpi-value {
    font-size:1rem;
    font-weight:700;
    line-height:1.2;
    color:var(--text-primary);
}
.mission-kpi-label {
    font-size:0.7rem;
    line-height:1.2;
    color:var(--text-secondary);
    font-weight:500;
}

/* SUGESTÃO */
.mission-tip {
    background: var(--bg-secondary);
    border:1px solid var(--border-color);
    border-radius:10px;
    padding:10px 12px;
    font-size:0.75rem;
    line-height:1.4;
    color:var(--text-secondary);
}
.mission-suggestion-call {
    margin-top:8px;
    font-weight:600;
    color:var(--secondary);
    font-size:0.8rem;
    line-height:1.4;
}

/* EMPTY STATES */
.mission-empty {
    font-size:0.8rem;
    text-align:center;
    color:var(--text-secondary);
    background: var(--bg-secondary);
    border:1px solid var(--border-color);
    border-radius:10px;
    padding:12px;
    line-height:1.4;
}
.mission-empty i {
    color:var(--secondary);
}

/* FOOTER */
.mission-panel-footer {
    padding: 10px 14px;
    border-top:1px solid var(--border-color);
    background: var(--bg-card);
    font-size:0.7rem;
    text-align:center;
    color:var(--text-secondary);
}

/* PROGRESS BAR reaproveitável (se quisermos mostrar depois dentro do painel) */
.mission-progress-bar {
    width: 100%;
    height: 6px;
    background: var(--bg-secondary);
    border-radius:4px;
    overflow:hidden;
}
.mission-progress-fill {
    height:100%;
    background: linear-gradient(90deg,var(--secondary),var(--accent));
    width:0%;
    transition: width .3s ease;
}

/* MOBILE / RESPONSIVIDADE */
@media(max-width:480px){
    #missionBotPanel{
        right:15px;
        left:15px;
        width:auto;
        bottom:90px;
        max-height:65vh;
    }
    #missionBotButton{
        right:15px;
        bottom:15px;
    }
}
    `;
    document.head.appendChild(styleEl);

})();
