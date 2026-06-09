# Backend Tasks — SIUT AI

---

## КРИТИЧНО

### B-01 — Feedback API
**Проблема:** Вся лента отзывов (`FeedView`, `DashView`) работает на двух хардкоденных объектах в `src/App.jsx:389-412`. Реального API нет.

**Нужно реализовать:**
- `GET /feedback` — список всех отзывов
- `POST /feedback` — создать отзыв
- `DELETE /feedback/{id}` — удалить отзыв

**Модель данных:**
```json
{
  "_id": "string",
  "authorId": "string",
  "authorName": "string",
  "authorRole": "string",
  "text": "string",
  "rating": 1,
  "createdAt": "ISO date string"
}
```

---

### B-02 — Notification Settings API
**Проблема:** В `src/components/views/SetView.jsx` есть тогглы "Email Notifications", "Push Notifications", "Weekly Report" — они сохраняются только в локальный `useState`, при перезагрузке сбрасываются. Бэкенда нет.

**Нужно реализовать:**
- `GET /usersInternship/me/notifications` — получить настройки уведомлений текущего пользователя
- `PATCH /usersInternship/me/notifications` — сохранить настройки

**Модель данных:**
```json
{
  "email": true,
  "push": false,
  "weekly": true
}
```

---

### B-03 — Смена пароля
**Проблема:** `PATCH /usersInternship/me` принимает только `name` и `email`. Смены пароля нет вообще.

**Нужно реализовать:**
- `POST /usersInternship/me/change-password`

**Тело запроса:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Ответ при неверном текущем пароле:** `400 Bad Request`

---

## ВАЖНО

### B-04 — Серверная пагинация и поиск
**Проблема:** Сейчас фронт загружает весь массив `/faculty` и `/student`, затем фильтрует на клиенте через JS. При росте данных это медленно и нагружает клиент.

**Нужно добавить query-параметры:**
- `GET /faculty?search=query&status=Pending&page=1&limit=20`
- `GET /student?search=query&faculty=name&page=1&limit=20`

**Ответ должен содержать:**
```json
{
  "data": [...],
  "total": 245,
  "page": 1,
  "limit": 20,
  "totalPages": 13
}
```

---

### B-05 — Агрегированная статистика (Admin)
**Проблема:** `AdminStatisticsPage.jsx` (59KB) считает всё на фронте из полного массива `/faculty`. Это неэффективно.

**Нужно реализовать:**
- `GET /admin/statistics`

**Ответ:**
```json
{
  "totalStudents": 0,
  "totalInternships": 0,
  "completionRate": 0.0,
  "avgRating": 0.0,
  "byStatus": {
    "Pending": 0,
    "In Progress": 0,
    "Completed": 0
  },
  "byMonth": [
    { "month": "2025-01", "count": 0 }
  ],
  "byFaculty": [
    { "name": "string", "count": 0 }
  ]
}
```

---

### B-06 — Удаление/редактирование комментариев к дням
**Проблема:** Комментарии к дням стажировки (`day.comments`) можно добавлять, но нельзя удалить или отредактировать.

**Нужно реализовать:**
- `DELETE /faculty/{facultyId}/days/{dayId}/comments/{commentId}`
- `PATCH /faculty/{facultyId}/days/{dayId}/comments/{commentId}` — тело: `{ "text": "string" }`

---

### B-07 — Загрузка изображений к дням стажировки
**Проблема:** В модели дня есть поле `shortReport.images: string[]`, но в UI нет кнопки загрузки и неизвестно реализован ли эндпоинт.

**Нужно реализовать (если ещё нет):**
- `POST /faculty/{facultyId}/days/{dayId}/images` — multipart/form-data, поле `image`
- `DELETE /faculty/{facultyId}/days/{dayId}/images/{imageId}`

---

### B-08 — Удаление фото студентов
**Проблема:** Можно загрузить `passportImage` и `medicineImage`, но нельзя удалить. В `StudentDocumentsPage.jsx` нет кнопки удаления.

**Нужно реализовать:**
- `DELETE /student/{studentId}/passport-image`
- `DELETE /student/{studentId}/medicine-image`

---

### B-09 — Смена роли существующего пользователя
**Проблема:** `CreateTutorPage.jsx` позволяет создать пользователя с ролью, но для изменения роли у существующего юзера нет отдельного эндпоинта или интерфейса.

**Нужно реализовать:**
- `PATCH /usersInternship/{userId}` — уже существует, нужно убедиться что принимает поле `role` и применяет его

---

## ЖЕЛАТЕЛЬНО

### B-10 — Refresh Token механизм
**Проблема:** Когда JWT протухает — пользователя выбрасывает с сессии без предупреждения. `apiClient.js` проверяет expiry, но нет автообновления токена.

**Нужно реализовать:**
- `POST /usersInternship/refresh` — принимает refresh token, возвращает новый access token
- При логине возвращать оба токена: `{ "token": "...", "refreshToken": "...", "user": {...} }`

---

### B-11 — Объединить два бэкенда
**Проблема:** В `vite.config.js` настроен прокси:
```
/internship-evaluations → https://siut-internships-5e35adaf79be.herokuapp.com
```
Оценки стажировок живут на **отдельном** Heroku app. Два разных сервиса без единого API gateway — сложно управлять auth, CORS, rate limiting.

**Рекомендация:** Перенести `/internship-evaluations` на основной бэкенд (`siut-54236c4acf55.herokuapp.com`) или настроить API Gateway перед обоими сервисами.

---

### B-12 — Rate Limiting для AI endpoint
**Проблема:** `POST /ai/final-report` можно вызывать неограниченно. Генерация дорогая (OpenAI).

**Нужно:**
- Rate limit: не более 3 запросов в час на пользователя
- Ответ при превышении: `429 Too Many Requests` с заголовком `Retry-After`

---

### B-13 — JWT в httpOnly Cookie (безопасность)
**Проблема:** JWT хранится в `localStorage`. При XSS-уязвимости токен может быть украден.

**Рекомендация:**
- Перейти на `httpOnly` cookie для хранения JWT
- Убрать токен из тела ответа `/login`, устанавливать через `Set-Cookie`
- Эндпоинт `/usersInternship/logout` должен очищать cookie (`Set-Cookie: token=; Max-Age=0`)

---

### B-14 — Логирование и мониторинг
**Проблема:** Нет информации о том, что логируется на бэкенде. При ошибках сложно дебажить.

**Рекомендация:**
- Структурированные логи (JSON) для всех запросов: `method, path, userId, statusCode, duration`
- Централизованный сбор ошибок (Sentry или аналог)
- Алерт при `5xx` ошибках

---

## СВОДНАЯ ТАБЛИЦА

| ID | Задача | Приоритет | Эндпоинты |
|----|--------|-----------|-----------|
| B-01 | Feedback API | Критично | GET/POST/DELETE /feedback |
| B-02 | Notification Settings | Критично | GET/PATCH /usersInternship/me/notifications |
| B-03 | Смена пароля | Критично | POST /usersInternship/me/change-password |
| B-04 | Серверный поиск и пагинация | Важно | query params на /faculty, /student |
| B-05 | Агрегированная статистика | Важно | GET /admin/statistics |
| B-06 | CRUD комментариев к дням | Важно | DELETE/PATCH /faculty/.../comments/{id} |
| B-07 | Загрузка фото к дням | Важно | POST/DELETE /faculty/.../days/{id}/images |
| B-08 | Удаление фото студентов | Важно | DELETE /student/{id}/passport-image |
| B-09 | Смена роли пользователя | Важно | PATCH /usersInternship/{id} (role field) |
| B-10 | Refresh Token | Желательно | POST /usersInternship/refresh |
| B-11 | Объединить бэкенды | Желательно | архитектурное решение |
| B-12 | Rate Limit для AI | Желательно | middleware на /ai/final-report |
| B-13 | httpOnly Cookie | Желательно | изменить /login response |
| B-14 | Логирование | Желательно | инфраструктура |
