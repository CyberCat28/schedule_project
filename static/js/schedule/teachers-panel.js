// панель преподавателей
function renderTeachersPanel() {
    const container = document.getElementById('teachersPanel');
    if (!container) return;
    
    if (allTeachers.length === 0) {
        container.innerHTML = '<p>Преподаватели не найдены</p>';
        return;
    }
    
    const subjectMap = {};
    allSubjects.forEach(s => subjectMap[s.id] = s);
    
    const groupMap = {};
    allGroups.forEach(g => groupMap[g.id] = g);
    
    container.innerHTML = allTeachers.map(teacher => {
        // дисциплины преподавателя
        const teacherSubjects = (teacher.subject_ids || []).map(id => subjectMap[id]).filter(s => s !== undefined);
        
        const subjectsHtml = teacherSubjects.length > 0 ? teacherSubjects.map(s => 
            ` <div class="panel-subject" data-teacher="${teacher.id}" data-subject="${s.id}">
            <span class="subject-color-dot" style="background-color: ${s.color || '#95a5a6'}"></span> ${s.name}</div> `).join('') : '<div class="no-subjects">Нет дисциплин</div>';
        
        // занятия преподавателя
        const teacherLessons = allLessons.filter(l => l.teacher_id === teacher.id);
        
        const lessonsHtml = teacherLessons.length > 0
            ? teacherLessons.map(l => {
                const subj = subjectMap[l.subject_id];
                const grp = groupMap[l.group_id];
                const dayName = days[l.day] || 'Неизвестно';
                const weekText = [];
                if (l.week1_lesson > 0) weekText.push(`1н: ${l.week1_lesson}п`);
                if (l.week2_lesson > 0) weekText.push(`2н: ${l.week2_lesson}п`);
                
                return `
                    <div class="panel-lesson" data-lesson-id="${l.id}" style="border-left: 3px solid ${subj.color || teacher.color}; padding-left: 8px; margin: 5px 0; cursor: pointer;">
                        <div class="panel-lesson-subj">${subj ? subj.short_name : '—'}</div>
                        <div class="panel-lesson-info">${grp ? grp.name : '—'} · ${dayName} · ${weekText.join(', ')}</div>
                    </div>
                `;}).join('') : '<div class="no-lessons">Нет занятий</div>';
        
        return `
            <div class="panel-teacher" data-teacher-id="${teacher.id}">
                <div class="panel-teacher-header">
                    <span class="teacher-color-dot" style="background-color: ${teacher.color}"></span>
                    <span class="teacher-name">${teacher.short_name}</span>
                </div>
                <div class="panel-subjects">
                    ${subjectsHtml}
                </div>
                <div class="panel-lessons-section">
                    <strong>Занятия:</strong>
                    <div class="panel-lessons-list">
                        ${lessonsHtml}
                    </div>
                </div>
                <button class="btn btn-small btn-add-lesson" data-teacher="${teacher.id}">+ Добавить занятие</button>
            </div>
        `;}).join('');

    initDragAndDrop();
    
    // обработчики
    document.querySelectorAll('.btn-add-lesson').forEach(btn => {
        btn.addEventListener('click', function() {
            openModal(null, this.dataset.teacher);
        });
    });
    
    document.querySelectorAll('.panel-subject').forEach(subj => {
        subj.addEventListener('click', function() {
            openModal(null, this.dataset.teacher, this.dataset.subject);
        });
    });
    
    document.querySelectorAll('.panel-lesson').forEach(lessonEl => {
        lessonEl.addEventListener('click', function() {
            const lessonId = this.dataset.lessonId;
            const lesson = allLessons.find(l => l.id === lessonId);
            if (lesson) openModal(lesson);
        });
    });
}