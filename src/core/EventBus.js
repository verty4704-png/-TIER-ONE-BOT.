/**
 * @fileoverview Централизованная шина событий (Pub/Sub) для слабой связанности модулей.
 */
class EventBus {
    constructor() {
        /** @type {Map<string, Array<{callback: Function, priority: number}>>} */
        this.listeners = new Map();
    }

    /**
     * Подписка на событие
     * @param {string} event - Имя события
     * @param {Function} callback - Функция-обработчик
     * @param {number} [priority=0] - Приоритет (чем выше, тем раньше)
     */
    on(event, callback, priority = 0) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        const listeners = this.listeners.get(event);
        listeners.push({ callback, priority });
        listeners.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Публикация события
     * @param {string} event - Имя события
     * @param {any} data - Данные для обработчиков
     */
    emit(event, data) {
        if (!this.listeners.has(event)) return;

        const listeners = this.listeners.get(event);
        for (const { callback } of listeners) {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Error in listener for '${event}':`, error);
            }
        }
    }

    /**
     * Отписка от события
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const listeners = this.listeners.get(event).filter(l => l.callback !== callback);
        this.listeners.set(event, listeners);
    }
}

module.exports = new EventBus();
