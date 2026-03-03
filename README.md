# THERMO PLUS — Telegram Mini App

**СП ООО "KHOREZM INSULATION GROUP"** | Базальтовая теплоизоляция

---

## 📁 Структура файлов

```
thermoplus/
├── index.html       ← Каталог продукции (главная страница)
├── about.html       ← Главная / О компании
├── calculator.html  ← Умный калькулятор
├── checkout.html    ← Корзина и оформление заказа
├── favorites.html   ← Избранные товары
├── contacts.html    ← Контакты
│
├── style.css        ← Общие стили (все страницы)
├── app.js           ← Общая логика: корзина, избранное, карточки
├── calculator.js    ← Логика калькулятора + формулы
├── checkout.js      ← Логика оформления заказа
├── favorites.js     ← Логика страницы избранного
├── i18n.js          ← Переводы UZ / RU
│
└── products.json    ← База данных всех 23 продуктов
```

---

## 🚀 Установка в Telegram

1. Зайдите в **@BotFather** → `/newbot` → создайте бота
2. `/newapp` → укажите URL вашего сервера с файлами
3. Загрузите все файлы на хостинг (GitHub Pages, Vercel, Netlify и т.д.)
4. Установите `index.html` как точку входа

### GitHub Pages (бесплатно):
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USER/thermoplus-miniapp.git
git push -u origin main
# Затем: Settings → Pages → Source: main branch
```

---

## ⚙️ Настройка Bitrix24

В файле `app.js` замените:
```js
const B24_WEBHOOK = 'https://YOUR_DOMAIN.bitrix24.ru/rest/1/YOUR_CODE';
const B24_MANAGER = 1; // ID ответственного менеджера
```

Вебхук создаётся в Битрикс24: **Разработчикам → Входящие вебхуки**

---

## 🧮 Формулы калькулятора

```
d_min = R_required × λ × 1000  (мм)
    R — требуемое сопротивление теплопередаче (м²·К/Вт)
    λ — теплопроводность продукта (Вт/м·К)

Пачек = ⌈Площадь × 1.10 / площадь_пачки⌉  (+10% запас)
Объём = Площадь × d/1000  (м³)
Масса = Объём × плотность  (кг)
R_факт = d/1000 / λ  (м²·К/Вт)
```

### Климатические зоны Узбекистана:
| Зона | R_стена | R_кровля | R_пол |
|------|---------|----------|-------|
| Ташкент/Самарканд | 2.5 | 3.8 | 2.2 |
| Фергана/Андижан | 2.3 | 3.5 | 2.0 |
| Хорезм/ККР | 2.8 | 4.2 | 2.5 |
| Сурхандарья | 2.0 | 3.2 | 1.8 |
| Бухара/Навои | 2.2 | 3.5 | 2.0 |

---

## 📦 Продукция (23 вида)

| Категория | Продукты |
|-----------|----------|
| Фасад (мокрый) | FACADE, FACADE COMFORT, FACADE PRO, FACADE PREMIUM, FACADE EXTRA |
| Вент. фасад | VENT FACADE, VENT PRO |
| Кровля | ROOF L, ROOF L PROF, ROOF STANDART, ROOF U, ROOF U PROF |
| Пол | FLOOR, FLOOR STANDART, FLOOR PRO |
| Универсал | LITE, ACOUSTIC, UNIVERSAL, STANDART |
| Сэндвич | SANDWICH W, SANDWICH W PROF, SANDWICH R, SANDWICH R PROF |

---

## 🌐 Языки

- 🇺🇿 **Uzbek (UZ)** — основной
- 🇷🇺 **Русский (RU)** — полный перевод

---

## 📞 Контакты THERMO PLUS

- **Телефон:** +998 90 150 00 00
- **Email:** info@thermoplus.uz
- **Сайт:** thermoplus.uz
- **Производство:** г.Ургенч, Хорезмская обл., ул.Саноатчилар, 1
- **Офис:** Ташкент, Юнусабадский р-н, ул.Шахрисабз, 2

---

*© 2024 THERMO PLUS. Все права защищены.*
