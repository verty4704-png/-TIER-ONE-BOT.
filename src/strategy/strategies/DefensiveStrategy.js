/**
 * @fileoverview Defensive HT1 Strategy — осторожный стиль, приоритет выживания.
 */
const BaseStrategy = require('./BaseStrategy');

class DefensiveStrategy extends BaseStrategy {
    constructor(combatExecutor, movementEngine, itemManager) {
        super(combatExecutor, movementEngine, itemManager);
        this.name = 'Defensive HT1';
    }

    execute(worldData) {
        const { distance, cooldown } = worldData;
        this.itemManager.equipBestWeapon();

        // Атакуем только при полной готовности кулдауна
        if ((cooldown ?? 0) <= 0.02) {
            if (this.combatExecutor.attack({ crit: Math.random() < 0.60 })) {
                if (Math.random() < 0.80) this.combatExecutor.wTap();
                // S-tap только когда совсем вплотную
                if (distance < 2.5 && Math.random() < 0.40) this.combatExecutor.sTap();
            }
        }

        // Держать дистанцию 4–5 блоков
        if (distance < 4.0) {
            this.combatExecutor.smartRetreat();
        } else {
            this.combatExecutor.reachControl(distance);
            this.movementEngine.startDynamicStrafe(900);
        }
    }
}

module.exports = DefensiveStrategy;
