function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: '<img src="/static/icons/Check.svg" alt="Готово">',
        error: '<img src="/static/icons/error.svg" alt="Ошибка">',
        warning: '<img src="/static/icons/Alert.svg" alt="Предупреждение">',
        info: '<img src="/static/icons/Alert.svg" alt="Информация">'
    };

    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

    container.appendChild(notification);

    // автозакрытие
    const timeoutId = setTimeout(() => {
        removeNotification(notification);
    }, 4000);

    // закрытие по клику
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(timeoutId);
        removeNotification(notification);
    });
}

// закрытие с анимацией
function removeNotification(notification) {
    notification.classList.add('hiding');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}