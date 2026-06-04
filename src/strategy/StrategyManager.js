const AxeStrategy = require('./strategies/AxeStrategy');
const SwordStrategy = require('./strategies/SwordStrategy');
const CrystalStrategy = require('./strategies/CrystalStrategy');

class StrategyManager {
    constructor(combatExecutor, movementEngine, itemManager) {
        this.combatExecutor = combatExecutor;
        this.movementEngine = movementEngine;
        this.itemManager = itemManager;
        
        this.strategies = {
            axe: new AxeStrategy(combatExecutor, movementEngine, itemManager),
            sword: new SwordStrategy(combatExecutor, movementEngine, itemManager),
            crystal: new CrystalStrategy(combatExecutor, movementEngine, itemManager)
        };
        
        this.currentStrategy = 'axe';
    }

    setStrategy(name) {
        if (this.strategies[name]) {
            this.currentStrategy = name;
        }
    }

    executeCurrentStrategy(worldData) {
        const strategy = this.strategies[this.currentStrategy];
        if (strategy) {
            strategy.execute(worldData);
        }
    }
}

module.exports = StrategyManager;
