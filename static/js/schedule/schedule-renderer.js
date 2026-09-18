// отображение занятия в таблице
function renderSchedule() {
    // очищение всех ячеек
    document.querySelectorAll('.lesson-cell').forEach(cell => {
        cell.innerHTML = '';
    });
    
    const teacherMap = {};
    allTeachers.forEach(t => teacherMap[t.id] = t);
    
    const subjectMap = {};
    allSubjects.forEach(s => subjectMap[s.id] = s);
    
    // размещение занятия
    allLessons.forEach(lesson => {
        const teacher = teacherMap[lesson.teacher_id];
        const subject = subjectMap[lesson.subject_id];
        
        if (!teacher || !subject) return;
        
        // если занятие есть на 1-й неделе, добавляем карточку в ячейку
        if (lesson.week1_lesson > 0) {
            const cell1 = document.querySelector(
                `.lesson-cell[data-group="${lesson.group_id}"][data-day="${lesson.day}"][data-pair="${lesson.week1_lesson}"]`
            );
            if (cell1) {
                cell1.appendChild(createLessonCard(lesson, teacher, subject, 1));
            }
        }
        
        // если занятие есть на 2-й неделе, добавляем карточку в ячейку
        if (lesson.week2_lesson > 0) {
            const cell2 = document.querySelector(
                `.lesson-cell[data-group="${lesson.group_id}"][data-day="${lesson.day}"][data-pair="${lesson.week2_lesson}"]`
            );
            if (cell2) {
                cell2.appendChild(createLessonCard(lesson, teacher, subject, 2));
            }
        }
    });
}

function createLessonCard(lesson, teacher, subject, week) {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    card.style.borderLeft = `5px solid ${teacher.color}`;
    
    const cardColor = subject.color || teacher.color;
    card.style.borderLeft = `5px solid ${cardColor}`;
    
    card.dataset.lessonId = lesson.id;
    card.dataset.week = week;
    
    const week1Text = lesson.week1_lesson > 0 ? `${lesson.week1_lesson} пара` : '—';
    const week2Text = lesson.week2_lesson > 0 ? `${lesson.week2_lesson} пара` : '—';
    const typeText = lesson.lesson_type;
    const weekLabel = week === 1 ? '1-я нед.' : '2-я нед.';
    
    card.innerHTML = `
        <div class="card-header">
            <span class="teacher-short" style="background-color: ${teacher.color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 12px;">${teacher.short_name}</span>
            <span class="lesson-type">${typeText}</span>
            <span class="week-indicator">${weekLabel}</span>
        </div>
        <div class="card-subject" style="font-weight: bold; color: #2c3e50; margin-bottom: 4px; font-size: 13px;">${subject.short_name}</div>
        <div class="card-weeks" style="display: flex; gap: 10px; margin-bottom: 4px; font-size: 11px; background: #f8f9fa; padding: 4px; border-radius: 4px;">
            <div class="week-info"><span class="week-label">1н:</span><span class="week-value" style="font-weight: bold; color: ${lesson.week1_lesson > 0 ? '#2c3e50' : '#95a5a6'}">${week1Text}</span></div>
            <div class="week-info"><span class="week-label">2н:</span><span class="week-value" style="font-weight: bold; color: ${lesson.week2_lesson > 0 ? '#2c3e50' : '#95a5a6'}">${week2Text}</span></div>
        </div>
        ${lesson.classroom_id ? `<div class="card-classroom" style="font-size: 11px; color: #3498db; font-weight: bold;">Каб. ${lesson.classroom_id}</div>` : ''}
    `;
    
    // обработчики событий
    card.addEventListener('click', () => openModal(lesson));
    
    return card;
}