// отображение преподавателей
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
        
        const subjectsHtml = teacherSubjects.length > 0
            ? teacherSubjects.map(s => `<span class="subject-tag" style="color: ${s.color || 'var(--color-secondary)'}; border-color: ${s.color || 'var(--color-light)'};">${s.short_name}</span>`).join('')
            : '<span class="no-subjects">Нет дисциплин</span>';
        
        const contactHtml = teacher.contact ? teacher.contact : '';
        
        return `
            <div class="card teacher-card" data-id="${teacher.id}" style="border-top-color: ${teacher.color || 'var(--color-primary)'}">
                <h3><span class="subject-color-dot" style="background-color: ${teacher.color || '#929db0'}"></span>${teacher.name}</h3>
                <p>${teacher.short_name}</p>
                <div class="teacher-subjects">
                    <strong>Контакты:</strong>
                    <p>${contactHtml}</p>
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
            <span class="subject-color-dot" style="background-color: ${subject.color || '#929db0'}"></span>
            <span class="checkbox-text">${subject.name} (${subject.short_name})</span>
        </label>
    `).join('');
}