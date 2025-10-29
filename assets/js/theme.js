// theme.js – Controle de tema Plena Captação v1.2 - CORRIGIDO
// Corrigido: persistência no localStorage + sincronização total + função isDarkTheme

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;
  const sidebar = document.querySelector(".sidebar");

  // Verifica o tema salvo ou padrão dark
  const savedTheme = localStorage.getItem("plenaTheme") || "dark";
  html.setAttribute("data-theme", savedTheme);
  applyTheme(savedTheme);

  // Atualiza visual e texto do botão
  updateThemeButton(savedTheme);

  // Ação do botão de alternância
  themeToggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", next);
    localStorage.setItem("plenaTheme", next);
    applyTheme(next);
    updateThemeButton(next);
    showThemeNotification(next);
    
    // Dispara evento para outros componentes
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: next } }));
  });

  function applyTheme(theme) {
    // Aplica gradiente correto na sidebar
    if (theme === "dark") {
      sidebar.style.background = "linear-gradient(135deg, #000 0%, #1a1a1a 100%)";
      sidebar.style.color = "#fff";
      document.body.style.background = "var(--bg-primary)";
    } else {
      sidebar.style.background = "linear-gradient(135deg, #ffffff 0%, #f1f1f1 100%)";
      sidebar.style.color = "#000";
      document.body.style.background = "var(--bg-primary)";
    }
  }

  function updateThemeButton(theme) {
    const icon = theme === "dark" ? "🌙" : "☀️";
    const text = theme === "dark" ? "Modo Claro" : "Modo Escuro";
    themeToggle.innerHTML = `<span>${icon}</span> ${text}`;
  }

  function showThemeNotification(theme) {
    const msg = theme === "dark" ? "Modo escuro ativado" : "Modo claro ativado";
    const notif = document.createElement("div");
    notif.textContent = msg;
    notif.style.position = "fixed";
    notif.style.top = "20px";
    notif.style.right = "20px";
    notif.style.background = theme === "dark" ? "#1a1a1a" : "#fff";
    notif.style.color = theme === "dark" ? "#fff" : "#000";
    notif.style.padding = "12px 18px";
    notif.style.borderRadius = "8px";
    notif.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
    notif.style.zIndex = "2000";
    notif.style.fontSize = "0.9rem";
    notif.style.fontWeight = "500";
    notif.style.transition = "opacity 0.3s ease";
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.style.opacity = "0";
      setTimeout(() => notif.remove(), 400);
    }, 1800);
  }
});

// Função global para verificar tema atual
function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}