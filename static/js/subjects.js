let editingSubjectId = null;
let allTeachers = [];

document.addEventListener('DOMContentLoaded', function() {
    loadSubjects();
    loadTeachers();
    
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
        // запрос к API
        const subjects = await apiRequest('/api/subjects/');
        displaySubjects(subjects);
    } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
        alert('Не удалось загрузить дисциплины.');
    }
}

async function loadTeachers() {
    try {
        allTeachers = await apiRequest('/api/teachers/');
        updateTeacherSelect();
    } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
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
    allTeachers.forEach(t => teacherMap[t.id] = t.name);
    
    container.innerHTML = subjects.map(subject => {
        const teacherName = subject.teacher_id ? 
            (teacherMap[subject.teacher_id] || 'Неизвестный преподаватель') : 
            'Не назначен';
        
        return `
            <div class="card" data-id="${subject.id}">
                <h3>${subject.name}</h3>
                <p><strong>Код:</strong> ${subject.short_name}</p>
                <p><strong>Преподаватель:</strong> ${teacherName}</p>
                <div class="card-actions">
                    <button class="btn btn-small edit-btn" data-id="${subject.id}">Редактировать</button>
                    <button class="btn btn-small btn-danger delete-btn" data-id="${subject.id}">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateTeacherSelect() {
    const select = document.getElementById('subjectTeacher');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '<option value="">Не выбран</option>' +
        allTeachers.map(teacher => `
            <option value="${teacher.id}">${teacher.name}</option>
        `).join('');
    select.value = currentValue;
}

async function handleFormSubmit(e) {
    // остановление обновление страницы
    e.preventDefault();
    
    const teacherId = document.getElementById('subjectTeacher').value;
    
    // собирание выбранных дисциплин
    const subjectData = {
        name: document.getElementById('subjectName').value,
        short_name: document.getElementById('subjectShortName').value,
        teacher_id: teacherId || null
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
        // обновление формы
        loadSubjects();
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
        document.getElementById('subjectTeacher').value = subject.teacher_id || '';
        
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
        loadSubjects();
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
}