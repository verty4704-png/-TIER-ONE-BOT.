class AxeStrategy {
    constructor(combatExecutor, movementEngine, itemManager) {
        this.combatExecutor = combatExecutor;
        this.movementEngine = movementEngine;
        this.itemManager = itemManager;
        this.name = 'Axe Mode';
    }

    execute(worldData) {
        // Экипируем топор
        this.itemManager.equipBestWeapon();

        // Крит + атака
        const shouldCrit = Math.random() < 0.95;
        if (this.combatExecutor.attack({ crit: shouldCrit })) {
            // W-tap после удара
            if (Math.random() < 0.95) {
                this.combatExecutor.wTap();
            }
        }

        // Страфинг
        const strafeDir = Math.sin(Date.now() / 800) > 0 ? 'left' : 'right';
        this.movementEngine.strafe(strafeDir);
    }
}

module.exports = AxeStrategy;
