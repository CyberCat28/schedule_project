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