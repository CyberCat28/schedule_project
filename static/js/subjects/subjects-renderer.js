// отображение дисциплин
function displaySubjects(subjects) {
    const container = document.getElementById('subjectsList');
    if (!container) return;
    
    if (subjects.length === 0) {
        container.innerHTML = '<p>Дисциплины не найдены.</p>';
        return;
    }
    
    // создание map для быстрого поиска преподавателя
    const teacherMap = {};
    allTeachers.forEach(t => teacherMap[t.id] = t);
    
    container.innerHTML = subjects.map(subject => {
        // получение списка преподавателей дисциплины
        const subjectTeachers = (subject.teacher_ids || []).map(id => teacherMap[id]).filter(t => t !== undefined);
        
        const teachersHtml = subjectTeachers.length > 0 ? 
            subjectTeachers.map(t => `<span class="teacher-tag" style="background-color: ${t.color}20; border-color: ${t.color}">${t.short_name}</span>`).join('') : 
            '<span class="no-teachers">Нет преподавателей</span>';
        
        return `
            <div class="card subject-card" data-id="${subject.id}">
                <h3>
                    <span class="subject-color-dot" style="background-color: ${subject.color || '#95a5a6'}"></span>
                    ${subject.name}
                </h3>
                <p><strong>Код:</strong> ${subject.short_name}</p>
                <div class="subject-teachers">
                    <strong>Преподаватели:</strong>
                    <div class="teachers-list">${teachersHtml}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-small edit-btn" data-id="${subject.id}">Редактировать</button>
                    <button class="btn btn-small btn-danger delete-btn" data-id="${subject.id}">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

function displayTeachersCheckboxes() {
    const container = document.getElementById('teachersList');
    if (!container) return;
    
    if (allTeachers.length === 0) {
        container.innerHTML = '<p>Преподаватели не найдены. Сначала добавьте преподавателей.</p>';
        return;
    }
    
    container.innerHTML = allTeachers.map(teacher => `
        <label class="checkbox-label">
            <input type="checkbox" name="teacher" value="${teacher.id}">
            <span class="teacher-color-indicator" style="background-color: ${teacher.color}"></span>
            ${teacher.name} (${teacher.short_name})
        </label>
    `).join('');
}