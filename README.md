# Global English

WordPress-тема лендинга школы иностранных языков Global English.

## Установка

Загрузите `global-english.zip` в WordPress: «Внешний вид» → «Темы» → «Добавить тему» → «Загрузить тему».

## Проверка

```powershell
$tests = (Get-ChildItem -LiteralPath global-english/tests -Filter '*.test.mjs').FullName
node --test $tests
php global-english/tests/php-static-check.php
```

Для полноценной работы темы нужен хостинг с WordPress и PHP. Vercel не запускает WordPress-тему как самостоятельный сайт без отдельного статического фронтенда или внешнего WordPress-бэкенда.
