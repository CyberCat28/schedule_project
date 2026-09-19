// глобальные переменные для дисциплин
let editingSubjectId = null;
let allTeachers = [];
let allSubjects = [];

// загрузка данных с сервера
async function loadSubjects() {
    try {
        allSubjects = await apiRequest('/api/subjects/');
        displaySubjects(allSubjects);
        return allSubjects;
    } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
        alert('Не удалось загрузить дисциплины.');
        return [];
    }
}

async function loadTeachers() {
    try {
        allTeachers = await apiRequest('/api/teachers/');
        displayTeachersCheckboxes();
        return allTeachers;
    } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
        return [];
    }
}