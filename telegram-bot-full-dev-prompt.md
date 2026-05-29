# Полный промпт: разработка Telegram-бота с нуля (интеграция с `GET /status` и `POST /status`)

Ниже — готовый, детализированный промпт для разработчика бота или AI-ассистента, который должен реализовать Telegram-бота "с нуля": от инициализации проекта до деплоя и тестов. Включены пример кода на `node.js` с `telegraf`, способы авторизации, Dockerfile и рекомендации по безопасности и мониторингу.

---

## Цель

Создать Telegram-бота, который:
- показывает текущий глобальный статус сайта (`/site_status`),
- позволяет администраторам переключать статус (`/set_site live:true|false [message]`),
- безопасно хранит и использует админские креды для вызова `POST /status` на бэкенд,
- логирует действия и предоставляет простую систему прав доступа (по списку Telegram ID или по JWT).

## Предпосылки

- Доступ к бэкенду с маршрутом `GET /status` и `POST /status` (наш бек уже реализован).
- Токен Telegram-бота (`BOT_TOKEN`).
- Секрет для вызовов администратора: `ADMIN_JWT` (рекомендуется) или список админских Telegram ID (`ADMINS`).
- Node.js 18+ и npm/yarn.

## Архитектура (кратко)

- Bot (Telegraf) — запускается как отдельный процесс/контейнер и опрашивает backend по HTTP.
- Backend — уже предоставляет `GET /status` и защищённый `POST /status` (требует `Authorization: Bearer <ADMIN_JWT>`).
- Хранение секретов — через переменные окружения или секретный менеджер (Heroku config, Kubernetes Secret, Docker secrets).

---

## Команды бота

- `/site_status` — публичная, возвращает текущий статус (live/message/source).
- `/set_site <true|false> [message]` — админская, вызывает `POST /status` и возвращает результат.
- `/help` — краткая помощь.

---

## Полный план разработки (шаги)

1. Инициализировать проект: `npm init -y`, установить зависимости.
2. Написать базовую структуру бота (подключение Telegraf, обработка команд).
3. Реализовать `/site_status` (HTTP GET -> ответ пользователю).
4. Реализовать `/set_site` с проверкой прав (по Telegram ID или используя `ADMIN_JWT`).
5. Добавить логирование и обработку ошибок.
6. Добавить Dockerfile и docker-compose для локального запуска.
7. Написать тесты (unit для функций HTTP, integration для команд).
8. Настроить деплой (Heroku / Docker registry / Kubernetes).

---

## Пример реализации: `telegraf` + `axios` (node.js)

Файл: `bot/index.js`

```javascript
const { Telegraf } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:7777';
const ADMIN_JWT = process.env.ADMIN_JWT || null; // предпочтительно
const ADMIN_IDS = (process.env.ADMINS || '') .split(',').map(s=>s.trim()).filter(Boolean).map(Number);

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN required');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

async function getStatusText() {
  try {
    const res = await axios.get(`${BACKEND_URL}/status`);
    const { live, message, source } = res.data;
    const status = live ? 'LIVE' : 'DEVELOPMENT';
    return `Статус сайта: ${status} (source=${source})\n${message || ''}`;
  } catch (err) {
    console.error('GET /status failed', err?.response?.data || err.message);
    return 'Ошибка при получении статуса сайта.';
  }
}

bot.start((ctx) => ctx.reply('Привет! Отправь /site_status или /help'));

bot.command('site_status', async (ctx) => {
  const txt = await getStatusText();
  return ctx.reply(txt);
});

function isAdmin(ctx) {
  try {
    const id = ctx.from && ctx.from.id;
    if (!id) return false;
    if (ADMIN_IDS.length && ADMIN_IDS.includes(Number(id))) return true;
    return !!ADMIN_JWT; // если есть ADMIN_JWT считаем, что бот авторизован как сервисный админ
  } catch (e) { return false; }
}

bot.command('set_site', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('Доступ запрещён. Только админы.');

  const args = ctx.message.text.split(' ').slice(1);
  if (!args[0]) return ctx.reply('Использование: /set_site <true|false> [message]');
  const live = String(args[0]).toLowerCase() === 'true';
  const message = args.slice(1).join(' ').trim();

  try {
    const headers = {};
    if (ADMIN_JWT) headers.Authorization = `Bearer ${ADMIN_JWT}`;

    const res = await axios.post(`${BACKEND_URL}/status`, { live, message }, { headers });
    return ctx.reply(`Успех: live=${res.data.live}, message="${res.data.message || ''}"`);
  } catch (err) {
    console.error('POST /status failed', err?.response?.data || err.message);
    const msg = err?.response?.data?.message || err.message || 'Ошибка при установке статуса';
    return ctx.reply(`Ошибка: ${msg}`);
  }
});

bot.command('help', (ctx) => ctx.reply('/site_status — показать статус\n/set_site <true|false> [message] — сменить статус (админы)'));

bot.launch().then(()=>console.log('Bot started'));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```

### Пояснения
- `ADMIN_JWT` даёт возможность бот-сервису вызывать защищённый `POST /status`. Его следует хранить в секретах окружения.
- Если вы хотите ограничивать доступ по Telegram ID — заполните `ADMINS` в env: `ADMINS=12345678,87654321`.

---

## Генерация тестового `ADMIN_JWT` (локально)

Если на бэкенде есть endpoint для выдачи сервисного токена — используйте его. Для тестов можно сгенерировать JWT локально (совпадающий по секрету с бэком):

```javascript
// scripts/create-admin-jwt.js
const jwt = require('jsonwebtoken');
const token = jwt.sign({ roles: ['Admin'] }, process.env.BACKEND_JWT_SECRET || 'dev-secret', { expiresIn: '30d' });
console.log(token);
```

Запуск: `BACKEND_JWT_SECRET=dev-secret node scripts/create-admin-jwt.js` — и подставить в `ADMIN_JWT`.

---

## Dockerfile (бот)

```dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
COPY . .
ENV NODE_ENV=production
CMD ["node", "index.js"]
```

`docker-compose.yml` (локально):

```yaml
version: '3.8'
services:
  bot:
    build: ./bot
    environment:
      - BOT_TOKEN=${BOT_TOKEN}
      - BACKEND_URL=${BACKEND_URL}
      - ADMIN_JWT=${ADMIN_JWT}
      - ADMINS=${ADMINS}
```

---

## Тесты и локальная проверка

- Unit: мокать `axios` вызовы и проверять, что функции парсинга/форматирования корректны.
- Integration: поднять локально бэкенд и бот (docker-compose) и выполнить команды в реальном чате (или через тестовую группу).

## Деплой и секреты

- Размещать `BOT_TOKEN` и `ADMIN_JWT` в секретах окружения (Heroku config vars / Kubernetes secrets / GitHub Actions secrets).
- Для webhook-подключений на проде настроить HTTPS и публичный URL, либо использовать polling (менее предпочтительно при высокой нагрузке).

## Мониторинг, логирование и безопасность

- Логи команд и ошибок отправлять в централизованный лог (Sentry, LogDNA) — как минимум логировать ошибки `POST /status`.
- Ограничьте частоту вызовов `/set_site` (rate limiting) если нужно.

---

## Контрольный список (быстро)

- [ ] Инициализировать проект и установить `telegraf`, `axios`.
- [ ] Реализовать команды `/site_status` и `/set_site`.
- [ ] Настроить хранение секретов (`BOT_TOKEN`, `ADMIN_JWT`, `ADMINS`).
- [ ] Написать Dockerfile и docker-compose.
- [ ] Протестировать локально и в staging.
- [ ] Настроить мониторинг и деплой.

---

Если хочешь — могу дополнительно:
- сгенерировать готовый `package.json` и списки зависимостей; 
- добавить готовые unit-тесты (jest) и GitHub Actions workflow; 
- сделать пример для `node-telegram-bot-api` вместо `telegraf`.
