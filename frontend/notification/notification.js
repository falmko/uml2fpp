/**
 * 显示通知
 * @param {Object} options 通知选项
 * @param {string} options.title 通知标题
 * @param {string} options.message 通知消息
 * @param {string} options.type 通知类型 ('success' 或 'error')
 * @param {number} options.duration 显示时间(毫秒) 
 */
export function showNotification(options) {
    const { title, message, type = 'success', duration = 3000 } = options;
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `custom-notification custom-notification-${type}`;
    
    // 通知内容
    const content = document.createElement('div');
    content.className = 'custom-notification-content';
    
    // 标题
    const titleElement = document.createElement('div');
    titleElement.className = 'custom-notification-title';
    titleElement.textContent = title;
    content.appendChild(titleElement);
    
    // 消息
    const messageElement = document.createElement('div');
    messageElement.className = 'custom-notification-message';
    messageElement.textContent = message;
    content.appendChild(messageElement);
    
    // 关闭按钮
    const closeButton = document.createElement('span');
    closeButton.className = 'custom-notification-close';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => closeNotification(notification));
    
    // 组装通知
    notification.appendChild(content);
    notification.appendChild(closeButton);
    
    // 添加到文档
    document.body.appendChild(notification);
    
    // 自动关闭
    if (duration > 0) {
      setTimeout(() => closeNotification(notification), duration);
    }
    
    return notification;
  }
  
  /**
   * 关闭通知
   * @param {HTMLElement} notification 通知元素
   */
  function closeNotification(notification) {
    notification.style.animation = 'fade-out 0.3s forwards';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }