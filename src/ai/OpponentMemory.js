/**
 * OpponentMemory HT1
 * Хранит и анализирует историю боев против конкретных противников
 */
const Logger = require('../core/Logger');

class OpponentMemory {
    constructor(maxOpponents = 100) {
        this.opponents = new Map(); // username → OpponentProfile
        this.maxOpponents = maxOpponents;
    }

    /**
     * Получить или создать профиль противника
     */
    getOrCreateProfile(username) {
        if (!this.opponents.has(username)) {
            this.opponents.set(username, {
                username,
                fights: [],
                stats: {
                    winRate: 0,
                    avgDamageDealt: 0,
                    avgDamageTaken: 0,
                    avgComboDuration: 0,
                    favoriteStrategies: {}
                },
                weaknesses: [],
                lastFought: null,
                fightCount: 0
            });
        }
        return this.opponents.get(username);
    }

    /**
     * Добавить результат боя в историю
     */
    recordFightResult(username, fightData) {
        const profile = this.getOrCreateProfile(username);

        profile.fights.push({
            timestamp: Date.now(),
            result: fightData.result, // 'win' | 'loss' | 'draw'
            damageDealt: fightData.damageDealt ?? 0,
            damageTaken: fightData.damageTaken ?? 0,
            duration: fightData.duration ?? 0,
            weaponUsed: fightData.weaponUsed,
            enemyStrategy: fightData.enemyStrategy
        });

        profile.lastFought = Date.now();
        profile.fightCount++;

        // Обновить статистику
        this._updateStats(profile);

        // Удалить старых противников если превышен лимит
        if (this.opponents.size > this.maxOpponents) {
            const oldest = Array.from(this.opponents.values())
                .sort((a, b) => (a.lastFought ?? 0) - (b.lastFought ?? 0))[0];
            this.opponents.delete(oldest.username);
        }

        Logger.ht1(`[Memory] Recorded fight vs ${username}: ${fightData.result}`);
        return profile;
    }

    /**
     * Получить слабости противника на основе истории
     */
    identifyWeaknesses(username) {
        const profile = this.getOrCreateProfile(username);

        if (profile.fightCount < 2) {
            return [];
        }

        const weaknesses = [];

        // Анализировать результаты при разных стратегиях
        const winsByStrategy = {};
        profile.fights.forEach(f => {
            const strat = f.weaponUsed || 'unknown';
            if (!winsByStrategy[strat]) {
                winsByStrategy[strat] = { wins: 0, total: 0 };
            }
            winsByStrategy[strat].total++;
            if (f.result === 'win') winsByStrategy[strat].wins++;
        });

        // Стратегии с низким win rate против этого противника
        for (const [strat, data] of Object.entries(winsByStrategy)) {
            const winRate = data.wins / data.total;
            if (winRate > 0.6) {
                weaknesses.push({
                    strategy: strat,
                    effectiveness: winRate,
                    description: `Use ${strat} for ${(winRate * 100).toFixed(0)}% winrate`
                });
            }
        }

        profile.weaknesses = weaknesses;
        return weaknesses;
    }

    /**
     * Получить рекомендуемую стратегию против противника
     */
    getRecommendedStrategy(username) {
        const weaknesses = this.identifyWeaknesses(username);

        if (weaknesses.length === 0) {
            return 'balanced'; // стратегия по умолчанию
        }

        // Вернуть стратегию с наивысшей эффективностью
        return weaknesses.sort((a, b) => b.effectiveness - a.effectiveness)[0].strategy;
    }

    /**
     * Получить краткую статистику противника
     */
    getSummary(username) {
        const profile = this.getOrCreateProfile(username);
        
        if (profile.fightCount === 0) {
            return `${username}: No data`;
        }

        return `${username}: ${profile.fightCount} fights | WR: ${(profile.stats.winRate * 100).toFixed(0)}% | Recommended: ${this.getRecommendedStrategy(username)}`;
    }

    /**
     * Получить все профили противников
     */
    getAllProfiles() {
        return Array.from(this.opponents.values());
    }

    /**
     * Получить топ противников по количеству боев
     */
    getTopOpponents(limit = 10) {
        return Array.from(this.opponents.values())
            .sort((a, b) => b.fightCount - a.fightCount)
            .slice(0, limit);
    }

    /**
     * Очистить память
     */
    clear() {
        this.opponents.clear();
        Logger.ht1('[Memory] Cleared all opponent data');
    }

    /**
     * Экспортировать данные
     */
    export() {
        return Array.from(this.opponents.values());
    }

    /**
     * Получить статистику всей памяти
     */
    getMemoryStats() {
        const profiles = Array.from(this.opponents.values());
        const totalFights = profiles.reduce((sum, p) => sum + p.fightCount, 0);
        const totalWins = profiles.reduce((sum, p) => sum + (p.fights.filter(f => f.result === 'win').length), 0);

        return {
            totalOpponents: this.opponents.size,
            totalFights,
            totalWins,
            overallWinRate: totalFights > 0 ? totalWins / totalFights : 0,
            maxSize: this.maxOpponents
        };
    }

    // ── Приватные методы ────────────────────────────────────

    _updateStats(profile) {
        const fights = profile.fights;
        if (fights.length === 0) return;

        const wins = fights.filter(f => f.result === 'win').length;
        profile.stats.winRate = wins / fights.length;
        
        profile.stats.avgDamageDealt = fights.reduce((sum, f) => sum + f.damageDealt, 0) / fights.length;
        profile.stats.avgDamageTaken = fights.reduce((sum, f) => sum + f.damageTaken, 0) / fights.length;
        profile.stats.avgComboDuration = fights.reduce((sum, f) => sum + f.duration, 0) / fights.length;

        // Анализировать избранные стратегии противника
        const strategies = {};
        fights.forEach(f => {
            strategies[f.enemyStrategy] = (strategies[f.enemyStrategy] ?? 0) + 1;
        });
        profile.stats.favoriteStrategies = strategies;
    }
}

module.exports = OpponentMemory;
