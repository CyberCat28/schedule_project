// обработка формы преподавателей
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