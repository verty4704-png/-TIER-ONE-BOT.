const EventBus = require('../core/EventBus');

class DecisionEngine {
    constructor(worldState, strategyManager, combatAnalyzer) {
        this.worldState = worldState;
        this.strategyManager = strategyManager;
        this.combatAnalyzer = combatAnalyzer;
    }

    tick(worldData) {
        if (!this.worldState.isInCombat || !this.worldState.target) return;

        // Простая логика принятия решений
        // В будущем здесь будет Utility AI или Behavior Tree
        
        if (this.combatAnalyzer.canAttack() && this.combatAnalyzer.isInRange(4.0)) {
            this.strategyManager.executeCurrentStrategy(this.worldData);
        }
    }
}

module.exports = DecisionEngine;
