/**
 * @fileoverview Базовый класс стратегии.
 * @typedef {'aggressive'|'balanced'|'defensive'} BehaviourMode
 */
class BaseStrategy {
    /**
     * @param {import('../../execution/CombatExecutor')} combatExecutor
     * @param {import('../../execution/MovementEngine')} movementEngine
     * @param {import('../../execution/ItemManager')} itemManager
     */
    constructor(combatExecutor, movementEngine, itemManager) {
        this.combatExecutor = combatExecutor;
        this.movementEngine = movementEngine;
        this.itemManager    = itemManager;
        this.name           = 'Base';
    }

    /** @param {Object} worldData */
    execute(worldData) {
        throw new Error('execute() must be implemented');
    }
}

module.exports = BaseStrategy;
