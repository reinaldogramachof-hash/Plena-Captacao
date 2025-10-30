// =============================================
// THEME MANAGER v1.5 - Plena Informática - CORRIGIDO
// Sistema de Captação de clientes
// =============================================
(function () {
  const STORAGE_KEY = "plenaTheme";

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
    }
    
    // Atualiza rótulos do botão
    if (btn) {
      const iconSpan = btn.querySelector(".theme-icon");
      const labelSpan = btn.querySelector(".theme-label");
      if (iconSpan) iconSpan.textContent = theme === "dark" ? "🌙" : "☀️";
      if (labelSpan) labelSpan.textContent = theme === "dark" ? "Modo Claro" : "Modo Escuro";
    }

    // Dispara evento para outros componentes
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    
    console.log(`🎨 Tema aplicado: ${theme}`);
  }

  function getSavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return root.getAttribute("data-theme") || "dark";
  }

  function setTheme(theme) {
    if (theme !== "light" && theme !== "dark") {
      console.warn("Tema inválido:", theme);
      return;
    }
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }

  function toggle() {
    const current = getSavedTheme();
    const newTheme = current === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }

  // Funções auxiliares para gráficos
  function getChartTextColor() {
    const theme = getSavedTheme();
    return theme === "dark" ? "#ffffff" : "#333333";
  }

  function getChartGridColor() {
    const theme = getSavedTheme();
    return theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  }

  function getChartBackgroundColor() {
    const theme = getSavedTheme();
    return theme === "dark" ? "#2e2e2e" : "#ffffff";
  }

  // Expondo como API global
  window.themeManager = { 
    get: getSavedTheme, 
    set: setTheme, 
    toggle,
    getChartTextColor,
    getChartGridColor,
    getChartBackgroundColor
  };

  // Inicialização
  document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    
    if (btn) {
      btn.addEventListener("click", toggle);
      btn.setAttribute("aria-label", `Alternar para modo ${savedTheme === 'dark' ? 'claro' : 'escuro'}`);
    }

    console.log("🎨 Theme Manager - Plena Informática");
  });

  // Suporte para mudança de tema via sistema operacional
  if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const theme = e.matches ? "dark" : "light";
        applyTheme(theme);
      }
    });
  }
})();