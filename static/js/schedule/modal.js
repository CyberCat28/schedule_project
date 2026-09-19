function openModal(lesson = null, preselectedTeacher = null, preselectedSubject = null, preselectedGroup = null, preselectedDay = null, preselectedPair = null) {
    const modal = document.getElementById('lessonModal');
    const modalTitle = document.getElementById('modalTitle');
    const deleteBtn = document.getElementById('deleteBtn');
    const teacherSelect = document.getElementById('lessonTeacher');
    
    teacherSelect.innerHTML = '<option value="">Выберите преподавателя</option>' + 
        allTeachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    
    if (lesson) {
        modalTitle.textContent = 'Редактировать занятие';
        deleteBtn.style.display = 'inline-block';
        
        document.getElementById('lessonId').value = lesson.id;
        document.getElementById('lessonGroup').value = lesson.group_id;
        document.getElementById('lessonDay').value = String(lesson.day);
        document.getElementById('lessonTeacher').value = lesson.teacher_id;
        document.getElementById('lessonWeek1').value = String(lesson.week1_lesson || 0);
        document.getElementById('lessonWeek2').value = String(lesson.week2_lesson || 0);
        document.getElementById('lessonClassroom').value = lesson.classroom_id || '';
        document.getElementById('lessonType').value = lesson.lesson_type || 'Лекция';
        
        updateSubjectsSelect().then(() => {
            document.getElementById('lessonSubject').value = lesson.subject_id;
        });
        
        editingLessonId = lesson.id;
    } else {
        modalTitle.textContent = 'Добавить занятие';
        deleteBtn.style.display = 'none';
        
        document.getElementById('lessonForm').reset();
        document.getElementById('lessonId').value = '';
        document.getElementById('lessonSubject').innerHTML = '<option value="">Сначала выберите преподавателя</option>';
        
        editingLessonId = null;
        
        if (preselectedTeacher) {
            teacherSelect.value = preselectedTeacher;
            updateSubjectsSelect().then(() => {
                if (preselectedSubject) {
                    document.getElementById('lessonSubject').value = preselectedSubject;
                }
            });
        }
        
        // заполнение данных из drag & drop
        if (preselectedGroup) {
            document.getElementById('lessonGroup').value = preselectedGroup;
        } 
        if (preselectedDay !== null) {
            document.getElementById('lessonDay').value = String(preselectedDay);
        }
        if (preselectedPair) {
            // по умолчанию перенесённая пара ставится на 1-ю неделю
            document.getElementById('lessonWeek1').value = String(preselectedPair);
        }
    }
    
    modal.classList.add('active');
}

function closeModalHandler() {
    document.getElementById('lessonModal').classList.remove('active');
    editingLessonId = null;
}

// заполнение выпадающего списка групп в модальном окне
function populateGroupSelect() {
    const groupSelect = document.getElementById('lessonGroup');
    if (!groupSelect) return;

    groupSelect.innerHTML = '<option value="">Выберите группу</option>' +
        allGroups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
}

async function updateSubjectsSelect() {
    const teacherId = document.getElementById('lessonTeacher').value;
    const subjectSelect = document.getElementById('lessonSubject');
    
    if (!teacherId) {
        subjectSelect.innerHTML = '<option value="">Сначала выберите преподавателя</option>';
        return;
    }
    
    const teacher = allTeachers.find(t => t.id == teacherId);
    if (!teacher) {
        subjectSelect.innerHTML = '<option value="">Преподаватель не найден</option>';
        return;
    }
    
    const teacherSubjects = (teacher.subject_ids || [])
        .map(id => allSubjects.find(s => s.id == id))
        .filter(s => s !== undefined);
    
    subjectSelect.innerHTML = '<option value="">Выберите дисциплину</option>' + 
        teacherSubjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}