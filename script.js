/**
 * ZUVEX WEB — Script de Integração Automática com GitHub Releases
 * Desenvolvido para https://github.com/alefdias/ZUVEXWEB
 */

document.addEventListener('DOMContentLoaded', () => {
  initReleaseDownloader();
  initFaqAccordion();
  initNavbarScroll();
});

/**
 * Consulta a API do GitHub para buscar a versão mais recente e o link direto do APK
 */
async function initReleaseDownloader() {
  const repo = 'alefdias/ZUVEX';
  const apiUrl = `https://api.github.com/repos/${repo}/releases`;
  const fallbackUrl = `https://github.com/${repo}/releases/latest`;

  // Elementos da interface
  const releasePill = document.getElementById('release-tag-text');
  const heroBtn = document.getElementById('hero-download-btn');
  const heroBtnMeta = document.getElementById('hero-btn-meta');
  const navBtn = document.getElementById('nav-download-btn');
  const mainBtn = document.getElementById('main-download-btn');
  const mainBtnMeta = document.getElementById('main-btn-meta');
  const infoVersion = document.getElementById('info-version');
  const infoSize = document.getElementById('info-size');
  const infoDate = document.getElementById('info-date');
  const qrImg = document.getElementById('download-qr-img');
  const qrSpinner = document.getElementById('qr-spinner');

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const releases = await res.json();
    if (!Array.isArray(releases) || releases.length === 0) {
      throw new Error('Nenhuma release encontrada no repositório.');
    }

    // Procura a release mais recente que possui um arquivo .apk em assets
    let apkAsset = null;
    let targetRelease = null;

    for (const r of releases) {
      if (r.assets && r.assets.length > 0) {
        const found = r.assets.find(a => a.name.toLowerCase().endsWith('.apk'));
        if (found) {
          apkAsset = found;
          targetRelease = r;
          break;
        }
      }
    }

    if (!apkAsset) {
      throw new Error('Nenhum arquivo APK anexado às releases.');
    }

    // Dados extraídos com sucesso
    const downloadUrl = apkAsset.browser_download_url;
    const versionTag = targetRelease.tag_name || targetRelease.name || 'v1.0';
    const sizeMb = (apkAsset.size / (1024 * 1024)).toFixed(1) + ' MB';
    
    const rawDate = apkAsset.created_at || targetRelease.published_at;
    const dateFormatted = rawDate 
      ? new Date(rawDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'Recente';

    // 1. Atualiza Badge do Topo
    if (releasePill) {
      releasePill.textContent = `🚀 Versão ${versionTag} Disponível para Android`;
    }

    // 2. Atualiza Botão Hero
    if (heroBtn) {
      heroBtn.href = downloadUrl;
    }
    if (heroBtnMeta) {
      heroBtnMeta.textContent = `${versionTag} • ${sizeMb} • Download direto`;
    }

    // 3. Atualiza Botão Nav
    if (navBtn) {
      navBtn.href = downloadUrl;
      const navSpan = navBtn.querySelector('span');
      if (navSpan) navSpan.textContent = `Baixar (${versionTag})`;
    }

    // 4. Atualiza Botão Principal da Seção Download
    if (mainBtn) {
      mainBtn.href = downloadUrl;
    }
    if (mainBtnMeta) {
      mainBtnMeta.textContent = `Arquivo APK Oficial • ${sizeMb} • ${versionTag}`;
    }

    // 5. Atualiza Tabela de Detalhes
    if (infoVersion) infoVersion.textContent = `${versionTag} (Release)`;
    if (infoSize) infoSize.textContent = `${sizeMb} (${apkAsset.name})`;
    if (infoDate) infoDate.textContent = dateFormatted;

    // 6. Gera o QR Code dinâmico apontando direto para o APK
    if (qrImg && qrSpinner) {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(downloadUrl)}`;
      qrImg.src = qrApiUrl;
      qrImg.onload = () => {
        qrSpinner.style.display = 'none';
        qrImg.style.display = 'block';
      };
      qrImg.onerror = () => {
        // Fallback para QuickChart
        qrImg.src = `https://quickchart.io/qr?size=250&text=${encodeURIComponent(downloadUrl)}`;
      };
    }

    console.log(`✅ [ZUVEX] Link direto do APK atualizado para: ${downloadUrl} (${sizeMb})`);

  } catch (error) {
    console.warn('⚠️ [ZUVEX] Não foi possível consultar a API do GitHub:', error);

    // Aplica links de fallback universais
    if (heroBtn) heroBtn.href = fallbackUrl;
    if (navBtn) navBtn.href = fallbackUrl;
    if (mainBtn) mainBtn.href = fallbackUrl;

    if (releasePill) releasePill.textContent = '🚀 Versão Oficial Disponível no GitHub';
    if (heroBtnMeta) heroBtnMeta.textContent = 'Download direto do GitHub Releases';
    if (mainBtnMeta) mainBtnMeta.textContent = 'Baixar versão mais recente';

    if (infoVersion) infoVersion.textContent = 'Versão Mais Recente';
    if (infoSize) infoSize.textContent = '~56 MB (APK Release)';
    if (infoDate) infoDate.textContent = 'Atualização contínua';

    if (qrImg && qrSpinner) {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(fallbackUrl)}`;
      qrImg.src = qrApiUrl;
      qrImg.onload = () => {
        qrSpinner.style.display = 'none';
        qrImg.style.display = 'block';
      };
    }
  }
}

/**
 * Accordion Interativo para a seção de Dúvidas (FAQ)
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Fecha todos os outros itens
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherAns = other.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      // Alterna o item clicado
      if (isActive) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/**
 * Efeito visual de blur e sombra no Navbar ao rolar a página
 */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.background = 'rgba(8, 7, 13, 0.9)';
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
    } else {
      navbar.style.background = 'rgba(8, 7, 13, 0.7)';
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });
}
