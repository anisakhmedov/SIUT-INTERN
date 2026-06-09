# Backend Tasks — SIUT AI

---

## КРИТИЧНО

### B-01 — Notification Settings API
**Проблема:** В `src/components/views/SetView.jsx` есть тогглы "Email Notifications" и "Push Notifications" — они сохраняются только в локальный `useState`, при перезагрузке сбрасываются. Бэкенда нет.

**Нужно реализовать:**
- `GET /usersInternship/me/notifications` — получить настройки уведомлений текущего пользователя
- `PATCH /usersInternship/me/notifications` — сохранить настройки

**Модель данных:**
```json
{
  "email": true,
  "push": false
}
```

---

### B-02 — Смена пароля
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

### B-03 — Серверная пагинация и поиск
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

### B-04 — Агрегированная статистика (Admin)
**Проблема:** `AdminStatisticsPage.jsx` считает всё на фронте из полного массива `/faculty`. При росте данных это медленно.

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

### B-05 — Удаление/редактирование комментариев к дням
**Проблема:** Комментарии к дням стажировки (`day.comments`) можно добавлять, но нельзя удалить или отредактировать.

**Нужно реализовать:**
- `DELETE /faculty/{facultyId}/days/{dayId}/comments/{commentId}`
- `PATCH /faculty/{facultyId}/days/{dayId}/comments/{commentId}` — тело: `{ "text": "string" }`

---

### B-06 — Смена роли существующего пользователя
**Проблема:** `CreateTutorPage.jsx` позволяет создать пользователя с ролью, но для изменения роли у существующего юзера нет интерфейса.

**Нужно убедиться:**
- `PATCH /usersInternship/{userId}` принимает поле `role` и применяет его

---

## ЖЕЛАТЕЛЬНО

### B-07 — Refresh Token механизм
**Проблема:** Когда JWT протухает — пользователя выбрасывает с сессии без предупреждения. `apiClient.js` проверяет expiry, но нет автообновления токена.

**Нужно реализовать:**
- `POST /usersInternship/refresh` — принимает refresh token, возвращает новый access token
- При логине возвращать оба токена: `{ "token": "...", "refreshToken": "...", "user": {...} }`

---

### B-08 — JWT в httpOnly Cookie (безопасность)
**Проблема:** JWT хранится в `localStorage`. При XSS-уязвимости токен может быть украден.

**Рекомендация:**
- Перейти на `httpOnly` cookie для хранения JWT
- Убрать токен из тела ответа `/login`, устанавливать через `Set-Cookie`
- Эндпоинт `/usersInternship/logout` должен очищать cookie (`Set-Cookie: token=; Max-Age=0`)

---

### B-09 — Логирование и мониторинг
**Проблема:** Нет информации о том, что логируется на бэкенде. При ошибках сложно дебажить.

**Рекомендация:**
- Структурированные логи (JSON) для всех запросов: `method, path, userId, statusCode, duration`
- Централизованный сбор ошибок (Sentry или аналог)
- Алерт при `5xx` ошибках

---

## СВОДНАЯ ТАБЛИЦА

| ID | Задача | Приоритет | Эндпоинты |
|----|--------|-----------|-----------|
| B-01 | Notification Settings | Критично | GET/PATCH /usersInternship/me/notifications |
| B-02 | Смена пароля | Критично | POST /usersInternship/me/change-password |
| B-03 | Серверный поиск и пагинация | Важно | query params на /faculty, /student |
| B-04 | Агрегированная статистика | Важно | GET /admin/statistics |
| B-05 | CRUD комментариев к дням | Важно | DELETE/PATCH /faculty/.../comments/{id} |
| B-06 | Смена роли пользователя | Важно | PATCH /usersInternship/{id} (role field) |
| B-07 | Refresh Token | Желательно | POST /usersInternship/refresh |
| B-08 | httpOnly Cookie | Желательно | изменить /login response |
| B-09 | Логирование | Желательно | инфраструктура |
