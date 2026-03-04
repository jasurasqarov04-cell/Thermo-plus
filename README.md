# THERMO PLUS — Telegram Mini App v2
### СП ООО "KHOREZM INSULATION GROUP" | Базальтовая теплоизоляция

---

## 📁 Структура файлов / File Structure

```
thermoplus/
├── index.html          ← Каталог / Catalog
├── about.html          ← Главная / Home
├── calculator.html     ← Калькулятор / Calculator
├── checkout.html       ← Корзина / Cart & Order
├── favorites.html      ← Избранное / Favorites
├── contacts.html       ← Контакты / Contacts
│
├── style.css           ← Общие стили (минималистичный дизайн v2)
├── app.js              ← Общая логика: корзина, избранное, карточки
├── calculator.js       ← Логика калькулятора
├── checkout.js         ← Логика заказа
├── favorites.js        ← Логика избранного
├── i18n.js             ← Переводы: UZ / RU / EN (3 языка)
├── products.json       ← База данных 23 продуктов
│
└── images/
    ├── logo.png        ← ⭐ ВАШ ЛОГОТИП (добавить!)
    ├── facade.webp     ← Фото товара
    ├── ...             ← (23 файла фото товаров)
    └── IMAGES_GUIDE.md ← Список всех нужных файлов
```

---

## 🖼️ Как добавить логотип и фото товаров

### Логотип бренда
1. Подготовьте файл: `logo.png` (рекомендуется 72×72px, прозрачный фон)
2. Положите в папку `images/`
3. Путь: `images/logo.png`

Если файл не найден — автоматически покажется emoji 🔥

### Фото товаров
Каждый товар в `products.json` имеет поле `"image"`, например:
```json
"image": "images/facade.webp"
```

Чтобы добавить фото:
1. Подготовьте фото (рекомендуется 600×400px, формат .webp или .jpg)
2. Назовите файл точно как указано в `products.json`
3. Положите в папку `images/`

Если фото нет — покажется emoji категории товара (🧱 / 🏗️ / 🔲 и т.д.)

Полный список файлов фото: `images/IMAGES_GUIDE.md`

---

## 🌐 Языки / Languages

Приложение поддерживает **3 языка**:
- 🇺🇿 **UZ** — Узбекский (по умолчанию)
- 🇷🇺 **RU** — Русский
- 🇬🇧 **EN** — English

Переключение: кнопки **UZ / RU / EN** в шапке каждой страницы.

Выбор языка сохраняется в браузере (localStorage).

---

## 🚀 Установка / Installation

### Вариант 1: GitHub Pages (бесплатно)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/thermoplus-miniapp.git
git push -u origin main
# Settings → Pages → Source: main branch
# URL будет: https://YOUR_USER.github.io/thermoplus-miniapp/
```

### Вариант 2: Vercel (бесплатно, быстро)
1. Зайдите на vercel.com
2. Нажмите "New Project" → "Import Git Repository"
3. Выберите репозиторий
4. Deploy!

### Вариант 3: Любой хостинг
Загрузите все файлы в публичную папку (public_html).
Точка входа: `about.html` или `index.html`

---

## 🤖 Подключение к Telegram

1. Откройте **@BotFather** в Telegram
2. Команда `/newbot` → создайте бота
3. Команда `/newapp` → добавьте Mini App
4. Укажите URL вашего сайта (например: `https://your-site.com/about.html`)
5. Готово! Откройте Mini App через кнопку в боте

---

## ⚙️ Настройка Bitrix24

В файле `app.js` замените строки:
```js
const B24_WEBHOOK = 'https://YOUR_DOMAIN.bitrix24.ru/rest/1/YOUR_CODE';
const B24_MANAGER = 1; // ID ответственного менеджера
```

Вебхук создаётся в Битрикс24:
**Разработчикам → Входящие вебхуки → Добавить**

---

## 📦 Добавление/изменение товаров

Все 23 товара хранятся в `products.json`.

Для добавления нового товара скопируйте любой блок и измените:
```json
{
  "id": 24,
  "code": "NEW",
  "name": "THERMO NEW PRODUCT",
  "category": "facade",
  "density": 100,
  "thicknesses": [50, 80, 100],
  "size": "1200×600",
  "lambda": 0.036,
  "fire": "НГ",
  "temp": 750,
  "packArea": 4.32,
  "packSlabs": 6,
  "pricePerM2": 45000,
  "badge": "NEW",
  "desc_uz": "Yangi mahsulot tavsifi",
  "desc_ru": "Описание нового товара",
  "desc_en": "New product description",
  "image": "images/newproduct.webp"
}
```

Доступные категории (`category`):
- `facade` — Fasad / Фасад / Facade
- `vent` — Vent. fasad / Вент. фасад / Vent. facade
- `roof` — Tom / Кровля / Roof
- `floor` — Pol / Пол / Floor
- `universal` — Universal / Универсал / Universal
- `sandwich` — Sandwich / Сэндвич / Sandwich

---

## 💰 Изменение цен

Цены хранятся в `products.json` в поле `pricePerM2` (цена за 1 м² при толщине 50 мм).

Для других толщин цена пересчитывается автоматически:
```
50 мм  → pricePerM2 × 1.0
80 мм  → pricePerM2 × 1.6
100 мм → pricePerM2 × 2.0
120 мм → pricePerM2 × 2.4
150 мм → pricePerM2 × 3.0
```

---

## 🧮 Формулы калькулятора

```
d_min = R_required × λ × 1000  (мм)
Пачек = ⌈Площадь × 1.10 / площадь_пачки⌉  (+10% запас)
Объём = Площадь × d/1000  (м³)
Масса = Объём × плотность  (кг)
R_факт = d/1000 / λ  (м²·К/Вт)
```

### Климатические зоны Узбекистана:
| Зона | R_стена | R_кровля | R_пол |
|------|---------|----------|-------|
| Ташкент / Самарканд | 2.5 | 3.8 | 2.2 |
| Фергана / Андижан | 2.3 | 3.5 | 2.0 |
| Хорезм / ККР | 2.8 | 4.2 | 2.5 |
| Сурхандарья | 2.0 | 3.2 | 1.8 |
| Бухара / Навои | 2.2 | 3.5 | 2.0 |

---

## 🎨 Изменение дизайна

Все цвета и шрифты в `style.css` в секции `:root`:

```css
:root {
  --bg:       #F4F2EE;   /* Фон страницы */
  --orange:   #E85D04;   /* Акцентный цвет (оранжевый) */
  --dark:     #1C1C1A;   /* Тёмный цвет (кнопки, шапка) */
  --border:   #E0DDD6;   /* Цвет рамок */
}
```

Шрифты загружаются с Google Fonts:
- **Bebas Neue** — заголовки
- **DM Sans** — основной текст
- **DM Mono** — цены, коды

---

## 📞 Контакты THERMO PLUS

- **Телефон:** +998 90 150 00 00
- **Email:** info@thermoplus.uz
- **Сайт:** thermoplus.uz
- **Производство:** г.Ургенч, Хорезмская обл., ул.Саноатчилар, 1
- **Офис:** Ташкент, Юнусабадский р-н, ул.Шахрисабз, 2

---

## ❓ Часто задаваемые вопросы

**Q: Почему не загружается логотип?**
A: Убедитесь что файл `images/logo.png` существует. Приложение показывает 🔥 как запасной вариант.

**Q: Как сменить язык по умолчанию?**
A: В `i18n.js` в функции `getCurrentLang()` замените `'uz'` на `'ru'` или `'en'`.

**Q: Где хранится корзина?**
A: В localStorage браузера. Очищается при выходе из Telegram если WebApp закрыт.

**Q: Можно ли добавить 4-й язык?**
A: Да — в `i18n.js` добавьте объект для нового языка, в HTML добавьте кнопку `<button class="lang-btn" data-lang="xx">XX</button>`.

---

*© 2024 THERMO PLUS. Все права защищены.*
