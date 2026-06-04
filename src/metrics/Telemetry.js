class Telemetry {
    constructor() {
        this.stats = {
            totalAttacks: 0,
            hits: 0,
            damageTaken: 0,
            startTime: Date.now()
        };
    }

    recordAttack(data) {
        this.stats.totalAttacks++;
        // В полной версии здесь будет проверка попадания
        this.stats.hits++;
    }

    recordDamage(data) {
        this.stats.damageTaken += data.amount || 0;
    }

    getStats() {
        return {
            totalAttacks: this.stats.totalAttacks,
            hits: this.stats.hits,
            hitRate: this.stats.totalAttacks > 0 ? this.stats.hits / this.stats.totalAttacks : 0,
            damageTaken: this.stats.damageTaken,
            uptime: Date.now() - this.stats.startTime
        };
    }
}

module.exports = Telemetry;
