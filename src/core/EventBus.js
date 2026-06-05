/**
 * @fileoverview Централизованная шина событий (Pub/Sub).
 * Сохранена оригинальная архитектура + новые события HT1.
 * 
 * @typedef {'COMBAT:TARGET_ACQUIRED'|'COMBAT:TARGET_LOST'|'COMBAT:ATTACK_EXECUTED'|
 *   'COMBAT:DAMAGE_TAKEN'|'COMBAT:COMBO_UPDATED'|'COMBAT:WTAP'|'COMBAT:STAP'|
 *   'COMBAT:JUMP_RESET'|'COMBAT:RETREAT'|'WORLD:TICK_UPDATED'|
 *   'METRICS:FIGHT_ENDED'|'AI:WEIGHTS_UPDATED'|'STRATEGY:CHANGED'} EventName
 */
class EventBus {
    constructor() {
        /** @type {Map<string, Array<{callback: Function, priority: number}>>} */
        this.listeners = new Map();
    }

    /**
     * @param {string} event
     * @param {Function} callback
     * @param {number} [priority=0]
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
     * @param {string} event
     * @param {any} data
     */
    emit(event, data) {
        if (!this.listeners.has(event)) return;
        for (const { callback } of this.listeners.get(event)) {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Error in listener for '${event}':`, error);
            }
        }
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        this.listeners.set(event,
            this.listeners.get(event).filter(l => l.callback !== callback)
        );
    }

    once(event, callback, priority = 0) {
        const wrapper = (data) => {
            this.off(event, wrapper);
            callback(data);
        };
        this.on(event, wrapper, priority);
    }
}

module.exports = new EventBus();
