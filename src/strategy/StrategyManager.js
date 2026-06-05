/**
 * @fileoverview StrategyManager HT1 — управляет всеми 6 стратегиями.
 * Стратегии: aggressive | balanced | defensive | sword | axe | crystal
 */

const AxeStrategy        = require('./strategies/AxeStrategy');
const SwordStrategy      = require('./strategies/SwordStrategy');
const CrystalStrategy    = require('./strategies/CrystalStrategy');
const AggressiveStrategy = require('./strategies/AggressiveStrategy');
const BalancedStrategy   = require('./strategies/BalancedStrategy');
const DefensiveStrategy  = require('./strategies/DefensiveStrategy');
const EventBus           = require('../core/EventBus');
const Logger             = require('../core/Logger');

/** @typedef {'aggressive'|'balanced'|'defensive'|'sword'|'axe'|'crystal'} StrategyName */

/** Профиль прицеливания по стратегии */
const AIM_PROFILES = {
    aggressive: 'aggressive',
    balanced:   'balanced',
    defensive:  'defensive',
    sword:      'nervous',
    axe:        'smooth',
    crystal:    'balanced'
};

class StrategyManager {
    /**
     * @param {import('../execution/CombatExecutor')} combatExecutor
     * @param {import('../execution/MovementEngine')} movementEngine
     * @param {import('../execution/ItemManager')} itemManager
     * @param {import('../perception/WorldState')} [worldState]
     */
    constructor(combatExecutor, movementEngine, itemManager, worldState = null) {
        this.combatExecutor = combatExecutor;
        this.movementEngine = movementEngine;
        this.itemManager    = itemManager;
        this.worldState     = worldState;

        this.strategies = {
            axe:        new AxeStrategy(combatExecutor, movementEngine, itemManager),
            sword:      new SwordStrategy(combatExecutor, movementEngine, itemManager),
            crystal:    new CrystalStrategy(combatExecutor, movementEngine, itemManager),
            aggressive: new AggressiveStrategy(combatExecutor, movementEngine, itemManager),
            balanced:   new BalancedStrategy(combatExecutor, movementEngine, itemManager),
            defensive:  new DefensiveStrategy(combatExecutor, movementEngine, itemManager)
        };

        /** @type {StrategyName} */
        this.currentStrategy = 'balanced';
    }

    /**
     * @param {StrategyName} name
     */
    setStrategy(name) {
        if (!this.strategies[name]) {
            Logger.warn(`[StrategyManager] Unknown strategy: ${name}`);
            return;
        }
        this.currentStrategy = name;

        // Синхронизировать профиль прицеливания
        if (this.worldState) {
            this.worldState.setAimProfile(AIM_PROFILES[name] || 'balanced');
        }

        EventBus.emit('STRATEGY:CHANGED', { strategy: name });
        Logger.ht1(`[Strategy] → ${this.strategies[name].name}`);
    }

    /** @param {Object} worldData */
    executeCurrentStrategy(worldData) {
        const strategy = this.strategies[this.currentStrategy];
        if (strategy) strategy.execute(worldData);
    }

    getStrategyName() {
        return this.strategies[this.currentStrategy]?.name ?? this.currentStrategy;
    }

    /** Список доступных стратегий */
    static availableStrategies() {
        return ['aggressive', 'balanced', 'defensive', 'sword', 'axe', 'crystal'];
    }
}

module.exports = StrategyManager;
