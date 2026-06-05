/**
 * @fileoverview Axe HT1 Strategy — медленные но сильные удары, shield break, jump crit.
 */
const BaseStrategy = require('./BaseStrategy');

class AxeStrategy extends BaseStrategy {
    constructor(combatExecutor, movementEngine, itemManager) {
        super(combatExecutor, movementEngine, itemManager);
        this.name = 'Axe HT1';
    }

    execute(worldData) {
        const { distance } = worldData;
        this.itemManager.equipBestWeapon();

        // Топор: всегда крит (прыжок перед ударом)
        if (this.combatExecutor.attack({ crit: true })) {
            // W-tap обязательно после каждого удара
            if (Math.random() < 0.95) this.combatExecutor.wTap();

            // Jump reset для следующего крита
            if (Math.random() < 0.80) this.combatExecutor.jumpReset();
        }

        // Держать reach control — топор бьёт дольше, дистанция важна
        this.combatExecutor.reachControl(distance);
        this.movementEngine.startDynamicStrafe(800);
    }
}

module.exports = AxeStrategy;
