// =============================================
// PLENA CAPTAÇÃO v1.0 - SISTEMA DE IA AVANÇADO - CORRIGIDO
// =============================================

class IAAssistant {
    constructor() {
        this.strategyTemplates = this.initializeTemplates();
        this.conversationHistory = [];
        this.performanceMetrics = this.loadPerformanceMetrics();
        this.init();
    }

    // ===== INICIALIZAÇÃO DO SISTEMA =====
    init() {
        this.setupEventListeners();
        this.analyzeMarketTrends();
        console.log('🤖 Assistente de IA Inicializado');
    }

    // ===== CONFIGURA EVENT LISTENERS =====
    setupEventListeners() {
        // Eventos para atualização de estratégias
        window.addEventListener('leadsUpdated', () => {
            this.updateStrategiesBasedOnLeads();
        });

        window.addEventListener('themeChanged', () => {
            this.updateUIForTheme();
        });
    }

    // ===== INICIALIZA TEMPLATES DE ESTRATÉGIA =====
    initializeTemplates() {
        return {
            // Estratégias por nicho
            niches: {
                'Profissionais Liberais': {
                    name: '👨‍⚕️ Profissionais Liberais',
                    painPoints: ['Falta de agendamentos online', 'Baixa visibilidade digital', 'Dificuldade em fidelizar pacientes'],
                    opportunities: ['Agendamento 24h', 'Presença no Google', 'Sistema de fidelização'],
                    scripts: {
                        ligacao: `"Olá, sou [Seu Nome] da Plena Informática. Analisei que profissionais da sua área com presença digital conseguem até 40% mais agendamentos. Notamos que seu consultório tem excelente reputação, mas está perdendo os pacientes que buscam primeiro online. Posso mostrar como aplicar uma solução digital completa no seu consultório?"`,
                        email: `Prezado(a) Dr(a). [Nome],

Analisamos seu consultório e identificamos uma oportunidade excelente: profissionais da sua área com presença digital completa conseguem até 40% mais agendamentos.

Atualmente, muitos pacientes buscam primeiro online por:
• Agendamento rápido 24h
• Confirmação de especialidades
• Avaliações de outros pacientes

Sua reputação é excelente, mas está perdendo esses pacientes para quem aparece primeiro no Google.

Podemos agendar uma breve demonstração de como colocar seu consultório na frente desses buscadores?

Atenciosamente,
[Seu Nome]
Plena Informática`,
                        objecoes: {
                            'Não tenho tempo': `"Entendo perfeitamente que sua agenda é corrida. Por isso mesmo nossa solução automatiza todo o processo - em 15 minutos por semana você gerencia toda sua presença digital. O retorno é de horas economizadas em atendimento telefônico."`,
                            'Já tenho site': `"Excelente! Isso mostra que você já entende a importância do digital. Nossa proposta é otimizar esse investimento - analisar se seu site está realmente trazendo pacientes e como podemos melhorar a conversão. Posso fazer uma análise gratuita?"`,
                            'É muito caro': `"Compreendo sua preocupação. Na verdade, cada paciente que você perde para a concorrência online custa muito mais. Nossos clientes relatam retorno em 2-3 meses. Posso mostrar casos reais da sua área?"`
                        }
                    },
                    metrics: {
                        conversionRate: 0.42,
                        avgResponseTime: '2.3 dias',
                        successRate: 0.78
                    }
                },

                'Serviços Especializados': {
                    name: '🔧 Serviços Especializados',
                    painPoints: ['Chamadas de emergência perdidas', 'Dificuldade em mostrar credibilidade', 'Clientes achando preços altos'],
                    opportunities: ['Sistema de emergência 24h', 'Portfólio online', 'Sistema de orçamentos'],
                    scripts: {
                        ligacao: `"Olá, sou [Seu Nome] da Plena Informática. Notamos que serviços como o seu que aparecem no Google quando alguém busca 'emergência' conseguem 3x mais clientes. Muitos dos seus concorrentes já estão lá. Podemos colocar seu negócio na frente desses buscadores com um sistema de agendamento simplificado?"`,
                        email: `Prezado(a) [Nome],

Identificamos que serviços especializados como o seu que aparecem nas buscas por "emergência" conseguem 3x mais clientes.

Sua empresa tem a qualidade, mas está perdendo:
• Clientes em situações urgentes
• Buscas por serviços especializados
• Credibilidade digital

Desenvolvemos uma solução específica para serviços como o seu, incluindo:
• Sistema de emergência 24h
• Agendamento online simplificado
• Portfólio de trabalhos

Gostaria de ver como seus concorrentes estão usando isso?

Atenciosamente,
[Seu Nome]
Plena Informática`,
                        objecoes: {
                            'Clientes não buscam online': `"Entendo que pareça assim, mas as estatísticas mostram que 78% das buscas por serviços especializados começam no Google, mesmo em emergências. Quem aparece primeiro ganha a confiança."`,
                            'Só trabalho por indicação': `"Isso é ótimo - mostra a qualidade do seu trabalho! A presença digital não substitui indicações, mas as potencializa. Cada cliente indicado pode ver seu portfólio online e confiar ainda mais."`,
                            'Não entendo de tecnologia': `"Perfeito! Por isso estamos aqui. Nossa equipe cuida de tudo - você só precisa focar no seu excelente trabalho. Fazemos toda configuração e treinamento."`
                        }
                    },
                    metrics: {
                        conversionRate: 0.38,
                        avgResponseTime: '1.7 dias',
                        successRate: 0.72
                    }
                },

                'Comércio Local': {
                    name: '🏪 Comércio Local',
                    painPoints: ['Vendas perdidas fora do horário', 'Concorrência com grandes redes', 'Dificuldade em fidelizar'],
                    opportunities: ['E-commerce 24h', 'Programa de fidelidade', 'Marketing local'],
                    scripts: {
                        ligacao: `"Olá, sou [Seu Nome] da Plena Informática. Seus produtos são excelentes, mas você está perdendo as vendas do turno da noite e finais de semana. Enquanto sua loja física fecha, um e-commerce venderia 24h por dia. Posso mostrar como lojas similares aumentaram vendas em 35% com nossa solução?"`,
                        email: `Prezado(a) [Nome],

Analisamos que comércios locais como o seu estão perdendo até 40% do potencial de vendas fora do horário comercial.

Enquanto sua loja fecha às 18h, clientes buscam:
• Compras após o trabalho
• Pedidos de final de semana
• Presentes de última hora

Sua loja tem produtos excelentes - só precisa ficar "aberta" 24h.

Desenvolvemos uma solução completa:
• E-commerce responsivo
• Integração com delivery
• Programa de fidelidade

Posso mostrar casos de lojas que aumentaram 35% nas vendas?

Atenciosamente,
[Seu Nome]
Plena Informática`,
                        objecoes: {
                            'Não vendo produtos online': `"Entendo, mas muitos dos seus produtos podem ser vendidos online ou pelo menos gerar interesse. Mesmo que não venda tudo online, o catálogo digital atrai clientes para a loja física."`,
                            'É complicado entregar': `"Temos parcerias com serviços de delivery que facilitam tudo. Você foca nas vendas, cuidamos da logística. Muitos comércios começam com produtos selecionados."`,
                            'Meus clientes são da vizinhança': `"Exatamente! E esses clientes também buscam online. Um vizinho que quer comprar às 20h pode fazer o pedido e retirar no dia seguinte - você não perde a venda."`
                        }
                    },
                    metrics: {
                        conversionRate: 0.35,
                        avgResponseTime: '3.1 dias',
                        successRate: 0.68
                    }
                },

                'Saúde e Bem-estar': {
                    name: '💪 Saúde e Bem-estar',
                    painPoints: ['Alunos/clientes sazonais', 'Dificuldade em mostrar resultados', 'Concorrência com apps'],
                    opportunities: ['Agendamento de aulas', 'Acompanhamento de resultados', 'Comunidade online'],
                    scripts: {
                        ligacao: `"Olá, sou [Seu Nome] da Plena Informática. Sua academia/clínica tem ótima estrutura! Mas muitos potenciais alunos buscam primeiro online por aulas experimentais e avaliações. Podemos colocar seu negócio na frente desses buscadores com um sistema de agendamento online?"`,
                        email: `Prezado(a) [Nome],

Sua academia/clínica tem estrutura excelente, mas está perdendo potenciais clientes que buscam primeiro online por:

• Aulas experimentais agendadas
• Avaliações de outros alunos
• Resultados comprovados

Desenvolvemos uma solução específica para saúde e bem-estar:
• Sistema de agendamento online
• Acompanhamento de evolução
• Comunidade de alunos

Clientes similares relataram aumento de 45% em novas matrículas.

Gostaria de ver como funciona?

Atenciosamente,
[Seu Nome]
Plena Informática`,
                        objecoes: {
                            'Meus alunos são fiéis': `"Isso é maravilhoso! A fidelização mostra sua qualidade. A presença digital ajuda a reter esses alunos fiéis com acompanhamento de resultados e atrai novos com a mesma mentalidade."`,
                            'Não preciso de tecnologia': `"Entendo, mas a tecnologia não substitui seu trabalho - potencializa. Enquanto você foca nos alunos, o sistema cuida de agendamentos, pagamentos e comunicação."`,
                            'É caro para meu tamanho': `"Desenvolvemos planos escaláveis - você começa com o essencial e expande conforme cresce. O retorno vem com a captação de novos alunos que não encontrariam você de outra forma."`
                        }
                    },
                    metrics: {
                        conversionRate: 0.45,
                        avgResponseTime: '2.8 dias',
                        successRate: 0.75
                    }
                }
            },

            // Templates genéricos
            generics: {
                followUp: {
                    day1: `"Olá [Nome], tudo bem? Estou seguindo nosso contato de ontem sobre [assunto]. Tem alguma dúvida ou gostaria de agendar a demonstração?"`,
                    day3: `"Prezado(a) [Nome], espero que esteja bem. Estou disponível para esclarecer qualquer questão sobre nossa proposta de [solução]. O que achou?"`,
                    day7: `"[Nome], identificamos que empresas similares à sua estão obtendo ótimos resultados com nossa solução. Gostaria de conhecer alguns casos de sucesso?"`
                },
                reactivation: {
                    cold: `"Olá [Nome], notei que não tivemos retorno sobre nossa proposta. Muitas coisas podem ter acontecido - posso ajudar com alguma questão específica?"`,
                    warm: `"Prezado(a) [Nome], estamos com uma promoção especial para clientes que demonstraram interesse. Gostaria de rever a proposta com condições especiais?"`
                }
            }
        };
    }

    // ===== ANALISA TENDÊNCIAS DE MERCADO =====
    analyzeMarketTrends() {
        const trends = {
            saoJoseCampos: {
                growthAreas: ['Tecnologia', 'Saúde', 'Educação'],
                opportunities: ['Digitalização de serviços tradicionais', 'Apps locais', 'E-commerce regional'],
                challenges: ['Concorrência com São Paulo', 'Sazonalidade universitária']
            },
            general: {
                digitalAdoption: 0.68, // 68% das empresas
                mobileUsage: 0.82, // 82% dos usuários
                localSearchGrowth: 0.45 // 45% crescimento em buscas locais
            }
        };
        
        this.marketTrends = trends;
        return trends;
    }

    // ===== GERA ESTRATÉGIA PERSONALIZADA =====
    generateStrategy(lead) {
        const niche = lead.niche || lead.category;
        const template = this.strategyTemplates.niches[niche] || this.getBestMatchingTemplate(lead);
        
        if (!template) {
            return this.generateGenericStrategy(lead);
        }

        const strategy = {
            id: `strategy_${Date.now()}`,
            leadId: lead.id,
            leadName: lead.name,
            niche: niche,
            generatedAt: new Date().toISOString(),
            confidence: this.calculateConfidence(lead, template),
            
            // Elementos da estratégia
            scriptLigacao: this.personalizeScript(template.scripts.ligacao, lead),
            emailTemplate: this.personalizeEmail(template.scripts.email, lead),
            objecoes: template.scripts.objecoes,
            
            // Análises
            painPoints: template.painPoints,
            opportunities: template.opportunities,
            metrics: template.metrics,
            
            // Recomendações
            nextSteps: this.generateNextSteps(lead, template),
            timing: this.calculateOptimalTiming(lead),
            priority: this.calculatePriority(lead)
        };

        // Salva no histórico
        this.conversationHistory.push({
            type: 'strategy_generated',
            leadId: lead.id,
            strategy: strategy,
            timestamp: new Date()
        });

        return strategy;
    }

    // ===== ENCONTRA MELHOR TEMPLATE =====
    getBestMatchingTemplate(lead) {
        const leadText = `${lead.name} ${lead.niche} ${lead.category} ${lead.notes || ''}`.toLowerCase();
        
        let bestMatch = null;
        let bestScore = 0;

        Object.values(this.strategyTemplates.niches).forEach(template => {
            const score = this.calculateTemplateMatchScore(template, leadText);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = template;
            }
        });

        return bestScore > 0.3 ? bestMatch : null;
    }

    // ===== CALCULA SCORE DE MATCH =====
    calculateTemplateMatchScore(template, leadText) {
        let score = 0;
        const keywords = [
            ...template.painPoints,
            ...template.opportunities,
            template.name
        ].join(' ').toLowerCase();

        // Verifica palavras-chave em comum
        const templateWords = new Set(keywords.split(/\s+/));
        const leadWords = new Set(leadText.split(/\s+/));
        
        const commonWords = [...templateWords].filter(word => 
            leadWords.has(word) && word.length > 3
        );
        
        score = commonWords.length / templateWords.size;
        return Math.min(score, 1);
    }

    // ===== GERA ESTRATÉGIA GENÉRICA =====
    generateGenericStrategy(lead) {
        return {
            id: `generic_${Date.now()}`,
            leadId: lead.id,
            leadName: lead.name,
            niche: 'Genérico',
            generatedAt: new Date().toISOString(),
            confidence: 0.3,
            
            scriptLigacao: `"Olá, sou [Seu Nome] da Plena Informática. Analisamos empresas da sua região e identificamos oportunidades de crescimento através da transformação digital. Posso agendar um café para conversarmos sobre como potencializar seus resultados?"`,
            
            emailTemplate: `Prezado(a) [Nome],

Identificamos oportunidades de crescimento digital para empresas da sua região como a sua.

Muitos negócios estão obtendo resultados expressivos com:
• Maior visibilidade online
• Processos automatizados
• Atendimento 24h

Gostaria de conhecer cases de empresas similares?

Atenciosamente,
[Seu Nome]
Plena Informática`,
            
            objecoes: {
                'Não tenho interesse': `"Entendo perfeitamente. Muitos de nossos melhores clientes pensavam assim no início. Posso apenas enviar um case rápido do seu setor para você ver as possibilidades?"`,
                'Já tenho fornecedor': `"Excelente! Isso mostra que você já valoriza a tecnologia. Nossa proposta é complementar - analisar se está tendo o retorno máximo do investimento. Posso fazer uma análise comparativa sem custo?"`,
                'Mande por email': `"Perfeito! Vou enviar informações específicas do seu setor com cases reais. Pode me confirmar o melhor email?"`
            },
            
            nextSteps: ['Análise setorial', 'Contato por email', 'Follow-up em 3 dias'],
            timing: 'Manhãs de terça a quinta',
            priority: 'medium'
        };
    }

    // ===== PERSONALIZA SCRIPT =====
    personalizeScript(script, lead) {
        return script
            .replace(/\[Nome\]/g, this.extractFirstName(lead.name))
            .replace(/\[Seu Nome\]/g, 'Consultor Plena')
            .replace(/\[assunto\]/g, 'sua presença digital')
            .replace(/\[solução\]/g, 'transformação digital');
    }

    // ===== PERSONALIZA EMAIL =====
    personalizeEmail(email, lead) {
        return email
            .replace(/\[Nome\]/g, this.extractFirstName(lead.name))
            .replace(/\[Seu Nome\]/g, 'Consultor Plena');
    }

    // ===== EXTRAI PRIMEIRO NOME =====
    extractFirstName(fullName) {
        return fullName.split(' ')[0] || 'Prezado(a)';
    }

    // ===== CALCULA CONFIANÇA =====
    calculateConfidence(lead, template) {
        let confidence = 0.5; // Base
        
        // Ajusta baseado no potencial
        if (lead.potential >= 4) confidence += 0.2;
        if (lead.potential >= 3) confidence += 0.1;
        
        // Ajusta baseado no nicho
        if (lead.niche === template.name) confidence += 0.3;
        
        return Math.min(confidence, 0.95);
    }

    // ===== CALCULA PRIORIDADE =====
    calculatePriority(lead) {
        if (lead.status === 'critical') return 'high';
        if (lead.potential >= 4) return 'high';
        if (lead.conversionProbability >= 80) return 'high';
        return 'medium';
    }

    // ===== CALCULA TIMING IDEAL =====
    calculateOptimalTiming(lead) {
        const niche = lead.niche || lead.category;
        
        const timingMap = {
            'Profissionais Liberais': 'Manhãs de terça a quinta (9h-11h)',
            'Serviços Especializados': 'Tardes de segunda a quarta (14h-16h)',
            'Comércio Local': 'Manhãs de segunda a quarta (10h-12h)',
            'Saúde e Bem-estar': 'Tardes de terça a quinta (15h-17h)'
        };
        
        return timingMap[niche] || 'Manhãs de terça a quinta';
    }

    // ===== GERA PRÓXIMOS PASSOS =====
    generateNextSteps(lead, template) {
        const steps = [
            'Contato inicial com script personalizado',
            'Follow-up em 24h se sem resposta',
            'Envio de email com cases do setor'
        ];
        
        if (lead.potential >= 4) {
            steps.push('Demonstração agendada para esta semana');
        }
        
        if (lead.status === 'critical') {
            steps.unshift('Contato urgente - máximo 24h');
        }
        
        return steps;
    }

    // ===== ATUALIZA ESTRATÉGIAS BASEADO EM LEADS =====
    updateStrategiesBasedOnLeads() {
        const leads = JSON.parse(localStorage.getItem('plenaLeads')) || [];
        
        // Análise de performance por nicho
        const nichePerformance = {};
        leads.forEach(lead => {
            const niche = lead.niche || lead.category;
            if (!nichePerformance[niche]) {
                nichePerformance[niche] = { total: 0, contacted: 0, converted: 0 };
            }
            
            nichePerformance[niche].total++;
            if (lead.lastContact !== 'Nunca') nichePerformance[niche].contacted++;
            if (lead.contactStatus === 'closed_won') nichePerformance[niche].converted++;
        });
        
        this.performanceMetrics.nichePerformance = nichePerformance;
        this.savePerformanceMetrics();
    }

    // ===== CARREGA MÉTRICAS DE PERFORMANCE =====
    loadPerformanceMetrics() {
        return JSON.parse(localStorage.getItem('plenaIAMetrics')) || {
            nichePerformance: {},
            strategySuccess: {},
            conversionRates: {},
            lastUpdated: new Date().toISOString()
        };
    }

    // ===== SALVA MÉTRICAS DE PERFORMANCE =====
    savePerformanceMetrics() {
        this.performanceMetrics.lastUpdated = new Date().toISOString();
        localStorage.setItem('plenaIAMetrics', JSON.stringify(this.performanceMetrics));
    }

    // ===== MOSTRA TEMPLATES DE SCRIPT =====
    showScriptTemplates() {
        const templates = Object.values(this.strategyTemplates.niches).map(niche => ({
            nome: niche.name,
            script: niche.scripts.ligacao,
            metricas: niche.metrics
        }));
        
        alert(`📞 SCRIPTS DE LIGAÇÃO POR NICHO\n\n${
            templates.map(t => 
                `${t.nome}\nConversão: ${(t.metricas.conversionRate * 100).toFixed(0)}%\n\n${t.script}\n\n${'='.repeat(50)}\n`
            ).join('\n')
        }`);
    }

    // ===== MOSTRA TEMPLATES DE EMAIL =====
    showEmailTemplates() {
        const templates = Object.values(this.strategyTemplates.niches).map(niche => ({
            nome: niche.name,
            email: niche.scripts.email,
            taxaResposta: niche.metrics.avgResponseTime
        }));
        
        alert(`✉️ TEMPLATES DE EMAIL\n\n${
            templates.map(t => 
                `${t.nome}\nResposta média: ${t.taxaResposta}\n\n${t.email}\n\n${'='.repeat(50)}\n`
            ).join('\n')
        }`);
    }

    // ===== MOSTRA TRATATIVA DE OBJEÇÕES =====
    showObjectionHandling() {
        let message = `🛡️ TRATATIVA DE OBJEÇÕES COMUNS\n\n`;
        
        Object.values(this.strategyTemplates.niches).forEach(niche => {
            message += `${niche.name}\n`;
            Object.entries(niche.scripts.objecoes).forEach(([objecao, resposta]) => {
                message += `\n❌ "${objecao}"\n✅ ${resposta}\n`;
            });
            message += '\n' + '='.repeat(50) + '\n\n';
        });
        
        alert(message);
    }

    // ===== CALCULADORA DE ROI =====
    showROICalculator() {
        const investment = prompt('💰 CALCULADORA DE ROI\n\nInvestimento mensal estimado:');
        if (!investment) return;
        
        const avgClientValue = prompt('Valor médio por cliente:');
        if (!avgClientValue) return;
        
        const numClients = prompt('Número estimado de novos clientes por mês:');
        if (!numClients) return;
        
        const investmentNum = parseFloat(investment);
        const clientValueNum = parseFloat(avgClientValue);
        const clientsNum = parseFloat(numClients);
        
        const monthlyRevenue = clientValueNum * clientsNum;
        const roi = ((monthlyRevenue - investmentNum) / investmentNum) * 100;
        const paybackMonths = investmentNum / (monthlyRevenue - investmentNum);
        
        alert(`📊 RESULTADO DO ROI\n
💰 Investimento: R$ ${investmentNum.toFixed(2)}
💵 Receita Mensal: R$ ${monthlyRevenue.toFixed(2)}
📈 ROI Mensal: ${roi.toFixed(1)}%
⏱️ Payback: ${paybackMonths.toFixed(1)} meses

💡 Considerações:
• ROI positivo a partir de ${Math.ceil(investmentNum / clientValueNum)} clientes/mês
• Cada cliente vale ${(clientValueNum / investmentNum).toFixed(1)}x o investimento
• ${clientsNum} clientes = ${(monthlyRevenue / investmentNum).toFixed(1)}x retorno`);
    }

    // ===== GERA RELATÓRIO DE PERFORMANCE =====
    generatePerformanceReport() {
        const leads = JSON.parse(localStorage.getItem('plenaLeads')) || [];
        const totalLeads = leads.length;
        const contactedLeads = leads.filter(l => l.lastContact !== 'Nunca').length;
        const convertedLeads = leads.filter(l => l.contactStatus === 'closed_won').length;
        
        const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0;
        const conversionRate = contactedLeads > 0 ? (convertedLeads / contactedLeads) * 100 : 0;
        
        let report = `📊 RELATÓRIO DE PERFORMANCE - IA\n\n`;
        report += `👥 Leads Totais: ${totalLeads}\n`;
        report += `📞 Leads Contactados: ${contactedLeads} (${contactRate.toFixed(1)}%)\n`;
        report += `✅ Leads Convertidos: ${convertedLeads} (${conversionRate.toFixed(1)}%)\n\n`;
        
        // Performance por nicho
        report += `🎯 PERFORMANCE POR NICHO:\n`;
        Object.entries(this.performanceMetrics.nichePerformance || {}).forEach(([niche, data]) => {
            const nicheConversion = data.contacted > 0 ? (data.converted / data.contacted) * 100 : 0;
            report += `\n${niche}: ${data.total} leads, ${data.contacted} contactados, ${data.converted} convertidos (${nicheConversion.toFixed(1)}%)\n`;
        });
        
        alert(report);
    }

    // ===== ATUALIZA UI PARA TEMA =====
    updateUIForTheme() {
        // Componentes específicos da IA podem ser atualizados aqui
        console.log('UI da IA atualizada para o tema');
    }

    // ===== SUGESTÕES INTELIGENTES =====
    getSmartSuggestions() {
        const leads = JSON.parse(localStorage.getItem('plenaLeads')) || [];
        const criticalLeads = leads.filter(l => l.status === 'critical' && l.lastContact === 'Nunca');
        const highPotential = leads.filter(l => l.potential >= 4 && l.lastContact === 'Nunca');
        
        const suggestions = [];
        
        if (criticalLeads.length > 0) {
            suggestions.push({
                type: 'urgent',
                title: '🚨 Leads Críticos Pendentes',
                message: `${criticalLeads.length} lead(s) crítico(s) precisam de contato imediato`,
                action: 'contact_critical_leads',
                priority: 'high'
            });
        }
        
        if (highPotential.length > 0) {
            suggestions.push({
                type: 'opportunity',
                title: '🎯 Alto Potencial Não Contactado',
                message: `${highPotential.length} lead(s) com alto potencial aguardando primeiro contato`,
                action: 'contact_high_potential',
                priority: 'medium'
            });
        }
        
        // Sugestão baseada em performance
        const contactRate = leads.length > 0 ? 
            (leads.filter(l => l.lastContact !== 'Nunca').length / leads.length) * 100 : 0;
            
        if (contactRate < 50) {
            suggestions.push({
                type: 'improvement',
                title: '📈 Melhorar Taxa de Contato',
                message: `Apenas ${contactRate.toFixed(1)}% dos leads foram contactados`,
                action: 'improve_contact_rate',
                priority: 'medium'
            });
        }
        
        return suggestions;
    }

    // ===== EXPORTA DADOS DA IA =====
    exportIAData() {
        const exportData = {
            exportedAt: new Date().toISOString(),
            strategyTemplates: this.strategyTemplates,
            performanceMetrics: this.performanceMetrics,
            conversationHistory: this.conversationHistory,
            marketTrends: this.marketTrends
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dados-ia-plena-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (window.notificationSystem) {
            window.notificationSystem.showSuccessNotification(
                'Dados Exportados',
                'Todos os dados da IA foram exportados com sucesso'
            );
        }
    }

    // ===== RESETA DADOS DA IA =====
    resetIAData() {
        if (confirm('⚠️ TEM CERTEZA?\n\nIsso irá resetar todos os dados de aprendizado da IA. O processo não pode ser desfeito.')) {
            localStorage.removeItem('plenaIAMetrics');
            this.performanceMetrics = this.loadPerformanceMetrics();
            this.conversationHistory = [];
            
            if (window.notificationSystem) {
                window.notificationSystem.showSuccessNotification(
                    'IA Resetada',
                    'Dados de aprendizado resetados com sucesso'
                );
            }
        }
    }
}

// ===== INSTÂNCIA GLOBAL DO ASSISTENTE DE IA =====
const iaAssistant = new IAAssistant();

// ===== FUNÇÕES GLOBAIS =====
function runIAProspecting() {
    const niche = prompt('🤖 IA DE PROSPECÇÃO\n\nSelecione o nicho para busca inteligente:\n\n1. Profissionais Liberais\n2. Serviços Especializados\n3. Comércio Local\n4. Saúde e Bem-estar\n\nDigite o número:');
    
    const nicheMap = {
        '1': 'Profissionais Liberais',
        '2': 'Serviços Especializados', 
        '3': 'Comércio Local',
        '4': 'Saúde e Bem-estar'
    };
    
    const selectedNiche = nicheMap[niche];
    
    if (selectedNiche) {
        alert(`🎯 BUSCA IA INICIADA - ${selectedNiche}\n\nA IA está analisando:\n• Base de dados local\n• Tendências de mercado\n• Oportunidades específicas\n\nEm uma implementação completa, isso integraria com:\n• APIs de negócios locais\n• Análise de redes sociais\n• Dados demográficos\n• Inteligência competitiva\n\n💡 Dica: Esta funcionalidade será expandida na próxima versão!`);
    } else {
        alert('Nicho não reconhecido. Tente novamente.');
    }
}

function showAIRecommendations() {
    const suggestions = iaAssistant.getSmartSuggestions();
    
    if (suggestions.length === 0) {
        alert('🤖 RECOMENDAÇÕES DA IA\n\n✅ Tudo sob controle! Não há ações críticas pendentes.\n\nContinue com o excelente trabalho! 🚀');
        return;
    }
    
    let message = '🤖 RECOMENDAÇÕES INTELIGENTES DA IA\n\n';
    
    suggestions.forEach((suggestion, index) => {
        message += `${index + 1}. ${suggestion.title}\n`;
        message += `   📝 ${suggestion.message}\n`;
        message += `   🎯 ${suggestion.type.toUpperCase()}\n\n`;
    });
    
    message += '💡 Estas recomendações são baseadas na análise do seu pipeline atual.';
    
    alert(message);
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Garante que a IA está disponível globalmente
    window.iaAssistant = iaAssistant;
    
    console.log('🤖 IA Assistant Carregado e Pronto');
});

// ===== EXPORTAÇÃO PARA DESENVOLVIMENTO =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IAAssistant, iaAssistant };
}