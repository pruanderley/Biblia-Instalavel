/**
 * 🔥 SELETOR DE VERSÕES - VERSÃO FINAL
 * 
 * Funciona perfeitamente com seu index.html
 * Carrega os dados corretamente
 * Expõe como bibleDataExterno (seu código procura por isso!)
 */

class BibleVersionsSimple {
  static versions = {};
  static currentVersion = 'JFA';
  static versionOrder = [];
  
  static async init(versionNames = ['JFA'], defaultVersion = null) {
    console.log('🔥 Iniciando Seletor de Versões...');
    console.log('📚 Versões a carregar:', versionNames);
    
    this.versionOrder = versionNames;
    
    // Carrega todas as versões
    for (const version of versionNames) {
      await this.loadVersion(version);
    }
    
    // Define versão padrão
    const saved = localStorage.getItem('biblia_version');
    this.currentVersion = saved || defaultVersion || versionNames[0];
    
    // IMPORTANTE: Expõe os dados como bibleDataExterno
    // (seu index.html procura por essa variável!)
    window.bibleDataExterno = this.versions[this.currentVersion];
    window.bibleData = this.versions[this.currentVersion];
    
    console.log('✅ Dados carregados!');
    console.log('📖 Versão Ativa:', this.currentVersion);
    console.log('📚 Livros:', window.bibleDataExterno.length);
    
    // Cria o seletor na barra
    this.createVersionButton();
    
    // Aguarda um pouco antes de renderizar (deixa dados prontos)
    setTimeout(() => {
      // Dispara evento para carregar/renderizar
      window.dispatchEvent(new CustomEvent('bible-data-ready'));
      console.log('✅ Evento: bible-data-ready disparado');
    }, 100);
  }
  
  static async loadVersion(versionName) {
    return new Promise((resolve, reject) => {
      console.log(`📖 Carregando ${versionName}...`);
      
      const script = document.createElement('script');
      script.src = `Biblia_data_${versionName}.js`;
      
      script.onload = () => {
        console.log(`✅ Script carregado: Biblia_data_${versionName}.js`);
        
        // Tenta encontrar os dados (varias tentativas)
        let data = null;
        
        // Tenta varias nomenclaturas
        data = data || window[`bibleDataExterno_${versionName}`];
        data = data || window[`bibleData_${versionName}`];
        data = data || window.bibleDataExterno;
        data = data || window.bibleData;
        
        if (data && Array.isArray(data) && data.length > 0) {
          this.versions[versionName] = data;
          console.log(`✅ '${versionName}' carregada com sucesso (${data.length} livros)`);
          resolve(data);
        } else {
          console.error(`❌ Dados inválidos para ${versionName}`);
          reject(new Error(`Dados inválidos para ${versionName}`));
        }
      };
      
      script.onerror = () => {
        console.error(`❌ Erro ao carregar: Biblia_data_${versionName}.js`);
        reject(new Error(`Arquivo não encontrado: Biblia_data_${versionName}.js`));
      };
      
      document.head.appendChild(script);
    });
  }
  
  static switchVersion(versionName) {
    if (!this.versions[versionName]) {
      console.error(`❌ Versão '${versionName}' não carregada!`);
      return false;
    }
    
    this.currentVersion = versionName;
    
    // CRUCIAL: Atualiza a variável global que seu código usa!
    window.bibleDataExterno = this.versions[versionName];
    window.bibleData = this.versions[versionName];
    
    localStorage.setItem('biblia_version', versionName);
    this.updateButton();
    
    // Dispara evento para recarregar a página
    window.dispatchEvent(new CustomEvent('bible-version-changed', {
      detail: { version: versionName }
    }));
    
    console.log(`📖 Versão alterada para: ${versionName}`);
    
    // Recarrega o capítulo (chama a função do seu code)
    if (typeof renderChapter === 'function') {
      setTimeout(() => renderChapter(), 50);
    }
    
    return true;
  }
  
  static createVersionButton() {
    const navBar = document.getElementById('nav-bar');
    if (!navBar) {
      console.warn('⚠️  nav-bar não encontrado!');
      return;
    }
    
    this.injectCSS();
    
    const container = document.createElement('div');
    container.id = 'bible-version-container';
    container.className = 'bible-version-container';
    container.innerHTML = `
      <div class="bible-version-btn-wrapper">
        <button class="bible-version-btn" id="bible-version-btn" title="Mudar versão">
          <span class="bible-version-text">${this.currentVersion}</span>
        </button>
        
        <div class="bible-version-menu" id="bible-version-menu">
          ${this.versionOrder.map(v => `
            <button class="bible-version-item ${v === this.currentVersion ? 'active' : ''}" 
                    data-version="${v}" title="${v}">
              ${v}${v === this.currentVersion ? ' ✓' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    navBar.appendChild(container);
    
    const btn = document.getElementById('bible-version-btn');
    const menu = document.getElementById('bible-version-menu');
    
    if (btn && menu) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('visible');
      });
      
      menu.querySelectorAll('.bible-version-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const version = item.dataset.version;
          this.switchVersion(version);
          menu.classList.remove('visible');
        });
      });
      
      document.addEventListener('click', () => {
        menu.classList.remove('visible');
      });
    }
  }
  
  static updateButton() {
    const btn = document.querySelector('.bible-version-btn');
    if (btn) {
      const text = btn.querySelector('.bible-version-text');
      if (text) text.textContent = this.currentVersion;
    }
    
    const menu = document.getElementById('bible-version-menu');
    if (menu) {
      menu.querySelectorAll('.bible-version-item').forEach(item => {
        item.classList.remove('active');
        const version = item.dataset.version;
        if (version === this.currentVersion) {
          item.classList.add('active');
          item.textContent = `${version} ✓`;
        } else {
          item.textContent = version;
        }
      });
    }
  }
  
  static injectCSS() {
    if (document.getElementById('bible-version-css')) return;
    
    const style = document.createElement('style');
    style.id = 'bible-version-css';
    style.textContent = `
      .bible-version-container {
        display: flex;
        align-items: center;
        margin-left: auto;
        margin-right: 8px;
      }
      
      .bible-version-btn-wrapper {
        position: relative;
      }
      
      .bible-version-btn {
        width: 56px;
        height: 40px;
        padding: 8px 12px;
        background: var(--bg-card, #1e1812);
        border: 1px solid var(--border, #3a2e22);
        border-radius: 8px;
        color: var(--text-primary, #e6dbc8);
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Cinzel', Georgia, serif;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .bible-version-btn:hover {
        background: var(--bg-secondary, #161110);
        border-color: var(--accent-gold, #D4A528);
        color: var(--accent-gold, #D4A528);
      }
      
      .bible-version-btn:active {
        transform: scale(0.95);
      }
      
      .bible-version-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 6px;
        background: var(--bg-panel, #261f17);
        border: 1px solid var(--border, #3a2e22);
        border-radius: 8px;
        min-width: 120px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
      }
      
      .bible-version-menu.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .bible-version-item {
        padding: 10px 14px;
        background: transparent;
        border: none;
        color: var(--text-secondary, #c4a06a);
        font-size: 13px;
        font-family: 'Cinzel', Georgia, serif;
        cursor: pointer;
        text-align: center;
        transition: all 0.15s ease;
        letter-spacing: 0.5px;
        font-weight: 600;
      }
      
      .bible-version-item:hover {
        background: rgba(212, 165, 40, 0.1);
        color: var(--accent-gold, #D4A528);
      }
      
      .bible-version-item.active {
        background: rgba(212, 165, 40, 0.15);
        color: var(--accent-gold, #D4A528);
        border-left: 3px solid var(--accent-gold, #D4A528);
        padding-left: 11px;
      }
      
      body.light .bible-version-btn {
        background: var(--bg-card, #f0f0f0);
        border-color: var(--border, #c8bca8);
        color: var(--text-primary, #2a2218);
      }
      
      body.light .bible-version-btn:hover {
        background: var(--bg-secondary, #f5f5f5);
        border-color: var(--accent-gold, #9A7200);
        color: var(--accent-gold, #9A7200);
      }
      
      body.light .bible-version-menu {
        background: var(--bg-panel, #eae4d8);
        border-color: var(--border, #c8bca8);
      }
      
      body.light .bible-version-item {
        color: var(--text-secondary, #3a2a14);
      }
      
      body.light .bible-version-item:hover {
        background: rgba(154, 114, 0, 0.1);
        color: var(--accent-gold, #9A7200);
      }
      
      body.light .bible-version-item.active {
        background: rgba(154, 114, 0, 0.15);
        color: var(--accent-gold, #9A7200);
        border-color: var(--accent-gold, #9A7200);
      }
    `;
    document.head.appendChild(style);
  }
}

console.log('✅ BibleVersionsSimple FINAL carregado!');
