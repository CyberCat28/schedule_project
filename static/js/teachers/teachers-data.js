// глобальные переменные для преподавателей
let editingTeacherId = null;
let allSubjects = [];
let allTeachers = [];

// загрузка данных с сервера
async function loadTeachers() {
    try {
        allTeachers = await apiRequest('/api/teachers/');
        displayTeachers(allTeachers);
        return allTeachers;
    } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
        alert('Не удалось загрузить преподавателей.');
        return [];
    }
}

async function loadSubjects() {
    try {
        allSubjects = await apiRequest('/api/subjects/');
        displaySubjectsCheckboxes();
        return allSubjects;
    } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
        return [];
    }
}