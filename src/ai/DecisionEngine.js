const UtilityScorer = require('./UtilityScorer');
const EventBus = require('../core/EventBus');

class DecisionEngine {
    constructor(worldState, strategyManager, combatAnalyzer) {
        this.worldState = worldState;
        this.strategyManager = strategyManager;
        this.combatAnalyzer = combatAnalyzer;
        this.scorer = new UtilityScorer();
    }

    tick(worldData) {
        if (!this.worldState.isInCombat || !this.worldState.target) return;

        // 1. Собираем данные для оценки
        const context = {
            health: this.worldState.bot.entity.health,
            distance: worldData.distance,
            cooldown: worldData.cooldown,
            onGround: this.worldState.bot.entity.onGround,
            targetHasShield: false, // Здесь можно добавить логику проверки щита
            hasAxe: true // Упрощенно считаем, что топор есть
        };

        // 2. Оцениваем полезность действий
        const scores = this.scorer.calculateUtilities(context);
        
        // 3. Принимаем решение
        const bestAction = this.scorer.getBestAction(scores);

        // 4. Передаем решение стратегу для исполнения
        // В будущем здесь будет более сложная логика переключения стратегий
        if (bestAction === 'ATTACK') {
            this.strategyManager.executeCurrentStrategy(worldData);
        } else if (bestAction === 'RETREAT' || bestAction === 'EAT') {
            // Логика отступления (пока простая остановка или движение назад)
            this.strategyManager.movementEngine.resetControls();
            this.strategyManager.movementEngine.strafe(Math.random() > 0.5 ? 'left' : 'right');
        }
    }
}

module.exports = DecisionEngine;
