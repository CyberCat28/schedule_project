let editingTeacherId = null;
let allSubjects = [];
let allTeachers = [];

document.addEventListener('DOMContentLoaded', async function() {
    await Promise.all([
        loadTeachers(),
        loadSubjects()
    ]);

    displayTeachers(await apiRequest('/api/teachers/'));
    displaySubjectsCheckboxes();
    
    // обработка формы
    const form = document.getElementById('teacherForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // отмена редактирования
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEditing);
    }

    document.addEventListener('click', function(e) {
        // кликнули ли по кнопке "Редактировать"
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            editTeacher(id);
        }
        // кликнули ли по кнопке "Удалить"
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            deleteTeacher(id);
        }
    });
});

async function loadTeachers() {
    try {
        allTeachers = await apiRequest('/api/teachers/');
        displayTeachers(allTeachers);
        return allTeachers;
    } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
        alert('Не удалось загрузить преподавателей.');
        return [];
    }
}

async function loadSubjects() {
    try {
        allSubjects = await apiRequest('/api/subjects/');
        displaySubjectsCheckboxes();
        return allSubjects;
    } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
        return [];
    }
}

function displayTeachers(teachers) {
    const container = document.getElementById('teachersList');
    if (!container) return;
    
    if (teachers.length === 0) {
        container.innerHTML = '<p>Преподаватели не найдены.</p>';
        return;
    }

    // map для быстрого поиска дисциплин
    const subjectMap = {};
    allSubjects.forEach(s => subjectMap[s.id] = s);
    
    container.innerHTML = teachers.map(teacher => {
        // получение список дисциплин преподавателя
        const teacherSubjects = (teacher.subject_ids || []).map(id => subjectMap[id]).filter(s => s !== undefined);
        const subjectsHtml = teacherSubjects.length > 0 ? teacherSubjects.map(s => `<span class="subject-tag">${s.short_name}</span>`).join(''): 
        '<span class="no-subjects">Нет дисциплин</span>';
        const contactHtml = teacher.contact ? `<p class="contact-info">Контакты: ${teacher.contact}</p>` : '';
    return `
            <div class="card teacher-card" data-id="${teacher.id}" style="border-left: 5px solid ${teacher.color}">
                <h3>${teacher.name}</h3>
                <p><strong>Краткое обозначение:</strong> ${teacher.short_name}</p>
                ${contactHtml}
                <div class="color-indicator" style="background-color: ${teacher.color}"></div>
                <div class="teacher-subjects">
                    <strong>Дисциплины:</strong>
                    <div class="subjects-list">${subjectsHtml}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-small edit-btn" data-id="${teacher.id}">Редактировать</button>
                    <button class="btn btn-small btn-danger delete-btn" data-id="${teacher.id}">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

function displaySubjectsCheckboxes() {
    const container = document.getElementById('subjectsList');
    if (!container) return;
    
    if (allSubjects.length === 0) {
        container.innerHTML = '<p>Дисциплины не найдены. Сначала добавьте дисциплины.</p>';
        return;
    }
    
    container.innerHTML = allSubjects.map(subject => `
        <label class="checkbox-label">
            <input type="checkbox" name="subject" value="${subject.id}">
            ${subject.name} (${subject.short_name})
        </label>
    `).join('');
}

async function handleFormSubmit(e) {
    // остановление обновление страницы
    e.preventDefault();
    
    // собирание выбранных дисциплин
    const selectedSubjects = [];
    document.querySelectorAll('input[name="subject"]:checked').forEach(checkbox => {
        selectedSubjects.push(checkbox.value);
    });
    
    const teacherData = {
        name: document.getElementById('teacherName').value,
        short_name: document.getElementById('teacherShortName').value,
        contact: document.getElementById('teacherContact').value,
        color: document.getElementById('teacherColor').value,
        subject_ids: selectedSubjects
    };
    
    try {
        if (editingTeacherId) {
            // обновление существующей записи
            await apiRequest(`/api/teachers/${editingTeacherId}`, 'PUT', teacherData);
        } else {
            // создание новой записи
            await apiRequest('/api/teachers/', 'POST', teacherData);
        }
        // сброс формы
        resetForm();
        await loadTeachers();
        await loadSubjects();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Не удалось сохранить преподавателя.');
    }
}

async function editTeacher(id) {
    try {
        // загрузка данных с сервера
        const teacher = await apiRequest(`/api/teachers/${id}`);
        
        // заполнение форм
        document.getElementById('teacherName').value = teacher.name;
        document.getElementById('teacherShortName').value = teacher.short_name;
        document.getElementById('teacherContact').value = teacher.contact || '';
        document.getElementById('teacherColor').value = teacher.color;
        
        // отметка выбранных дисциплин
        document.querySelectorAll('input[name="subject"]').forEach(checkbox => {
            checkbox.checked = teacher.subject_ids && teacher.subject_ids.includes(checkbox.value);
        });
        
        // сохранение id для обновления
        editingTeacherId = id;
        document.getElementById('formTitle').textContent = 'Редактировать преподавателя';
        
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Ошибка загрузки преподавателя:', error);
        alert('Не удалось загрузить преподавателя.');
    }
}

async function deleteTeacher(id) {
    if (!confirm('Вы уверены, что хотите удалить преподавателя?')) return;
    
    try {
        await apiRequest(`/api/teachers/${id}`, 'DELETE');
        await loadTeachers();
        await loadSubjects();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Не удалось удалить преподавателя.');
    }
}

function cancelEditing() {
    resetForm();
}

function resetForm() {
    editingTeacherId = null;
    document.getElementById('teacherForm').reset();
    document.getElementById('formTitle').textContent = 'Добавить преподавателя';
    document.querySelectorAll('input[name="subject"]').forEach(cb => cb.checked = false);
}