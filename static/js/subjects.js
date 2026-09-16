let editingSubjectId = null;
let allTeachers = [];
let allSubjects = [];

document.addEventListener('DOMContentLoaded', async function() {
    await Promise.all([
        loadSubjects(),
        loadTeachers()
    ]);

    // обработка формы
    const form = document.getElementById('subjectForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // отмена редактирования
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEditing);
    }

    // делегирование событий
    document.addEventListener('click', function(e) {
        // кликнули ли по кнопке "Редактировать"
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            editSubject(id);
        }
        // кликнули ли по кнопке "Удалить"
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            deleteSubject(id);
        }
    });
});

async function loadSubjects() {
    try {
        allSubjects = await apiRequest('/api/subjects/');
        displaySubjects(allSubjects);
        return allSubjects;
    } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
        alert('Не удалось загрузить дисциплины.');
        return [];
    }
}

async function loadTeachers() {
    try {
        allTeachers = await apiRequest('/api/teachers/');
        displayTeachersCheckboxes();
        return allTeachers;
    } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
        return [];
    }
}

function displaySubjects(subjects) {
    const container = document.getElementById('subjectsList');
    if (!container) return;
    
    if (subjects.length === 0) {
        container.innerHTML = '<p>Дисциплины не найдены.</p>';
        return;
    }
    
    // создание map для быстрого поиска преподавателя
    const teacherMap = {};
    allTeachers.forEach(t => teacherMap[t.id] = t);
    
    container.innerHTML = subjects.map(subject => {
        // получение списока преподавателей дисциплины
        const subjectTeachers = (subject.teacher_ids || []).map(id => teacherMap[id]).filter(t => t !== undefined);
        
        const teachersHtml = subjectTeachers.length > 0 ? 
        subjectTeachers.map(t => `<span class="teacher-tag" style="background-color: ${t.color}20; border-color: ${t.color}">${t.short_name}</span>`).join('') : 
        '<span class="no-teachers">Нет преподавателей</span>';
        
        return `
            <div class="card subject-card" data-id="${subject.id}">
                <h3>${subject.name}</h3>
                <p><strong>Код:</strong> ${subject.short_name}</p>
                <div class="subject-teachers">
                    <strong>Преподаватели:</strong>
                    <div class="teachers-list">${teachersHtml}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-small edit-btn" data-id="${subject.id}">Редактировать</button>
                    <button class="btn btn-small btn-danger delete-btn" data-id="${subject.id}">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

function displayTeachersCheckboxes() {
    const container = document.getElementById('teachersList');
    if (!container) return;
    
    if (allTeachers.length === 0) {
        container.innerHTML = '<p>Преподаватели не найдены. Сначала добавьте преподавателей.</p>';
        return;
    }
    
    container.innerHTML = allTeachers.map(teacher => `
        <label class="checkbox-label">
            <input type="checkbox" name="teacher" value="${teacher.id}">
            <span class="teacher-color-indicator" style="background-color: ${teacher.color}"></span>
            ${teacher.name} (${teacher.short_name})
        </label>
    `).join('');
}

async function handleFormSubmit(e) {
    // остановление обновление страницы
    e.preventDefault();
    
    // собираем выбранных преподавателей
    const selectedTeachers = [];
    document.querySelectorAll('input[name="teacher"]:checked').forEach(checkbox => {
        selectedTeachers.push(checkbox.value);
    });
    
    // собирание выбранных дисциплин
    const subjectData = {
        name: document.getElementById('subjectName').value,
        short_name: document.getElementById('subjectShortName').value,
        teacher_ids: selectedTeachers
    };
    
    try {
        if (editingSubjectId) {
            // обновление существующей записи
            await apiRequest(`/api/subjects/${editingSubjectId}`, 'PUT', subjectData);
        } else {
            // создание новой записи
            await apiRequest('/api/subjects/', 'POST', subjectData);
        }
        // сброс формы
        resetForm();
        await loadSubjects();
        await loadTeachers();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Не удалось сохранить дисциплину.');
    }
}

async function editSubject(id) {
    try {
        // загрузка данных с сервера
        const subject = await apiRequest(`/api/subjects/${id}`);
        
        // заполнение форм
        document.getElementById('subjectName').value = subject.name;
        document.getElementById('subjectShortName').value = subject.short_name;
        
        // отметка выбранных преподавателей
        document.querySelectorAll('input[name="teacher"]').forEach(checkbox => {
            checkbox.checked = subject.teacher_ids && subject.teacher_ids.includes(checkbox.value);
        });

        // сохранение id для обновления
        editingSubjectId = id;
        document.getElementById('formTitle').textContent = 'Редактировать дисциплину';
        
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Ошибка загрузки дисциплины:', error);
        alert('Не удалось загрузить дисциплину.');
    }
}
async function deleteSubject(id) {
    if (!confirm('Вы уверены, что хотите удалить дисциплину?')) return;
    
    try {
        await apiRequest(`/api/subjects/${id}`, 'DELETE');
        await loadSubjects();
        await loadTeachers();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Не удалось удалить дисциплину.');
    }
}

function cancelEditing() {
    resetForm();
}

function resetForm() {
    editingSubjectId = null;
    document.getElementById('subjectForm').reset();
    document.getElementById('formTitle').textContent = 'Добавить дисциплину';
    document.querySelectorAll('input[name="teacher"]').forEach(cb => cb.checked = false);
}