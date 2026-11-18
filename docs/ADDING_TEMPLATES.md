# Руководство: Добавление нового шаблона бейджика

В Badge Studio реализована **100% изолированная архитектура шаблонов (Multi-Template Isolation)**. 
Стили каждого шаблона полностью изолированы через префикс класса пространства имён (namespace scope), поэтому добавление новых шаблонов карточек **никогда не сломает и не изменит** существующие шаблоны (студентов, охраны и т.д.).

---

## Архитектура изоляции стилей

Все стили карточек разделены на независимые модули:
```
src/
  styles/
    badge-base.css                  <-- Базовые размеры, шрифты, артборд A4, общие утилиты
    badge.css                       <-- Главная точка подключения (@import шаблонов)
    templates/
      template-student.css          <-- Изолированные стили студентов (.template-student)
      template-security.css         <-- Изолированные стили охраны (.template-security)
      template-newname.css          <-- Ваш новый шаблон (.template-newname)
```

---

## Пошаговая инструкция: как добавить новый шаблон за 5 шагов

### Шаг 1. Зарегистрируйте ID нового шаблона
В файле `src/types/badge.ts` добавьте новый идентификатор в тип `BadgeTemplateId`:
```typescript
export type BadgeTemplateId = "student" | "security" | "teacher"; // например, "teacher" (Учитель / Преподаватель)
```

### Шаг 2. Создайте изолированный CSS-файл шаблона
Создайте файл `src/styles/templates/template-teacher.css`.
Все правила пишите с префиксом `.template-teacher`:

```css
/* ========================================================= */
/* TEACHER BADGE TEMPLATE (ШАБЛОНИ ОМӮЗГОР)                   */
/* 100% ISOLATED SCOPE: .template-teacher                    */
/* ========================================================= */

.template-teacher.badge-front {
  background-color: #ffffff;
  /* Ваши фоны, градиенты */
}

.template-teacher .teacher-header {
  /* Стили шапки учителя */
}

.template-teacher.badge-back {
  /* Стили оборотной стороны */
}
```

Подключите файл в `src/styles/badge.css`:
```css
@import "./badge-base.css";
@import "./templates/template-student.css";
@import "./templates/template-security.css";
@import "./templates/template-teacher.css"; /* <-- Новый шаблон */
```

### Шаг 3. Создайте React-компоненты карточки
Создайте:
- `src/components/BadgeCard/BadgeTeacherFront.tsx`
- `src/components/BadgeCard/BadgeTeacherBack.tsx`

В корневом `div` обязательно укажите класс вашего шаблона:
```tsx
export function BadgeTeacherFront({ student, update }: Props) {
  return (
    <div className="badge-artwork badge-front template-teacher">
      {/* Содержимое лицевой стороны */}
    </div>
  );
}
```

### Шаг 4. Добавьте маршрутизацию в BadgeArtwork
В файле `src/components/BadgeCard/BadgeArtwork.tsx`:
```tsx
if (student.template === "teacher") {
  return side === "back" 
    ? <BadgeTeacherBack student={student} update={update} />
    : <BadgeTeacherFront student={student} update={update} onUploadPhoto={onUploadPhoto} />;
}
```

### Шаг 5. Добавьте кнопку выбора и поля в Инспектор
В `src/components/Inspector/Inspector.tsx`:
1. Добавьте кнопку переключения в панели шаблонов:
```tsx
<button
  type="button"
  className={`template-toggle-btn ${selected.template === "teacher" ? "active" : ""}`}
  onClick={() => onUpdateSelected("template", "teacher")}
>
  <Icon name="user" size={13} />
  <span>Омӯзгор</span>
</button>
```
2. Отобразите необходимые поля ввода (кафедра, ученая степень, должность и т.д.).

---

## Преимущества изолированной архитектуры:
- **0 конфликтов селекторов**: ни один стиль шаблона студента или охраны не пересекается с новым шаблоном.
- **Поддержка смешанной печати на одном листе A4**: на одном листе могут одновременно находиться 3 студента, 2 охранника и 3 преподавателя, и каждый бейдж отрендерится в собственном стиле.
- **Безопасные обновления**: изменение дизайна одного шаблона гарантированно не затронет остальные.
