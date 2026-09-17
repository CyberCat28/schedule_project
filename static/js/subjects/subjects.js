document.addEventListener('DOMContentLoaded', async function() {
    await Promise.all([
        loadSubjects(),
        loadTeachers()
    ]);

    displaySubjects(allSubjects);
    displayTeachersCheckboxes();
    
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