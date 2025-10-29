// =============================================
// PLENA CAPTAÇÃO v1.0 - SISTEMA DE NOTIFICAÇÕES OTIMIZADO - CORRIGIDO
// =============================================

class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('plenaNotifications')) || [];
        this.unreadCount = 0;
        this.isDropdownOpen = false;
        this.init();
    }

    // ===== INICIALIZAÇÃO DO SISTEMA =====
    init() {
        this.setupEventListeners();
        this.injectNotificationStyles();
        this.checkPendingActions();
        this.cleanupOldNotifications();
        this.updateNotificationBadges();
        
        console.log('🔔 Sistema de Notificações Iniciado');
    }

    // ===== CONFIGURA LISTENERS DE NOTIFICAÇÃO =====
    setupEventListeners() {
        // Botão de notificação no header
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        
        if (notificationBtn && notificationDropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });

            // Fechar dropdown ao clicar fora
            document.addEventListener('click', (e) => {
                if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                    this.closeDropdown();
                }
            });

            // Tecla Escape para fechar dropdown
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isDropdownOpen) {
                    this.closeDropdown();
                }
            });
        }

        // Event listeners para atualizações do sistema
        window.addEventListener('leadsUpdated', () => {
            this.checkPendingActions();
        });

        window.addEventListener('themeChanged', () => {
            this.updateNotificationStyles();
        });
    }

    // ===== CONTROLE DO DROPDOWN =====
    toggleDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (!dropdown) return;

        this.isDropdownOpen = !this.isDropdownOpen;
        dropdown.style.display = this.isDropdownOpen ? 'block' : 'none';

        if (this.isDropdownOpen) {
            this.renderNotifications();
            this.markAllAsViewed(); // Marca como visualizadas, não lidas
        }
    }

    closeDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            this.isDropdownOpen = false;
        }
    }

    // ===== INJETA ESTILOS CSS PARA NOTIFICAÇÕES =====
    injectNotificationStyles() {
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = this.getNotificationStyles();
            document.head.appendChild(styles);
        }
    }

    // ===== RETORNA ESTILOS DE NOTIFICAÇÃO =====
    getNotificationStyles() {
        return `
            /* Notification Wrapper */
            .notification-wrapper {
                position: relative;
            }

            /* Notification Button */
            .notification-btn {
                background: none;
                border: none;
                color: var(--text-primary);
                font-size: 1.2em;
                cursor: pointer;
                padding: 10px;
                border-radius: 50%;
                position: relative;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
            }

            .notification-btn:hover {
                background: var(--bg-secondary);
                transform: scale(1.05);
            }

            .notification-btn:active {
                transform: scale(0.95);
            }

            /* Notification Badge */
            .notification-badge {
                position: absolute;
                top: 6px;
                right: 6px;
                background: linear-gradient(135deg, var(--danger) 0%, #ff6b6b 100%);
                color: white;
                border-radius: 10px;
                padding: 3px 7px;
                font-size: 0.7em;
                font-weight: 700;
                min-width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid var(--bg-card);
                animation: pulse 2s infinite;
                box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
            }

            @keyframes pulse {
                0%, 100% { 
                    transform: scale(1); 
                    box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
                }
                50% { 
                    transform: scale(1.1); 
                    box-shadow: 0 4px 12px rgba(255, 68, 68, 0.5);
                }
            }

            /* Notification Dropdown */
            .notification-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                width: 380px;
                max-width: 90vw;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                box-shadow: var(--shadow-lg);
                display: none;
                z-index: 1000;
                margin-top: 10px;
                overflow: hidden;
            }

            .notification-dropdown.show {
                display: block;
                animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes slideDown {
                from { 
                    opacity: 0; 
                    transform: translateY(-10px) scale(0.95); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0) scale(1); 
                }
            }

            /* Notification Header */
            .notification-header {
                padding: 20px 25px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--bg-secondary);
            }

            .notification-header h4 {
                margin: 0;
                color: var(--text-primary);
                font-size: 1.1em;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .notification-header h4::before {
                content: '🔔';
                font-size: 1.1em;
            }

            .notification-header button {
                background: none;
                border: none;
                color: var(--secondary);
                cursor: pointer;
                font-size: 0.85em;
                font-weight: 600;
                padding: 6px 12px;
                border-radius: 6px;
                transition: all 0.3s ease;
            }

            .notification-header button:hover {
                background: rgba(255, 107, 53, 0.1);
                transform: translateY(-1px);
            }

            /* Notification List */
            .notification-list {
                max-height: 400px;
                overflow-y: auto;
                background: var(--bg-card);
            }

            /* Notification Item */
            .notification-item {
                padding: 18px 25px;
                border-bottom: 1px solid var(--border-color);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                background: var(--bg-card);
            }

            .notification-item:hover {
                background: var(--bg-secondary);
                transform: translateX(4px);
            }

            .notification-item:last-child {
                border-bottom: none;
            }

            .notification-item.unread {
                background: rgba(255, 107, 53, 0.05);
                border-left: 4px solid var(--secondary);
            }

            .notification-item.unread::before {
                content: '';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                width: 8px;
                height: 8px;
                background: var(--secondary);
                border-radius: 50%;
                animation: blink 2s infinite;
            }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }

            .notification-title {
                font-weight: 600;
                margin-bottom: 6px;
                color: var(--text-primary);
                font-size: 0.95em;
                line-height: 1.3;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .notification-message {
                font-size: 0.9em;
                color: var(--text-secondary);
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .notification-time {
                font-size: 0.8em;
                color: var(--text-secondary);
                opacity: 0.8;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .notification-time::before {
                content: '🕒';
                font-size: 0.9em;
            }

            /* Empty State */
            .notification-empty {
                padding: 50px 25px;
                text-align: center;
                color: var(--text-secondary);
                background: var(--bg-card);
            }

            .notification-empty i {
                font-size: 3em;
                margin-bottom: 15px;
                opacity: 0.3;
                color: var(--secondary);
            }

            .notification-empty div {
                font-size: 1em;
                margin-bottom: 5px;
            }

            .notification-empty div:last-child {
                font-size: 0.85em;
                opacity: 0.7;
            }

            /* Toast Notifications */
            .toast-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-card);
                border-left: 4px solid var(--secondary);
                padding: 18px;
                border-radius: 12px;
                box-shadow: var(--shadow-lg);
                display: flex;
                align-items: center;
                gap: 14px;
                max-width: 420px;
                z-index: 10000;
                animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
                border: 1px solid var(--border-color);
            }

            .toast-notification.urgent {
                border-left-color: var(--danger);
                background: linear-gradient(135deg, var(--bg-card) 0%, rgba(255, 68, 68, 0.05) 100%);
            }

            .toast-notification.reminder {
                border-left-color: var(--warning);
                background: linear-gradient(135deg, var(--bg-card) 0%, rgba(255, 179, 0, 0.05) 100%);
            }

            .toast-notification.success {
                border-left-color: var(--success);
                background: linear-gradient(135deg, var(--bg-card) 0%, rgba(0, 200, 83, 0.05) 100%);
            }

            .toast-notification.info {
                border-left-color: var(--info);
                background: linear-gradient(135deg, var(--bg-card) 0%, rgba(33, 150, 243, 0.05) 100%);
            }

            .toast-icon {
                font-size: 1.4em;
                flex-shrink: 0;
                width: 24px;
                text-align: center;
            }

            .toast-content {
                flex: 1;
                min-width: 0;
            }

            .toast-title {
                font-weight: 600;
                margin-bottom: 5px;
                color: var(--text-primary);
                font-size: 0.95em;
                line-height: 1.3;
            }

            .toast-message {
                font-size: 0.9em;
                color: var(--text-secondary);
                line-height: 1.4;
            }

            .toast-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 6px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 6px;
                transition: all 0.3s ease;
            }

            .toast-close:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
                transform: scale(1.1);
            }

            @keyframes slideInRight {
                from { 
                    transform: translateX(100%); 
                    opacity: 0; 
                }
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
            }

            @keyframes slideOutRight {
                from { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
                to { 
                    transform: translateX(100%); 
                    opacity: 0; 
                }
            }

            .toast-notification.hiding {
                animation: slideOutRight 0.3s ease forwards;
            }

            /* Priority Indicators */
            .notification-priority {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                margin-right: 6px;
            }

            .priority-high { background: var(--danger); }
            .priority-medium { background: var(--warning); }
            .priority-low { background: var(--info); }

            /* Responsive Design */
            @media (max-width: 480px) {
                .notification-dropdown {
                    width: 320px;
                    right: -50px;
                }

                .toast-notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }

            /* Scrollbar Personalizado */
            .notification-list::-webkit-scrollbar {
                width: 6px;
            }

            .notification-list::-webkit-scrollbar-track {
                background: var(--bg-secondary);
            }

            .notification-list::-webkit-scrollbar-thumb {
                background: var(--border-color);
                border-radius: 3px;
            }

            .notification-list::-webkit-scrollbar-thumb:hover {
                background: var(--text-secondary);
            }
        `;
    }

    // ===== ATUALIZA ESTILOS DE NOTIFICAÇÃO =====
    updateNotificationStyles() {
        const existingStyles = document.querySelector('#notification-styles');
        if (existingStyles) {
            existingStyles.remove();
        }
        this.injectNotificationStyles();
    }

    // ===== VERIFICA AÇÕES PENDENTES =====
    checkPendingActions() {
        const leads = JSON.parse(localStorage.getItem('plenaLeads')) || [];
        const today = new Date();
        
        console.log('🔍 Verificando ações pendentes...');

        leads.forEach(lead => {
            // Notificar sobre leads críticos não contactados
            if (lead.status === 'critical' && lead.lastContact === 'Nunca') {
                this.addNotification({
                    id: `critical_${lead.id}`,
                    title: '🚨 Lead Crítico Não Contactado',
                    message: `${lead.name} precisa de contato urgente - Potencial: ${lead.potential}⭐`,
                    type: 'urgent',
                    priority: 'high',
                    relatedTo: 'lead',
                    relatedId: lead.id,
                    timestamp: new Date(),
                    read: false
                });
            }

            // Notificar sobre follow-ups pendentes
            if (lead.nextFollowup) {
                const followupDate = new Date(lead.nextFollowup);
                const daysDiff = Math.ceil((followupDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === 0) {
                    this.addNotification({
                        id: `followup_${lead.id}_today`,
                        title: '📅 Follow-up para Hoje',
                        message: `Lembre-se de contactar ${lead.name} - ${lead.nextAction}`,
                        type: 'reminder',
                        priority: 'medium',
                        relatedTo: 'lead',
                        relatedId: lead.id,
                        timestamp: new Date(),
                        read: false
                    });
                } else if (daysDiff === 1) {
                    this.addNotification({
                        id: `followup_${lead.id}_tomorrow`,
                        title: '⏰ Follow-up Amanhã',
                        message: `Prepare contato com ${lead.name} para amanhã`,
                        type: 'reminder',
                        priority: 'medium',
                        relatedTo: 'lead',
                        relatedId: lead.id,
                        timestamp: new Date(),
                        read: false
                    });
                }
            }

            // Notificar sobre alta probabilidade de conversão
            if (lead.conversionProbability >= 80 && lead.lastContact === 'Nunca') {
                this.addNotification({
                    id: `high_potential_${lead.id}`,
                    title: '🎯 Alto Potencial de Conversão',
                    message: `${lead.name} tem ${lead.conversionProbability}% de chance de fechar - Contate agora!`,
                    type: 'urgent',
                    priority: 'high',
                    relatedTo: 'lead',
                    relatedId: lead.id,
                    timestamp: new Date(),
                    read: false
                });
            }

            // Notificar sobre leads antigos não contactados
            const leadDate = new Date(lead.id || lead.createdAt);
            const daysSinceCreation = Math.ceil((today - leadDate) / (1000 * 60 * 60 * 24));
            if (daysSinceCreation > 30 && lead.lastContact === 'Nunca') {
                this.addNotification({
                    id: `old_lead_${lead.id}`,
                    title: '📋 Lead Antigo Não Contactado',
                    message: `${lead.name} está no sistema há ${daysSinceCreation} dias sem contato`,
                    type: 'reminder',
                    priority: 'medium',
                    relatedTo: 'lead',
                    relatedId: lead.id,
                    timestamp: new Date(),
                    read: false
                });
            }
        });

        // Notificação diária de metas
        this.addDailyGoalNotification();
        
        // Notificação semanal de desempenho
        this.addWeeklyPerformanceNotification();
        
        this.updateNotificationBadges();
        this.renderNotifications();
    }

    // ===== ADICIONA NOVA NOTIFICAÇÃO =====
    addNotification(notification) {
        // Verifica se já existe notificação similar não lida
        const exists = this.notifications.find(n => n.id === notification.id && !n.read);
        if (!exists) {
            const newNotification = {
                ...notification,
                id: notification.id || `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            
            this.notifications.unshift(newNotification);
            this.saveNotifications();
            this.updateNotificationBadges();
            this.renderNotifications();
            
            // Mostrar toast notification apenas para não-lidas
            if (!notification.read) {
                this.showToast(newNotification);
            }

            console.log('📨 Nova notificação:', newNotification.title);
        }
    }

    // ===== MOSTRA TOAST NOTIFICATION =====
    showToast(notification) {
        // Limita número de toasts simultâneos
        const existingToasts = document.querySelectorAll('.toast-notification');
        if (existingToasts.length >= 3) {
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification ${notification.type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${this.getNotificationIcon(notification.type)}
            </div>
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.classList.add('hiding'); setTimeout(() => this.parentElement.remove(), 300)">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(toast);

        // Remove automaticamente após 6 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('hiding');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 6000);

        // Auto-remove se o usuário interagir com a notificação
        toast.addEventListener('click', (e) => {
            if (!e.target.classList.contains('toast-close')) {
                this.handleNotificationClick(notification.id);
                toast.classList.add('hiding');
                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        });
    }

    // ===== RETORNA ÍCONE BASEADO NO TIPO =====
    getNotificationIcon(type) {
        const icons = {
            'urgent': '🚨',
            'reminder': '⏰',
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️'
        };
        return icons[type] || '🔔';
    }

    // ===== NOTIFICAÇÃO DIÁRIA DE METAS =====
    addDailyGoalNotification() {
        const lastGoalNotification = localStorage.getItem('lastGoalNotification');
        const today = new Date().toDateString();
        
        if (lastGoalNotification !== today) {
            const criticalLeads = JSON.parse(localStorage.getItem('plenaLeads') || '[]')
                .filter(lead => lead.status === 'critical' && lead.lastContact === 'Nunca').length;

            if (criticalLeads > 0) {
                this.addNotification({
                    id: `daily_goal_${today}`,
                    title: '🎯 Meta do Dia',
                    message: `Você tem ${criticalLeads} lead(s) crítico(s) para contactar hoje! Foco total nesses potenciais.`,
                    type: 'reminder',
                    priority: 'medium',
                    relatedTo: 'dashboard',
                    timestamp: new Date(),
                    read: false
                });
            }

            // Notificação motivacional baseada no dia da semana
            this.addMotivationalNotification();
            
            localStorage.setItem('lastGoalNotification', today);
        }
    }

    // ===== NOTIFICAÇÃO MOTIVACIONAL =====
    addMotivationalNotification() {
        const motivationalMessages = [
            { message: "Ótima semana para fechar novos negócios! 🚀", emoji: "🚀" },
            { message: "Terça-feira é dia de prospecção agressiva! 💪", emoji: "💪" },
            { message: "Metade da semana - momento de acelerar! ⚡", emoji: "⚡" },
            { message: "Quase lá! Último esforço para fechar a semana forte! 🎯", emoji: "🎯" },
            { message: "Sextou! Hora de consolidar a semana de trabalho! 🎉", emoji: "🎉" },
            { message: "Final de semana chegando - planeje a próxima semana! 📅", emoji: "📅" },
            { message: "Domingo é dia de descansar e recarregar as energias! ☀️", emoji: "☀️" }
        ];
        
        const dayOfWeek = new Date().getDay();
        const message = motivationalMessages[dayOfWeek];
        
        if (message) {
            this.addNotification({
                id: `motivational_${new Date().toDateString()}`,
                title: `${message.emoji} Motivação do Dia`,
                message: message.message,
                type: 'info',
                priority: 'low',
                relatedTo: 'dashboard',
                timestamp: new Date(),
                read: false
            });
        }
    }

    // ===== NOTIFICAÇÃO SEMANAL DE DESEMPENHO =====
    addWeeklyPerformanceNotification() {
        const lastWeeklyNotification = localStorage.getItem('lastWeeklyNotification');
        const today = new Date();
        const lastMonday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        
        if (!lastWeeklyNotification || new Date(lastWeeklyNotification) < lastMonday) {
            const leads = JSON.parse(localStorage.getItem('plenaLeads') || '[]');
            const contactedThisWeek = leads.filter(lead => {
                const contactDate = new Date(lead.lastContact);
                return contactDate >= lastMonday && lead.lastContact !== 'Nunca';
            }).length;

            this.addNotification({
                id: `weekly_performance_${lastMonday.toDateString()}`,
                title: '📊 Desempenho Semanal',
                message: `Esta semana você contactou ${contactedThisWeek} leads. Mantenha o bom trabalho!`,
                type: 'info',
                priority: 'low',
                relatedTo: 'dashboard',
                timestamp: new Date(),
                read: false
            });

            localStorage.setItem('lastWeeklyNotification', new Date().toISOString());
        }
    }

    // ===== RENDERIZA NOTIFICAÇÕES NO DROPDOWN =====
    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        if (!notificationList) return;

        if (this.notifications.length === 0) {
            notificationList.innerHTML = this.getEmptyNotificationsState();
            return;
        }

        notificationList.innerHTML = this.notifications
            .slice(0, 20) // Limita a 20 notificações
            .map(notification => this.createNotificationItem(notification))
            .join('');
    }

    // ===== ESTADO VAZIO DE NOTIFICAÇÕES =====
    getEmptyNotificationsState() {
        return `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <div>Nenhuma notificação</div>
                <div>Tudo sob controle! 🎉</div>
            </div>
        `;
    }

    // ===== CRIA ITEM DE NOTIFICAÇÃO =====
    createNotificationItem(notification) {
        const priorityClass = `priority-${notification.priority || 'medium'}`;
        
        return `
            <div class="notification-item ${!notification.read ? 'unread' : ''}" 
                 onclick="notificationSystem.handleNotificationClick('${notification.id}')"
                 data-priority="${notification.priority}">
                <div class="notification-title">
                    <span class="notification-priority ${priorityClass}"></span>
                    ${notification.title}
                </div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
            </div>
        `;
    }

    // ===== MANIPULA CLIQUE NA NOTIFICAÇÃO =====
    handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            // Marca como lida
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationBadges();
            this.renderNotifications();

            // Fechar dropdown
            this.closeDropdown();

            // Ação baseada no tipo de notificação
            this.handleNotificationAction(notification);
        }
    }

    // ===== EXECUTA AÇÃO BASEADA NA NOTIFICAÇÃO =====
    handleNotificationAction(notification) {
        switch (notification.relatedTo) {
            case 'lead':
                this.focusOnLead(notification.relatedId);
                break;
            case 'dashboard':
                this.navigateToSection('dashboard');
                break;
            case 'strategies':
                this.navigateToSection('strategies');
                break;
            case 'reports':
                this.navigateToSection('reports');
                break;
            default:
                console.log('Ação de notificação:', notification);
        }
    }

    // ===== FOCA EM UM LEAD ESPECÍFICO =====
    focusOnLead(leadId) {
        // Navega para a seção de leads
        this.navigateToSection('leads');
        
        // Aqui você implementaria highlight ou scroll para o lead específico
        console.log('Focando no lead:', leadId);
        
        // Feedback visual
        setTimeout(() => {
            this.showToast({
                title: '🎯 Navegando para o Lead',
                message: `Lead ID: ${leadId} destacado na lista`,
                type: 'info'
            });
        }, 500);
    }

    // ===== NAVEGA PARA UMA SEÇÃO =====
    navigateToSection(sectionName) {
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            navItem.click();
        }
    }

    // ===== MARCA TODAS COMO LIDAS =====
    markAllAsRead() {
        let markedCount = 0;
        
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
                markedCount++;
            }
        });
        
        this.saveNotifications();
        this.updateNotificationBadges();
        this.renderNotifications();
        
        // Feedback
        if (markedCount > 0) {
            this.showToast({
                title: '✅ Notificações Lidas',
                message: `${markedCount} notificação(ões) marcada(s) como lida(s)`,
                type: 'success'
            });
        }
        
        this.closeDropdown();
    }

    // ===== MARCA COMO VISUALIZADAS (SEM LER) =====
    markAllAsViewed() {
        // Apenas atualiza o badge, não marca como lida
        this.updateNotificationBadges();
    }

    // ===== ATUALIZA BADGES DE NOTIFICAÇÃO =====
    updateNotificationBadges() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Badge no header
        const headerBadge = document.getElementById('headerAlerts');
        if (headerBadge) {
            headerBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
            headerBadge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
        
        // Badge no sidebar
        const sidebarBadge = document.getElementById('sidebarAlerts');
        if (sidebarBadge) {
            sidebarBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
            sidebarBadge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }

        // Atualizar estatística no dashboard
        this.updateDashboardStats();
    }

    // ===== ATUALIZA ESTATÍSTICAS NO DASHBOARD =====
    updateDashboardStats() {
        const pendingActions = document.getElementById('pendingActions');
        if (pendingActions) {
            pendingActions.textContent = this.unreadCount;
        }
    }

    // ===== FORMATA TIMESTAMP =====
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `Há ${diffMins} min`;
        if (diffHours < 24) return `Há ${diffHours} h`;
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `Há ${diffDays} dias`;
        if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} sem`;
        
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }

    // ===== SALVA NOTIFICAÇÕES =====
    saveNotifications() {
        // Mantém apenas as últimas 100 notificações
        this.notifications = this.notifications.slice(0, 100);
        localStorage.setItem('plenaNotifications', JSON.stringify(this.notifications));
    }

    // ===== LIMPA NOTIFICAÇÕES ANTIGAS =====
    cleanupOldNotifications() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const initialCount = this.notifications.length;
        this.notifications = this.notifications.filter(
            notification => new Date(notification.timestamp) > thirtyDaysAgo
        );
        
        this.saveNotifications();
        this.updateNotificationBadges();
        
        if (this.notifications.length < initialCount) {
            console.log(`🧹 Limpas ${initialCount - this.notifications.length} notificações antigas`);
        }
    }

    // ===== NOTIFICAÇÃO DE SUCESSO =====
    showSuccessNotification(title, message) {
        this.addNotification({
            title: `✅ ${title}`,
            message: message,
            type: 'success',
            priority: 'low',
            relatedTo: 'dashboard',
            timestamp: new Date(),
            read: false
        });
    }

    // ===== NOTIFICAÇÃO DE ERRO =====
    showErrorNotification(title, message) {
        this.addNotification({
            title: `❌ ${title}`,
            message: message,
            type: 'urgent',
            priority: 'high',
            relatedTo: 'dashboard',
            timestamp: new Date(),
            read: false
        });
    }

    // ===== NOTIFICAÇÃO INFORMATIVA =====
    showInfoNotification(title, message) {
        this.addNotification({
            title: `ℹ️ ${title}`,
            message: message,
            type: 'info',
            priority: 'low',
            relatedTo: 'dashboard',
            timestamp: new Date(),
            read: false
        });
    }

    // ===== NOTIFICAÇÃO DE ALERTA =====
    showWarningNotification(title, message) {
        this.addNotification({
            title: `⚠️ ${title}`,
            message: message,
            type: 'reminder',
            priority: 'medium',
            relatedTo: 'dashboard',
            timestamp: new Date(),
            read: false
        });
    }

    // ===== LIMPA TODAS AS NOTIFICAÇÕES =====
    clearAllNotifications() {
        const count = this.notifications.length;
        this.notifications = [];
        this.saveNotifications();
        this.updateNotificationBadges();
        this.renderNotifications();
        
        this.showToast({
            title: '🗑️ Notificações Limpas',
            message: `${count} notificação(ões) removida(s)`,
            type: 'info'
        });
    }

    // ===== EXPORTA NOTIFICAÇÕES =====
    exportNotifications() {
        const data = {
            exportedAt: new Date().toISOString(),
            total: this.notifications.length,
            unread: this.unreadCount,
            notifications: this.notifications
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notificacoes-plena-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast({
            title: '📤 Exportação Concluída',
            message: `${this.notifications.length} notificação(ões) exportada(s)`,
            type: 'success'
        });
    }
}

// ===== INSTÂNCIA GLOBAL =====
const notificationSystem = new NotificationSystem();

// ===== FUNÇÕES GLOBAIS =====
function markAllAsRead() {
    notificationSystem.markAllAsRead();
}

function showNotification(title, message, type = 'info') {
    notificationSystem.addNotification({
        title: title,
        message: message,
        type: type,
        relatedTo: 'dashboard',
        timestamp: new Date(),
        read: false
    });
}

function testNotificationSystem() {
    const types = ['info', 'success', 'warning', 'urgent'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    showNotification(
        'Teste de Notificação',
        `Esta é uma notificação de teste do tipo ${type}. Gerada em ${new Date().toLocaleTimeString()}.`,
        type
    );
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
// Cleanup a cada 24 horas
setInterval(() => {
    notificationSystem.cleanupOldNotifications();
}, 24 * 60 * 60 * 1000);

// Cleanup também quando a página é carregada
window.addEventListener('load', () => {
    notificationSystem.cleanupOldNotifications();
});

// Atualiza notificações quando a página ganha foco
window.addEventListener('focus', () => {
    notificationSystem.checkPendingActions();
});

// ===== TRATAMENTO DE ERROS =====
window.addEventListener('error', (e) => {
    console.error('Erro no sistema de notificações:', e.error);
});

// ===== EXPORTAÇÃO PARA DESENVOLVIMENTO =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationSystem, notificationSystem };
}