/**
 * @fileoverview Aggressive HT1 Strategy — максимальный DPS, постоянный натиск.
 * Высокая частота атак, минимальное отступление, combo extension.
 */
const BaseStrategy = require('./BaseStrategy');

class AggressiveStrategy extends BaseStrategy {
    constructor(combatExecutor, movementEngine, itemManager) {
        super(combatExecutor, movementEngine, itemManager);
        this.name = 'Aggressive HT1';
    }

    execute(worldData) {
        const { distance } = worldData;
        this.itemManager.equipBestWeapon();

        if (this.combatExecutor.attack({ crit: Math.random() < 0.85 })) {
            // Почти всегда W-tap
            if (Math.random() < 0.98) this.combatExecutor.wTap();
            // S-tap при вплотную
            if (distance < 2.8 && Math.random() < 0.80) this.combatExecutor.sTap();
            // Jump reset для следующего крита
            if (Math.random() < 0.75) this.combatExecutor.jumpReset();

            const combo = this.combatExecutor.comboCount;
            if (combo >= 3) this.combatExecutor.comboExtend(combo);
        }

        // Агрессивный страф — быстрая смена
        this.movementEngine.startDynamicStrafe(500);
        // Всегда в атаку
        this.movementEngine.chaseTarget(2.8);
    }
}

module.exports = AggressiveStrategy;
