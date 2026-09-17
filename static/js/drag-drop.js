let draggedData = null;

function initDragAndDrop() {
    // делаем дисциплины в панели преподавателей перетаскиваемыми
    document.querySelectorAll('.panel-subject').forEach(el => {
        el.setAttribute('draggable', 'true');
        el.addEventListener('dragstart', handleDragStart);
    });

    // делаем существующие карточки занятий перетаскиваемыми
    document.querySelectorAll('.lesson-card').forEach(el => {
        el.setAttribute('draggable', 'true');
        el.addEventListener('dragstart', handleDragStart);
    });

    // настраивание ячейки таблицы как зоны для сброса
    document.querySelectorAll('.lesson-cell').forEach(cell => {
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    const isLesson = e.target.classList.contains('lesson-card');
    const isSubject = e.target.classList.contains('panel-subject');

    if (isLesson) {
        const lessonId = e.target.dataset.lessonId;
        const week = parseInt(e.target.dataset.week) || 1;
        const lesson = allLessons.find(l => l.id === lessonId);

        draggedData = { 
            type: 'lesson', data: lesson, week: week
        };
        
        e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
        e.target.style.opacity = '0.5';
    } else if (isSubject) {
        draggedData = {
            type: 'subject', teacherId: e.target.dataset.teacher, subjectId: e.target.dataset.subject
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(draggedData));
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    // восстанавливление прозрачности перетаскиваемых элементов
    document.querySelectorAll('.lesson-card').forEach(el => el.style.opacity = '1');

    if (!draggedData) return;

    const cell = e.currentTarget;
    const targetGroupId = cell.dataset.group;
    const targetDay = parseInt(cell.dataset.day);
    const targetPair = parseInt(cell.dataset.pair);

    if (draggedData.type === 'subject') {
        // перетаскивание дисциплины из панели и открытие окна для создания
        openModal(null, draggedData.teacherId, draggedData.subjectId, targetGroupId, targetDay, targetPair);
    } else if (draggedData.type === 'lesson') {
        // перемещение существующего занятия: обновляем группу, день и ТОЛЬКО ту неделю, которую перетащили
        const lesson = draggedData.data;
        const week = draggedData.week;
        
        const modifiedLesson = {
            ...lesson, group_id: targetGroupId, day: targetDay
        };
        
        // меняем пару только у перетаскиваемой недели, вторая неделя остаётся как была
        if (week === 1) {
            modifiedLesson.week1_lesson = targetPair;
        } else if (week === 2) {
            modifiedLesson.week2_lesson = targetPair;
        }
        
        openModal(modifiedLesson);
    }

    draggedData = null;
}