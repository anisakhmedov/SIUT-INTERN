# Frontend Tasks — SIUT AI

---

## КРИТИЧНО

### F-01 — Feedback данные — убрать моки, подключить API
**Файл:** `src/App.jsx:389-412`

**Проблема:** Два хардкоденных объекта `feedbacks` (John Smith, Emma Johnson) используются везде — в `DashView`, `FeedView`, метриках. Реального API-вызова нет.

**Что сделать:**
1. Убрать константу с моками из `App.jsx`
2. Добавить `useEffect` для загрузки из `GET /feedback`
3. Передавать реальный массив в `DashView` и `FeedView`
4. Добавить empty state в `FeedView` если массив пустой

---

### F-02 — Notification toggles — подключить к API
**Файл:** `src/components/views/SetView.jsx:9`

**Проблема:** `const [n, setN] = useState(...)` — состояние тогглов живёт только в памяти, при перезагрузке сбрасывается. Никакого API-вызова нет.

**Что сделать:**
1. При монтировании загружать настройки: `GET /usersInternship/me/notifications`
2. При клике на тогл — сохранять: `PATCH /usersInternship/me/notifications`
3. Показывать спиннер на тогле во время сохранения
4. Toast при ошибке

---

### F-03 — Добавить 404 страницу
**Файл:** `src/App.jsx` — раздел с `<Routes>`

**Проблема:** При переходе на несуществующий URL (`/blabla`, `/admin/hack`) — ничего не рендерится или крашится.

**Что сделать:**
1. Создать `src/components/NotFoundPage.jsx` — простой экран "404 — Страница не найдена" с кнопкой "На главную"
2. Добавить в Routes: `<Route path="*" element={<NotFoundPage />} />`

---

### F-04 — Protected Routes + redirect после логина
**Файл:** `src/App.jsx`

**Проблема:** Auth держится на `page` state (`"login"`, `"dashboard"`). Если открыть `/admin/statistics` без авторизации — URL остаётся `/admin/statistics`, но после логина редиректа на нужную страницу не происходит.

**Что сделать:**
1. Сохранять `location.pathname` перед редиректом на логин
2. После успешного логина делать `navigate(savedPath || "/")`
3. Опционально: создать `<ProtectedRoute>` компонент обёртку

---

## ВАЖНО

### F-05 — DashView — убрать все хардкоды
**Файл:** `src/components/views/DashView.jsx`

**Три проблемы:**

**5a. BarChart — статичные данные**
```js
// src/components/views/DashView.jsx:21-26
const CHART = [
  { v: 42, l: "Jan" }, { v: 58, l: "Feb" }, ...
];
```
Нужно: считать количество стажировок/отзывов по месяцам из реальных данных и передавать в `<BarChart />`.

**5b. Donut — вызывается без пропсов**
```jsx
// src/components/views/DashView.jsx:134
<Donut />
```
`Donut` должен принимать данные о распределении рейтингов и визуализировать их.

**5c. "↑ 0.3 mo" — хардкоденный тренд**
```jsx
// src/components/views/DashView.jsx:131
<span>↑ 0.3 mo</span>
```
Либо убрать, либо вычислять из разницы среднего рейтинга текущего и прошлого месяца.

---

### F-06 — Смена пароля в Settings
**Файл:** `src/components/views/SetView.jsx`

**Проблема:** В Settings нет формы смены пароля.

**Что сделать:**
1. Добавить секцию "Security" под профилем
2. Поля: "Current Password", "New Password", "Confirm New Password"
3. Валидация: новый != текущий, min 8 символов, confirm совпадает
4. `POST /usersInternship/me/change-password`
5. Toast при успехе/ошибке

---

### F-07 — Dashboard — пагинация для списка стажировок
**Файл:** `src/components/views/DashView.jsx:191`

**Проблема:** `internships.map(...)` — рендерит все стажировки без ограничения. AllInternships и StudentDocumentsPage имеют пагинацию, DashView — нет.

**Что сделать:**
1. Добавить `const [page, setPage] = useState(1)` и `PAGE_SIZE = 12`
2. Срезать массив: `internships.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)`
3. Добавить Prev/Next контролы под карточками

---

### F-08 — Загрузка фото к дням стажировки (UI)
**Файл:** `src/components/InternshipPage.jsx`

**Проблема:** `day.shortReport.images` существует в модели, но в UI нет кнопки для загрузки изображений к дню.

**Что сделать:**
1. Добавить `<input type="file" accept="image/*" hidden />` в карточку дня
2. При выборе файла — отправлять `FormData` на `POST /faculty/{id}/days/{dayId}/images`
3. До ответа от сервера — показывать превью через `URL.createObjectURL(file)`
4. При успехе — обновить `day.shortReport.images` в локальном state

---

### F-09 — Удаление фото студентов (UI)
**Файл:** `src/components/StudentDocumentsPage.jsx`

**Проблема:** Можно загрузить паспорт и медсправку, но нельзя удалить. Нет кнопки удаления.

**Что сделать:**
1. Добавить кнопку с иконкой `Trash2` рядом с каждым загруженным фото
2. `window.confirm()` перед удалением
3. `DELETE /student/{id}/passport-image` или `/medicine-image`
4. После удаления — обновить локальный state

---

### F-10 — Предупреждение при уходе с несохранённой формой
**Файлы:** `src/components/CreatePage.jsx`, `SupervisorEvaluationFormPage.jsx`, `StudentEvaluationFormPage.jsx`

**Проблема:** Если пользователь заполнил форму наполовину и случайно нажал на другой пункт меню — данные теряются молча.

**Что сделать:**
1. Добавить `useEffect` с `window.onbeforeunload = () => "..."` пока форма не пуста
2. Или: отслеживать `isDirty` флаг и показывать кастомный диалог при клике на навигацию

---

### F-11 — Relative timestamps
**Файлы:** `FeedView.jsx`, `DashView.jsx`, `InternshipPage.jsx` (комментарии)

**Проблема:** Даты отображаются как ISO строки или фиксированные "2 days ago". Нет динамического "X минут/часов/дней назад".

**Что сделать:**
1. Добавить утилиту `src/utils/timeAgo.js`:
```js
export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
```
2. Применить к `comment.date`, `feedback.createdAt` и другим датам

---

## ЖЕЛАТЕЛЬНО

### F-12 — Skeleton loaders вместо пустого экрана
**Файлы:** `DashView.jsx`, `AllInternships.jsx`, `StudentDocumentsPage.jsx`

**Проблема:** При загрузке данных — белый/пустой экран. Нет индикации что данные грузятся.

**Что сделать:**
1. Добавить `isLoading` state к каждому компоненту с API-вызовом
2. Пока `isLoading` — рендерить скелетоны (серые блоки с анимацией `pulse`)
3. Можно добавить CSS класс `.skeleton` в `app.css`:
```css
.skeleton { background: linear-gradient(90deg, rgba(0,0,0,.06) 25%, rgba(0,0,0,.1) 50%, rgba(0,0,0,.06) 75%); background-size: 200%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: 200% } 100% { background-position: -200% } }
```

---

### F-13 — Retry при ошибке загрузки
**Файлы:** Все компоненты с `useEffect` + API-вызовом

**Проблема:** Если запрос упал (сеть, 500) — нет кнопки "Повторить". Пользователь видит пустой экран.

**Что сделать:**
1. В `PageState.jsx` добавить опциональный `onRetry` проп
2. При ошибке показывать `<PageState type="error" onRetry={fetchData} />`

---

### F-14 — Рефакторинг InternshipPage.jsx (260KB)
**Файл:** `src/components/InternshipPage.jsx`

**Проблема:** Один файл на 260KB содержит: посещаемость, дневные отчёты, комментарии, AI-генерацию, approval workflow, редактирование метаданных. Сложно поддерживать.

**Предлагаемая структура:**
```
src/components/internship/
├── InternshipPage.jsx         — оркестратор, только state и layout
├── InternshipHeader.jsx       — заголовок, метаданные, кнопки
├── InternshipDays.jsx         — список дней с отчётами
├── InternshipDayCard.jsx      — одна карточка дня
├── InternshipComments.jsx     — тред комментариев
├── InternshipAttendance.jsx   — таблица посещаемости
└── InternshipAIReport.jsx     — секция генерации AI-отчёта
```

---

### F-15 — UserEducationPage — реальный контент
**Файл:** `src/components/UserEducationPage.jsx`

**Проблема:** Страница существует, но неизвестно содержит ли она реальный контент или это статика/заглушка. Нет API для образовательных материалов.

**Что сделать:**
1. Определить формат материалов (статьи, видео, PDF-ссылки)
2. Либо хранить контент в коде как статику (если контент не меняется)
3. Либо создать `GET /education/materials` на бэке и грузить динамически

---

### F-16 — AttendanceMobile.jsx — проверить и подключить
**Файл:** `src/components/AttendanceMobile.jsx`

**Проблема:** Компонент существует (2.42KB), но непонятно используется ли в роутинге или это мёртвый код.

**Что сделать:**
1. Проверить используется ли компонент в `InternshipPage.jsx`
2. Если нет — удалить или подключить как мобильный вид таблицы посещаемости

---

### F-17 — Мобильная адаптация таблиц
**Файлы:** `InternshipPage.jsx` (таблица посещаемости), `AdminStatisticsPage.jsx`

**Проблема:** Широкие таблицы на мобиле уезжают за экран или становятся нечитаемыми.

**Что сделать:**
1. На `<640px` скрывать вторичные колонки таблицы
2. Или переключаться на карточный вид для каждой строки
3. `AttendanceMobile.jsx` возможно уже решает эту задачу — см. F-16

---

## СВОДНАЯ ТАБЛИЦА

| ID | Задача | Приоритет | Файл |
|----|--------|-----------|------|
| F-01 | Убрать моки feedback, подключить API | Критично | `src/App.jsx` |
| F-02 | Notification toggles → API | Критично | `src/components/views/SetView.jsx` |
| F-03 | 404 страница | Критично | `src/App.jsx` + новый компонент |
| F-04 | Protected routes + redirect после логина | Критично | `src/App.jsx` |
| F-05 | DashView — убрать хардкоды (chart, donut, trend) | Важно | `src/components/views/DashView.jsx` |
| F-06 | Смена пароля в Settings | Важно | `src/components/views/SetView.jsx` |
| F-07 | Пагинация на Dashboard | Важно | `src/components/views/DashView.jsx` |
| F-08 | Загрузка фото к дням (UI) | Важно | `src/components/InternshipPage.jsx` |
| F-09 | Удаление фото студентов (UI) | Важно | `src/components/StudentDocumentsPage.jsx` |
| F-10 | Предупреждение при уходе с формы | Важно | `CreatePage`, `EvaluationFormPage` |
| F-11 | Relative timestamps | Важно | `FeedView`, `DashView`, `InternshipPage` |
| F-12 | Skeleton loaders | Желательно | все компоненты с загрузкой |
| F-13 | Retry при ошибке | Желательно | все компоненты с API-вызовом |
| F-14 | Рефакторинг InternshipPage.jsx | Желательно | `src/components/InternshipPage.jsx` |
| F-15 | UserEducationPage — реальный контент | Желательно | `src/components/UserEducationPage.jsx` |
| F-16 | AttendanceMobile.jsx — проверить | Желательно | `src/components/AttendanceMobile.jsx` |
| F-17 | Мобильная адаптация таблиц | Желательно | `InternshipPage`, `AdminStatisticsPage` |
