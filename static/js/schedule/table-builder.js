// создание таблицы расписания
function buildScheduleTable() {
    const table = document.getElementById('scheduleTable');
    if (!table) return;
    
    let html = '<thead><tr><th class="time-header">Группа / Пара</th>';
    allGroups.forEach(group => {
        html += ` <th class="group-header"><div class="group-name">${group.name}</div></th> `;
    });
    html += '</tr></thead><tbody>';
    
    days.forEach((day, dayIndex) => {
        html += ` <tr class="day-header-row"> <td colspan="${allGroups.length + 1}" class="day-name">${day}</td> </tr> `;
        
        for (let pair = 1; pair <= 4; pair++) {
            // нахождение времени для пары
            const lessonTime = lessonTimes.find(t => t.pair === pair);
            const timeText = lessonTime ? lessonTime.time : '';
            
            html += ` <tr class="lesson-row">
                <td class="pair-number">
                <div class="pair-label">${pair} пара</div>
                <div class="pair-time">${timeText}</div>
                </td> `;
            
            allGroups.forEach(group => {
                html += ` <td class="lesson-cell" data-group="${group.id}" data-day="${dayIndex}" data-pair="${pair}"> </td>`;
            });
            html += '</tr>';
        }
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}