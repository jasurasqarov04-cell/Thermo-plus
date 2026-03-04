function renderFavs() {
  const lang = getCurrentLang();
  const favProds = Favs.products();
  const grid = document.getElementById('fav-grid');
  const empty = document.getElementById('empty-state');
  const clearBtn = document.getElementById('clear-btn');
  const title = document.getElementById('page-title');
  const emptyTitle = document.getElementById('empty-title');
  const emptyText = document.getElementById('empty-text');
  const goCat = document.getElementById('go-catalog');
  const clearLabel = document.getElementById('clear-label');

  if (title) title.textContent = `❤️ ${lang==='uz'?'Sevimlilar':'Избранное'} (${favProds.length})`;
  if (emptyTitle) emptyTitle.textContent = lang==='uz'?'Sevimlilar yo\'q':'Нет избранного';
  if (emptyText) emptyText.textContent = lang==='uz'?'Mahsulot kartasidagi ❤️ ni bosing':'Нажмите ❤️ на карточке товара';
  if (goCat) goCat.textContent = lang==='uz'?'Katalogga o\'tish':'Перейти в каталог';
  if (clearLabel) clearLabel.textContent = lang==='uz'?'Hammasini o\'chirish':'Очистить всё';

  if (!grid || !empty) return;

  if (favProds.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    if (clearBtn) clearBtn.style.display = 'none';
  } else {
    empty.classList.add('hidden');
    if (clearBtn) clearBtn.style.display = 'block';
    grid.innerHTML = favProds.map(p => buildProductCard(p, thickState[p.id])).join('');
  }
  Cart.updateBadge();
}

function clearFavs() {
  const lang = getCurrentLang();
  const msg = lang==='uz'?'Barcha sevimlilarni o\'chirasizmi?':'Очистить весь список избранного?';
  if (confirm(msg)) {
    Store.set('tp_favs', []);
    renderFavs();
    showToast(lang==='uz'?'💔 Sevimlilar tozalandi':'💔 Избранное очищено');
  }
}
