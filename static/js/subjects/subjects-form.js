// обработка формы дисциплин
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
        color: document.getElementById('subjectColor').value,
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
        document.getElementById('subjectColor').value = subject.color || '#3498db';
        
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