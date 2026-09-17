// проверка конфликтов
function validateLessonConflicts(newLesson, excludeId = null) {
    const conflicts = [];
    
    const teacher = allTeachers.find(t => t.id === newLesson.teacher_id);
    const group = allGroups.find(g => g.id === newLesson.group_id);
    const teacherName = teacher ? teacher.short_name : 'Неизвестный преподаватель.';
    const groupName = group ? group.name : 'Неизвестная группа.';

    allLessons.forEach(lesson => {
        if (excludeId && lesson.id === excludeId) return;

        // проверка 1-й недели
        if (newLesson.week1_lesson > 0 && lesson.week1_lesson === newLesson.week1_lesson && lesson.day === newLesson.day) {
            if (lesson.teacher_id === newLesson.teacher_id) {
                conflicts.push(` ${teacherName} уже ведет занятие в ${newLesson.week1_lesson} пару (1-я неделя). `);
            }
            if (lesson.group_id === newLesson.group_id) {
                conflicts.push(` Группа ${groupName} уже имеет занятие в ${newLesson.week1_lesson} пару (1-я неделя). `);
            }
            if (newLesson.classroom_id && lesson.classroom_id === newLesson.classroom_id) {
                conflicts.push(` Кабинет ${newLesson.classroom_id} уже занят в ${newLesson.week1_lesson} пару (1-я неделя). `);
            }
        }

        // проверка 2-й недели
        if (newLesson.week2_lesson > 0 && lesson.week2_lesson === newLesson.week2_lesson && lesson.day === newLesson.day) {
            if (lesson.teacher_id === newLesson.teacher_id) {
                conflicts.push(` ${teacherName} уже ведет занятие в ${newLesson.week2_lesson} пару (2-я неделя). `);
            }
            if (lesson.group_id === newLesson.group_id) {
                conflicts.push(` Группа ${groupName} уже имеет занятие в ${newLesson.week2_lesson} пару (2-я неделя). `);
            }
            if (newLesson.classroom_id && lesson.classroom_id === newLesson.classroom_id) {
                conflicts.push(` Кабинет ${newLesson.classroom_id} уже занят в ${newLesson.week2_lesson} пару (2-я неделя). `);
            }
        }
    });

    return conflicts;
}