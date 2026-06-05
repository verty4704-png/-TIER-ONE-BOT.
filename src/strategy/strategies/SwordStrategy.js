/**
 * @fileoverview Sword HT1 Strategy — быстрые атаки, W-tap, S-tap, combo extension.
 */
const BaseStrategy = require('./BaseStrategy');

class SwordStrategy extends BaseStrategy {
    constructor(combatExecutor, movementEngine, itemManager) {
        super(combatExecutor, movementEngine, itemManager);
        this.name = 'Sword HT1';
        this._attackCount = 0;
    }

    execute(worldData) {
        const { distance } = worldData;
        this.itemManager.equipBestWeapon();

        // Меч: крит при каждом втором ударе (прыжок)
        const shouldCrit = this._attackCount % 2 === 0;

        if (this.combatExecutor.attack({ crit: shouldCrit })) {
            this._attackCount++;

            // W-tap после каждого удара (95%)
            if (Math.random() < 0.95) this.combatExecutor.wTap();

            // S-tap при близкой дистанции (70%)
            if (distance < 3.0 && Math.random() < 0.70) this.combatExecutor.sTap();

            // Jump reset при длинном комбо
            const combo = this.combatExecutor.comboCount;
            if (combo >= 2 && Math.random() < 0.60) this.combatExecutor.jumpReset();
        }

        // Reach control
        this.combatExecutor.reachControl(distance);
        this.movementEngine.startDynamicStrafe(650);
    }
}

module.exports = SwordStrategy;
