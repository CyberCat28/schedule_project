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

    // проверка конфликтов
    const conflicts = validateLessonConflicts(lessonData, editingLessonId);
    if (conflicts.length > 0) {
        // показ каждого предупреждения отдельно или списком
        conflicts.forEach(conflict => showNotification(conflict, 'warning'));
        return;
    }
    
    try {
        if (editingLessonId) {
            await apiRequest(`/api/lessons/${editingLessonId}`, 'PUT', lessonData);
            showNotification('Занятие успешно обновлено.', 'success');
        } else {
            await apiRequest('/api/lessons/', 'POST', lessonData);
            showNotification('Занятие успешно добавлено', 'success');
        }
        
        closeModalHandler();
        await loadLessons();
        renderSchedule();
        renderTeachersPanel();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        showNotification('Не удалось сохранить занятие: ' + error.message, 'error');
    }
}

async function deleteLesson() {
    if (!editingLessonId) return;
    if (!confirm('Вы уверены, что хотите удалить это занятие?')) return;
    
    try {
        await apiRequest(`/api/lessons/${editingLessonId}`, 'DELETE');
        showNotification('Занятие удалено', 'success');
        closeModalHandler();
        await loadLessons();
        renderSchedule();
        renderTeachersPanel();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showNotification('Не удалось удалить занятие', 'error');
    }
}