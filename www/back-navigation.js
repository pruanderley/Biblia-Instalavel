// ── CONTROLE DO BOTÃO VOLTAR DO ANDROID ──
(function() {

  function handleAndroidBackButton() {

    // 1. Harpa aberta — navega dentro dela
    var harpaApp = document.getElementById('harpa-app');
    if (harpaApp && harpaApp.classList.contains('open')) {
      if (typeof hp_navBack === 'function') {
        hp_navBack();
        return true;
      }
    }

    // 2. Painel aberto — fecha
    var openPanels = document.querySelectorAll('.panel-overlay.open');
    if (openPanels.length > 0) {
      var lastPanel = openPanels[openPanels.length - 1];
      if (lastPanel && lastPanel.id) {
        if (typeof closePanel === 'function') closePanel(lastPanel.id);
        return true;
      }
    }

    // 3. Nada aberto — Android fecha o app
    return false;
  }

  // Capacitor
  if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.App) {
    Capacitor.Plugins.App.addListener('backButton', function() {
      handleAndroidBackButton();
    });
  }

  // Fallback WebView antigo
  document.addEventListener('backbutton', function(e) {
    e.preventDefault();
    handleAndroidBackButton();
  }, false);

  // Expor globalmente para MainActivity.java
  window.handleBack = function() {
    return handleAndroidBackButton();
  };

  console.log('✅ Controle de Voltar do Android ativado!');
})();
