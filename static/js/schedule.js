let allLessons = [];
let allTeachers = [];
let allSubjects = [];
let allGroups = [];
let editingLessonId = null;

const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const lessonTypes = {
    'Лекция': 'Лек',
    'Практика': 'Пр',
    'Лабораторная': 'Лаб'
};

document.addEventListener('DOMContentLoaded', async function() {
    // загрузка всех данных
    await Promise.all([
        loadLessons(),
        loadTeachers(),
        loadSubjects(),
        loadGroups()
    ]);
    
    // создание таблицы и отображение данных
    buildScheduleTable();
    renderSchedule();
    renderTeachersPanel();
    populateGroupSelect();
    
    // обработчики модального окна
    document.getElementById('addLessonBtn').addEventListener('click', () => openModal());
    document.getElementById('closeModal').addEventListener('click', closeModalHandler);
    document.getElementById('cancelBtn').addEventListener('click', closeModalHandler);
    document.getElementById('deleteBtn').addEventListener('click', deleteLesson);
    
    // обработка формы
    document.getElementById('lessonForm').addEventListener('submit', handleFormSubmit);
    
    // зависимость дисциплин от преподавателя
    document.getElementById('lessonTeacher').addEventListener('change', updateSubjectsSelect);
});

async function loadLessons() {
    try {
        allLessons = await apiRequest('/api/lessons/');
    } catch (error) {
        console.error('Ошибка загрузки занятий:', error);
        allLessons = [];
    }
}

async function loadTeachers() {
    try {
        allTeachers = await apiRequest('/api/teachers/');
    } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
        allTeachers = [];
    }
}

async function loadSubjects() {
    try {
        allSubjects = await apiRequest('/api/subjects/');
    } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
        allSubjects = [];
    }
}

async function loadGroups() {
    try {
        allGroups = await apiRequest('/api/groups/');
    } catch (error) {
        console.error('Ошибка загрузки групп:', error);
        allGroups = [];
    }
}

// создание таблицы расписания
function buildScheduleTable() {
    const table = document.getElementById('scheduleTable');
    if (!table) return;
    
    let html = '<thead><tr><th class="time-header">Группа / Пара</th>';
    allGroups.forEach(group => {
        html += `<th class="group-header">
            <div class="group-name">${group.name}</div>
            <div class="group-info">${group.speciality}, ${group.course} курс</div>
        </th>`;
    });
    html += '</tr></thead><tbody>';
    
    days.forEach((day, dayIndex) => {
        // строка с названием дня
        html += `<tr class="day-header-row">
            <td colspan="${allGroups.length + 1}" class="day-name">${day}</td>
        </tr>`;
        
        // строки с парами
        for (let pair = 1; pair <= 6; pair++) {
            html += `<tr class="lesson-row">
                <td class="pair-number">${pair} пара</td>`;
            allGroups.forEach(group => {
                html += `<td class="lesson-cell" data-group="${group.id}" data-day="${dayIndex}" data-pair="${pair}"></td>`;
            });
            html += '</tr>';
        }
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}

// заполнение групп в форме
function populateGroupSelect() {
    const select = document.getElementById('lessonGroup');
    select.innerHTML = '<option value="">Выберите группу</option>' +
        allGroups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
}

// отображенеие занятия в таблице
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
    card.dataset.lessonId = lesson.id;
    
    const week1Text = lesson.week1_lesson > 0 ? `${lesson.week1_lesson} пара` : '—';
    const week2Text = lesson.week2_lesson > 0 ? `${lesson.week2_lesson} пара` : '—';
    const typeShort = lessonTypes[lesson.lesson_type] || lesson.lesson_type;

    const weekLabel = week === 1 ? '1-я нед.' : '2-я нед.';
    
    card.innerHTML = `
        <div class="card-header">
            <span class="teacher-short" style="background-color: ${teacher.color}; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold; font-size: 12px;">${teacher.short_name}</span>
            <span class="lesson-type">${typeShort}</span>
            <span class="week-indicator">${weekLabel}</span>
        </div>
        <div class="card-subject" style="font-weight: bold; color: #2c3e50; margin-bottom: 4px; font-size: 13px;">${subject.short_name}</div>
        <div class="card-teacher" style="font-size: 12px; color: #7f8c8d; margin-bottom: 6px;">${teacher.name}</div>
        <div class="card-weeks" style="display: flex; gap: 10px; margin-bottom: 4px; font-size: 11px; background: #f8f9fa; padding: 4px; border-radius: 4px;">
            <div class="week-info">
                <span class="week-label">1н:</span>
                <span class="week-value" style="font-weight: bold; color: ${lesson.week1_lesson > 0 ? '#2c3e50' : '#95a5a6'}">${week1Text}</span>
            </div>
            <div class="week-info">
                <span class="week-label">2н:</span>
                <span class="week-value" style="font-weight: bold; color: ${lesson.week2_lesson > 0 ? '#2c3e50' : '#95a5a6'}">${week2Text}</span>
            </div>
        </div>
        ${lesson.classroom_id ? `<div class="card-classroom" style="font-size: 11px; color: #3498db; font-weight: bold;">Каб. ${lesson.classroom_id}</div>` : ''}
    `;
    
    card.addEventListener('click', () => openModal(lesson));
    
    return card;
}

// панель преподавателей
function renderTeachersPanel() {
    const container = document.getElementById('teachersPanel');
    if (!container) return;
    
    if (allTeachers.length === 0) {
        container.innerHTML = '<p>Преподаватели не найдены</p>';
        return;
    }
    
    const subjectMap = {};
    allSubjects.forEach(s => subjectMap[s.id] = s);
    
    const groupMap = {};
    allGroups.forEach(g => groupMap[g.id] = g);
    
    container.innerHTML = allTeachers.map(teacher => {
        // дисциплины преподавателя
        const teacherSubjects = (teacher.subject_ids || [])
            .map(id => subjectMap[id])
            .filter(s => s !== undefined);
        
        const subjectsHtml = teacherSubjects.length > 0
            ? teacherSubjects.map(s => `
                <div class="panel-subject" data-teacher="${teacher.id}" data-subject="${s.id}">
                    ${s.name}
                </div>
            `).join('')
            : '<div class="no-subjects">Нет дисциплин</div>';
        
        // занятия преподавателя
        const teacherLessons = allLessons.filter(l => l.teacher_id === teacher.id);
        
        const lessonsHtml = teacherLessons.length > 0
            ? teacherLessons.map(l => {
                const subj = subjectMap[l.subject_id];
                const grp = groupMap[l.group_id];
                const dayName = days[l.day] || 'Неизвестно';
                const weekText = [];
                if (l.week1_lesson > 0) weekText.push(`1н: ${l.week1_lesson}п`);
                if (l.week2_lesson > 0) weekText.push(`2н: ${l.week2_lesson}п`);
                
                return `
                    <div class="panel-lesson" data-lesson-id="${l.id}" style="border-left: 3px solid ${teacher.color}; padding-left: 8px; margin: 5px 0; cursor: pointer;">
                        <div class="panel-lesson-subj">${subj ? subj.short_name : '—'}</div>
                        <div class="panel-lesson-info">${grp ? grp.name : '—'} · ${dayName} · ${weekText.join(', ')}</div>
                    </div>
                `;
            }).join('')
            : '<div class="no-lessons">Нет занятий</div>';
        
        return `
            <div class="panel-teacher" data-teacher-id="${teacher.id}">
                <div class="panel-teacher-header">
                    <span class="teacher-color-dot" style="background-color: ${teacher.color}"></span>
                    <span class="teacher-name">${teacher.name}</span>
                </div>
                <div class="panel-subjects">
                    ${subjectsHtml}
                </div>
                <div class="panel-lessons-section">
                    <strong>Занятия:</strong>
                    <div class="panel-lessons-list">
                        ${lessonsHtml}
                    </div>
                </div>
                <button class="btn btn-small btn-add-lesson" data-teacher="${teacher.id}">+ Добавить занятие</button>
            </div>
        `;
    }).join('');
    
    // обработчики
    document.querySelectorAll('.btn-add-lesson').forEach(btn => {
        btn.addEventListener('click', function() {
            openModal(null, this.dataset.teacher);
        });
    });
    
    document.querySelectorAll('.panel-subject').forEach(subj => {
        subj.addEventListener('click', function() {
            openModal(null, this.dataset.teacher, this.dataset.subject);
        });
    });
    
    document.querySelectorAll('.panel-lesson').forEach(lessonEl => {
        lessonEl.addEventListener('click', function() {
            const lessonId = this.dataset.lessonId;
            const lesson = allLessons.find(l => l.id === lessonId);
            if (lesson) openModal(lesson);
        });
    });
}

function openModal(lesson = null, preselectedTeacher = null, preselectedSubject = null) {
    const modal = document.getElementById('lessonModal');
    const modalTitle = document.getElementById('modalTitle');
    const deleteBtn = document.getElementById('deleteBtn');
    
    // заполнение список преподавателей
    const teacherSelect = document.getElementById('lessonTeacher');
    teacherSelect.innerHTML = '<option value="">Выберите преподавателя</option>' +
        allTeachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    
    if (lesson) {
        modalTitle.textContent = 'Редактировать занятие';
        deleteBtn.style.display = 'inline-block';
        
        document.getElementById('lessonId').value = lesson.id;
        document.getElementById('lessonGroup').value = lesson.group_id;
        document.getElementById('lessonDay').value = String(lesson.day);
        document.getElementById('lessonTeacher').value = lesson.teacher_id;
        document.getElementById('lessonWeek1').value = String(lesson.week1_lesson || 0);
        document.getElementById('lessonWeek2').value = String(lesson.week2_lesson || 0);
        document.getElementById('lessonClassroom').value = lesson.classroom_id || '';
        document.getElementById('lessonType').value = lesson.lesson_type || 'Лекция';
        
        updateSubjectsSelect().then(() => {
            document.getElementById('lessonSubject').value = lesson.subject_id;
        });
        
        editingLessonId = lesson.id;
    } else {
        modalTitle.textContent = 'Добавить занятие';
        deleteBtn.style.display = 'none';
        
        document.getElementById('lessonForm').reset();
        document.getElementById('lessonId').value = '';
        document.getElementById('lessonSubject').innerHTML = '<option value="">Сначала выберите преподавателя</option>';
        
        editingLessonId = null;
        
        if (preselectedTeacher) {
            teacherSelect.value = preselectedTeacher;
            updateSubjectsSelect().then(() => {
                if (preselectedSubject) {
                    document.getElementById('lessonSubject').value = preselectedSubject;
                }
            });
        }
    }
    
    modal.classList.add('active');
}

function closeModalHandler() {
    document.getElementById('lessonModal').classList.remove('active');
    editingLessonId = null;
}

async function updateSubjectsSelect() {
    const teacherId = document.getElementById('lessonTeacher').value;
    const subjectSelect = document.getElementById('lessonSubject');
    
    if (!teacherId) {
        subjectSelect.innerHTML = '<option value="">Сначала выберите преподавателя</option>';
        return;
    }
    
    const teacher = allTeachers.find(t => t.id === teacherId);
    if (!teacher) {
        subjectSelect.innerHTML = '<option value="">Преподаватель не найден</option>';
        return;
    }
    
    const teacherSubjects = (teacher.subject_ids || [])
        .map(id => allSubjects.find(s => s.id === id))
        .filter(s => s !== undefined);
    
    subjectSelect.innerHTML = '<option value="">Выберите дисциплину</option>' +
        teacherSubjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const lessonData = {
        group_id: document.getElementById('lessonGroup').value,
        day: parseInt(document.getElementById('lessonDay').value),
        teacher_id: document.getElementById('lessonTeacher').value,
        subject_id: document.getElementById('lessonSubject').value,
        week1_lesson: parseInt(document.getElementById('lessonWeek1').value),
        week2_lesson: parseInt(document.getElementById('lessonWeek2').value),
        classroom_id: document.getElementById('lessonClassroom').value,
        lesson_type: document.getElementById('lessonType').value
    };
    
    try {
        if (editingLessonId) {
            await apiRequest(`/api/lessons/${editingLessonId}`, 'PUT', lessonData);
        } else {
            await apiRequest('/api/lessons/', 'POST', lessonData);
        }
        
        closeModalHandler();
        await loadLessons();
        renderSchedule();
        renderTeachersPanel();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        if (error.message && error.message.includes('Конфликт')) {
            try {
                const errorData = JSON.parse(error.message);
                if (errorData.conflicts) {
                    showConflicts(errorData.conflicts);
                    return;
                }
            } catch (e) {}
        }
        alert('Не удалось сохранить занятие: ' + error.message);
    }
}


async function deleteLesson() {
    if (!editingLessonId) return;
    if (!confirm('Вы уверены, что хотите удалить это занятие?')) return;
    
    try {
        await apiRequest(`/api/lessons/${editingLessonId}`, 'DELETE');
        closeModalHandler();
        await loadLessons();
        renderSchedule();
        renderTeachersPanel();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Не удалось удалить занятие.');
    }
}