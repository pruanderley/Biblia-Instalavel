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

    // 3. Nada aberto — mostra diálogo de saída da Bíblia
    showExitDialog();
    return true;
  }

  function showExitDialog() {
    // Remove se já existe
    var ex = document.getElementById('biblia-exit-dialog');
    if (ex) { ex.remove(); return; }

    var d = document.createElement('div');
    d.id = 'biblia-exit-dialog';
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;' +
      'align-items:center;justify-content:center;background:rgba(0,0,0,0.75);';
    d.innerHTML =
      '<div style="background:#1a1008;border:1px solid #C8962D;border-radius:20px;' +
      'padding:28px 24px;max-width:300px;width:88%;text-align:center;">' +
        '<div style="font-size:28px;margin-bottom:8px;">📖</div>' +
        '<div style="font-family:Cinzel,serif;font-size:14px;color:#C8962D;' +
        'letter-spacing:1px;margin-bottom:20px;">O QUE DESEJA FAZER?</div>' +
        '<button onclick="document.getElementById(\'biblia-exit-dialog\').remove();' +
        'if(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App){' +
        'window.Capacitor.Plugins.App.exitApp();}" ' +
        'style="width:100%;padding:13px;border-radius:12px;border:none;margin-bottom:10px;' +
        'background:linear-gradient(135deg,#C8962D,#e6b84a);color:#0d0a08;' +
        'font-family:Cinzel,serif;font-size:13px;font-weight:700;cursor:pointer;">' +
        '🚪 Encerrar Aplicativo</button>' +
        '<button onclick="document.getElementById(\'biblia-exit-dialog\').remove();" ' +
        'style="width:100%;padding:10px;border-radius:12px;border:none;' +
        'background:transparent;color:#8a7a5a;font-family:Lato,sans-serif;' +
        'font-size:13px;cursor:pointer;">Cancelar</button>' +
      '</div>';
    document.body.appendChild(d);
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
