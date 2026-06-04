class CrystalStrategy {
    constructor(combatExecutor, movementEngine, itemManager) {
        this.combatExecutor = combatExecutor;
        this.movementEngine = movementEngine;
        this.itemManager = itemManager;
        this.name = 'Crystal Mode';
    }

    execute(worldData) {
        // Базовая логика для кристаллов
        // В полной версии здесь будет размещение и подрыв кристаллов
        this.movementEngine.strafe(Math.random() > 0.5 ? 'left' : 'right');
    }
}

module.exports = CrystalStrategy;
