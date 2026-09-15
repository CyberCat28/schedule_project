let editingTeacherId = null;
let allSubjects = [];

document.addEventListener('DOMContentLoaded', function() {
    loadTeachers();
    loadSubjects();
    
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

    // 
    document.addEventListener('click', function(e) {
        // кликнули ли по кнопке "Редактировать"
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;  // получение data-id
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
        // запрос к API
        const teachers = await apiRequest('/api/teachers/');
        displayTeachers(teachers);
    } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
        alert('Не удалось загрузить преподавателей.');
    }
}

async function loadSubjects() {
    try {
        allSubjects = await apiRequest('/api/subjects/');
        displaySubjectsCheckboxes();
        updateTeacherSelect();
    } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
    }
}

function displayTeachers(teachers) {
    const container = document.getElementById('teachersList');
    if (!container) return;
    
    if (teachers.length === 0) {
        container.innerHTML = '<p>Преподаватели не найдены.</p>';
        return;
    }
    
    container.innerHTML = teachers.map(teacher => `
        <div class="card" data-id="${teacher.id}" style="border-left: 5px solid ${teacher.color}">
            <h3>${teacher.name}</h3>
            <p><strong>Краткое обозначение:</strong> ${teacher.short_name}</p>
            <div class="color-indicator" style="background-color: ${teacher.color}"></div>
            <div class="card-actions">
                <button class="btn btn-small edit-btn" data-id="${teacher.id}">Редактировать</button>
                <button class="btn btn-small btn-danger delete-btn" data-id="${teacher.id}">Удалить</button>
            </div>
        </div>
    `).join('');
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

function updateTeacherSelect() {
    const select = document.getElementById('subjectTeacher');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Не выбран</option>' +
        allSubjects.map(subject => `
            <option value="${subject.id}">${subject.name}</option>
        `).join('');
    select.value = currentValue;
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
        // обновление формы
        loadTeachers();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Не удалось сохранить преподавателя');
    }
}

async function editTeacher(id) {
    try {
        // загрузка данных с сервера
        const teacher = await apiRequest(`/api/teachers/${id}`);
        
        // заполнение форм
        document.getElementById('teacherName').value = teacher.name;
        document.getElementById('teacherShortName').value = teacher.short_name;
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
        loadTeachers();
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