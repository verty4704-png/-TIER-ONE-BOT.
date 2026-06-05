/**
 * @fileoverview Balanced HT1 Strategy — сбалансированный стиль, стандартный HT1 профиль.
 */
const BaseStrategy = require('./BaseStrategy');

class BalancedStrategy extends BaseStrategy {
    constructor(combatExecutor, movementEngine, itemManager) {
        super(combatExecutor, movementEngine, itemManager);
        this.name = 'Balanced HT1';
    }

    execute(worldData) {
        const { distance } = worldData;
        this.itemManager.equipBestWeapon();

        if (this.combatExecutor.attack({ crit: Math.random() < 0.75 })) {
            if (Math.random() < 0.90) this.combatExecutor.wTap();
            if (distance < 3.2 && Math.random() < 0.55) this.combatExecutor.sTap();
            if (this.combatExecutor.comboCount >= 2 && Math.random() < 0.55) {
                this.combatExecutor.jumpReset();
            }
        }

        this.combatExecutor.reachControl(distance);
        this.movementEngine.startDynamicStrafe(700);
    }
}

module.exports = BalancedStrategy;
