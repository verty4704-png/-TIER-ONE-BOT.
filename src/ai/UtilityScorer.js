/**
 * @fileoverview Utility Scorer for H1-level decision making.
 * Оценивает полезность каждого действия (Attack, Retreat, Eat, Strafe) 
 * и возвращает действие с наибольшим весом.
 */
class UtilityScorer {
    constructor() {
        this.thresholds = {
            lowHealth: 8,      // Ниже этого HP приоритет еды максимален
            safeDistance: 6.0, // Дистанция, на которой можно спокойно есть
            attackRange: 3.8   // Максимальная дистанция для эффективной атаки
        };
    }

    /**
     * Рассчитывает веса для всех возможных действий на основе состояния мира.
     * @param {Object} worldState - Данные из WorldState (hp, distance, cooldown, etc.)
     * @returns {Object} Объект с весами действий.
     */
    calculateUtilities(worldState) {
        const scores = {
            ATTACK: 0,
            RETREAT: 0,
            EAT: 0,
            STRAFE_LEFT: 0,
            STRAFE_RIGHT: 0,
            IDLE: 10 // Базовый вес бездействия
        };

        // 1. Логика АТАКИ
        if (worldState.cooldown === 0 && worldState.distance <= this.thresholds.attackRange) {
            scores.ATTACK = 80; // Базовый вес атаки
            
            // Бонус за крит (если на земле)
            if (worldState.onGround) scores.ATTACK += 15;
            
            // Штраф, если у врага щит и у нас меч (упрощенно)
            if (worldState.targetHasShield && !worldState.hasAxe) scores.ATTACK -= 40;
        }

        // 2. Логика ОТСТУПЛЕНИЯ / ЕДЫ
        if (worldState.health < this.thresholds.lowHealth) {
            scores.EAT = 95; // Приоритет выживания
            scores.RETREAT = 90; // Нужно отбежать, чтобы съесть
        } else if (worldState.health < 14) {
            scores.EAT = 60;
            scores.RETREAT = 50;
        }

        // 3. Логика СТРЕЙФА (Уклонение)
        // Если мы атакуем или отступаем, стрейф помогает не получить урон
        if (scores.ATTACK > 50 || scores.RETREAT > 50) {
            scores.STRAFE_LEFT = 70 + Math.random() * 10; // Рандом для непредсказуемости
            scores.STRAFE_RIGHT = 70 + Math.random() * 10;
        }

        return scores;
    }

    /**
     * Выбирает действие с максимальным весом.
     * @param {Object} scores - Объект с весами из calculateUtilities
     * @returns {string} Название лучшего действия.
     */
    getBestAction(scores) {
        let bestAction = 'IDLE';
        let maxScore = 0;

        for (const [action, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                bestAction = action;
            }
        }

        return bestAction;
    }
}

module.exports = UtilityScorer;
