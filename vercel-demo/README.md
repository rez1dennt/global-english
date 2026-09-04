# Vercel client demo

Статическая клиентская демонстрация WordPress-темы Global English.

## Обновление HTML-снимков

Запустите локальный PHP preview и выполните:

```powershell
$env:GE_PREVIEW_URL='http://127.0.0.1:8767/global-english/tests/preview.php'
npm run export:vercel
npm run build
```

## Импорт в Vercel

1. Импортируйте `rez1dennt/global-english` через **Add New → Project**.
2. Оставьте **Root Directory** в корне репозитория.
3. Выберите **Framework Preset: Other**.
4. Не переопределяйте Build Command и Output Directory: они заданы в `vercel.json`.
5. Убедитесь, что **Production Branch** — `main`.
6. Нажмите **Deploy**.

Ожидаемые маршруты: `/`, `/privacy-policy/`, `/data-consent/`.

Демонстрация закрыта от индексации. Формы проверяют данные, но не отправляют их наружу; после валидного заполнения показывается подтверждённый телефон школы.
