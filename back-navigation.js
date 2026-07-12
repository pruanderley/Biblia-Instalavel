// ── CONTROLE DO BOTÃO VOLTAR DO ANDROID (WebView) ──
// Este script resolve a navegação nativa para a Bíblia e a Harpa

(function() {
    
    // Função que o Android chama quando o botão Voltar físico é pressionado
    function handleAndroidBackButton() {
        
        // 1. Se a Harpa estiver aberta...
        var harpaApp = document.getElementById('harpa-app');
        if (harpaApp && harpaApp.classList.contains('open')) {
            
            // Tenta chamar a função de voltar da Harpa
            if (typeof hp_navBack === 'function') {
                hp_navBack();
                return true; // Impede o Android de fechar o app
            }
        }

        // 2. Se algum menu/painel da Bíblia estiver aberto...
        var openPanels = document.querySelectorAll('.panel-overlay.open');
        if (openPanels.length > 0) {
            // Pega o último painel aberto (o mais alto na tela) e fecha
            var lastPanel = openPanels[openPanels.length - 1];
            if (lastPanel && lastPanel.id) {
                closePanel(lastPanel.id);
                return true; // Impede o Android de fechar o app
            }
        }

        // 3. Se estiver tudo fechado, o Android fecha o app naturalmente.
        return false;
    }

    // ── Integração com o Capacitor (O "Pulo do Gato") ──
    // O Capacitor fornece um plugin nativo para ouvir o botão voltar
    if (typeof Capacitor !== 'undefined' && Capacitor.Plugins && Capacitor.Plugins.App) {
        Capacitor.Plugins.App.addListener('backButton', function() {
            handleAndroidBackButton();
        });
    } 
    
    // ── Integração com WebView padrão (fallback para navegadores/PWA) ──
    // Caso o Capacitor não esteja disponível (ex: abrindo no Chrome comum)
    window.addEventListener('popstate', function(e) {
        // O navegador já lida com o popstate. Se quisermos sobrescrever
        // o comportamento padrão, podemos usar o código abaixo, 
        // mas atualmente o seu index.html já lida bem com ele.
    });

    // ── Dica extra para casos de WebView antigos ──
    // Alguns WebViews chamam este evento:
    document.addEventListener('backbutton', function(e) {
        e.preventDefault();
        handleAndroidBackButton();
    }, false);

    console.log('✅ Controle de Voltar do Android ativado!');
})();