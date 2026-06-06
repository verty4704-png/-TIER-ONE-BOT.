/**
 * CritAttackOptimizer HT1
 * Оптимизирует крит-атаки через W-tap и jump reset
 */
const EventBus = require('../core/EventBus');
const Logger = require('../core/Logger');

class CritAttackOptimizer {
    constructor(bot, worldState) {
        this.bot = bot;
        this.worldState = worldState;
        this.critWindow = null;
    }

    /**
     * Вычислить окно для идеального крита (в тиках)
     */
    calculateCritWindow(targetPos, targetVelocity, knockbackData) {
        const botEntity = this.bot.entity;
        const distance = botEntity.position.distanceTo(targetPos);

        // Крит возможен если:
        // 1. Бот на земле или падает
        // 2. Враг выше бота (для W-tap крита)
        // 3. Расстояние 3.5-4.2 блока
        
        const heightDiff = targetPos.y - botEntity.position.y;
        const isOptimalHeight = heightDiff > -0.5 && heightDiff < 1.5;
        const isOptimalDistance = distance >= 3.5 && distance <= 4.2;

        if (!isOptimalHeight || !isOptimalDistance) {
            return null;
        }

        // Вычислить, когда враг будет в идеальной позиции
        const predictedPos = this._predictPositionAtTick(
            targetPos,
            targetVelocity,
            knockbackData,
            3 // на 3 тика вперёд
        );

        this.critWindow = {
            start: Date.now(),
            duration: 200, // мс
            targetPosition: predictedPos,
            confidence: 0.85
        };

        EventBus.emit('COMBAT:CRIT_WINDOW_DETECTED', this.critWindow);
        Logger.ht1(`[Crit] Window detected! Distance:${distance.toFixed(2)} Height:${heightDiff.toFixed(2)}`);
        
        return this.critWindow;
    }

    /**
     * Вычислить вероятность попадания крита (0-1)
     */
    predictCritHitChance(distance, enemyVelocity, isMoving = true) {
        let chance = 0.9; // базовая вероятность

        // Неподвижный враг — больше шанс
        if (!isMoving) {
            chance = 0.95;
        }

        // Враг активно движется — меньше шанс
        const velocityMagnitude = Math.sqrt(enemyVelocity.x ** 2 + enemyVelocity.z ** 2);
        if (velocityMagnitude > 0.3) {
            chance -= velocityMagnitude * 0.1;
        }

        // На оптимальной дистанции шанс выше
        if (distance >= 3.8 && distance <= 4.1) {
            chance += 0.05;
        }

        return Math.max(0.5, Math.min(1, chance));
    }

    /**
     * Выполнить оптимальный крит
     */
    executeOptimalCrit(executor, movementEngine) {
        if (!this.critWindow) {
            return false;
        }

        const now = Date.now();
        if (now - this.critWindow.start > this.critWindow.duration) {
            this.critWindow = null;
            return false;
        }

        // Выполнить W-tap крит (спринт + прыжок + атака)
        movementEngine.setControls({ forward: true, sprint: true });
        executor.jump();
        
        setTimeout(() => {
            executor.attack();
            movementEngine.setControls({ forward: false, sprint: false });
        }, 50); // через 50мс от прыжка

        Logger.ht1('[Crit] Executing optimal crit!');
        return true;
    }

    /**
     * Получить рекомендацию по крит-окну
     */
    getCritRecommendation(distance, targetPos, targetVelocity, knockbackData) {
        const window = this.calculateCritWindow(targetPos, targetVelocity, knockbackData);
        const chance = this.predictCritHitChance(distance, targetVelocity);

        if (!window) {
            return {
                canCrit: false,
                reason: 'Invalid distance or height'
            };
        }

        return {
            canCrit: true,
            hitChance: chance,
            window,
            recommendedAction: chance > 0.8 ? 'EXECUTE' : 'WAIT'
        };
    }

    /**
     * Получить текущий крит-статус
     */
    getCritStatus() {
        return {
            hasActiveWindow: this.critWindow !== null,
            window: this.critWindow
        };
    }

    // ── Приватные методы ────────────────────────────────────

    _predictPositionAtTick(pos, velocity, knockbackData, ticks) {
        let x = pos.x;
        let y = pos.y;
        let z = pos.z;

        let vx = velocity.x;
        let vz = velocity.z;
        let vy = velocity.y ?? 0;

        for (let i = 0; i < ticks; i++) {
            x += vx;
            y += vy;
            z += vz;

            vx *= 0.91;
            vz *= 0.91;
            vy -= 0.08;
            vy *= 0.98;
        }

        return { x, y, z };
    }
}

module.exports = CritAttackOptimizer;
