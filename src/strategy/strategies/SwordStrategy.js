class SwordStrategy {
    constructor(combatExecutor, movementEngine, itemManager) {
        this.combatExecutor = combatExecutor;
        this.movementEngine = movementEngine;
        this.itemManager = itemManager;
        this.name = 'Sword Mode';
    }

    execute(worldData) {
        this.itemManager.equipBestWeapon();

        // Быстрые атаки
        if (this.combatExecutor.attack({ crit: false })) {
            // W-tap каждый второй удар
            if (Math.random() < 0.5) {
                this.combatExecutor.wTap();
            }
        }

        // Агрессивный страфинг
        const strafeDir = Math.sin(Date.now() / 500) > 0 ? 'left' : 'right';
        this.movementEngine.strafe(strafeDir);
    }
}

module.exports = SwordStrategy;
