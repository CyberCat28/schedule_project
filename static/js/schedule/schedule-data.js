// загрузка всех данных с сервера
async function loadLessons() {
    try {
        allLessons = await apiRequest('/api/lessons/');
    } catch (error) {
        console.error('Ошибка загрузки занятий:', error);
        allLessons = [];
    }
}

async function loadTeachers() {
    try {
        allTeachers = await apiRequest('/api/teachers/');
    } catch (error) {
        console.error('Ошибка загрузки преподавателей:', error);
        allTeachers = [];
    }
}

async function loadSubjects() {
    try {
        allSubjects = await apiRequest('/api/subjects/');
    } catch (error) {
        console.error('Ошибка загрузки дисциплин:', error);
        allSubjects = [];
    }
}

async function loadGroups() {
    try {
        allGroups = await apiRequest('/api/groups/');
    } catch (error) {
        console.error('Ошибка загрузки групп:', error);
        allGroups = [];
    }
}