let editingGroupId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadGroups();
    
    // обработка формы
    const form = document.getElementById('groupForm');
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
            const id = e.target.dataset.id;  // получение data-id
            editGroup(id);
        }
        // кликнули ли по кнопке "Удалить"
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            deleteGroup(id);
        }
    });
});

async function loadGroups() {
    try {
        // запрос к API
        const groups = await apiRequest('/api/groups/');
        displayGroups(groups);
    } catch (error) {
        console.error('Ошибка загрузки групп:', error);
        alert('Не удалось загрузить группы.');
    }
}

function displayGroups(groups) {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    if (groups.length === 0) {
        container.innerHTML = '<p>Группы не найдены.</p>';
        return;
    }
    
    container.innerHTML = groups.map(group => `
        <div class="card" data-id="${group.id}">
            <h3>${group.name}</h3>
            <p><strong>Специальность:</strong> ${group.speciality}</p>
            <p><strong>Курс:</strong> ${group.course}</p>
            <div class="card-actions">
                <button class="btn btn-small edit-btn" data-id="${group.id}">Редактировать</button>
                <button class="btn btn-small btn-danger delete-btn" data-id="${group.id}">Удалить</button>
            </div>
        </div>
    `).join('');
}

async function handleFormSubmit(e) {
    // остановление обновление страницы
    e.preventDefault();
    
    // собирание выбранных дисциплин
    const groupData = {
        name: document.getElementById('groupName').value,
        speciality: document.getElementById('groupSpeciality').value,
        course: parseInt(document.getElementById('groupCourse').value)
    };
    
    try {
        if (editingGroupId) {
            // обновление существующей записи
            await apiRequest(`/api/groups/${editingGroupId}`, 'PUT', groupData);
        } else {
            // создание новой записи
            await apiRequest('/api/groups/', 'POST', groupData);
        }
        // сброс формы
        resetForm();
        // обновление формы
        loadGroups();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Не удалось сохранить группу');
    }
}

async function editGroup(id) {
    try {
        // загрузка данных с сервера
        const group = await apiRequest(`/api/groups/${id}`);
        
        // заполнение форм
        document.getElementById('groupId').value = group.id;
        document.getElementById('groupName').value = group.name;
        document.getElementById('groupSpeciality').value = group.speciality;
        document.getElementById('groupCourse').value = group.course;
        
        // сохранение id для обновления
        editingGroupId = id;
        document.getElementById('formTitle').textContent = 'Редактировать группу';
        
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Ошибка загрузки группы:', error);
        alert('Не удалось загрузить группу.');
    }
}

async function deleteGroup(id) {
    if (!confirm('Вы уверены, что хотите удалить группу?')) return;
    
    try {
        await apiRequest(`/api/groups/${id}`, 'DELETE');
        loadGroups();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Не удалось удалить группу.');
    }
}

function cancelEditing() {
    resetForm();
}

function resetForm() {
    editingGroupId = null;
    document.getElementById('groupForm').reset();
    document.getElementById('formTitle').textContent = 'Добавить группу';
}