/**
 * @fileoverview Crystal HT1 Strategy — позиционирование + агрессивный страф.
 * Полная логика размещения кристаллов требует серверного API (End Crystals),
 * здесь реализована базовая боевая рамка + правильное движение.
 */
const BaseStrategy = require('./BaseStrategy');

class CrystalStrategy extends BaseStrategy {
    constructor(combatExecutor, movementEngine, itemManager) {
        super(combatExecutor, movementEngine, itemManager);
        this.name = 'Crystal HT1';
        this._phase = 'position'; // 'position' | 'burst'
        this._phaseTimer = 0;
    }

    execute(worldData) {
        const { distance } = worldData;
        this._phaseTimer++;

        // Crystal стратегия: чередуем фазы позиционирования и burst-атаки
        if (this._phaseTimer % 40 === 0) {
            this._phase = this._phase === 'position' ? 'burst' : 'position';
        }

        if (this._phase === 'position') {
            // Держим дистанцию 3–4 блока для crystal placement
            this.combatExecutor.reachControl(distance);
            this.movementEngine.startDynamicStrafe(500);
        } else {
            // Burst: быстрые атаки + jump reset
            if (this.combatExecutor.attack({ crit: true })) {
                if (Math.random() < 0.90) this.combatExecutor.wTap();
                if (Math.random() < 0.70) this.combatExecutor.jumpReset();
            }
            this.movementEngine.startDynamicStrafe(400);
        }
    }
}

module.exports = CrystalStrategy;
