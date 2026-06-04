class EntityTracker {
    constructor(bot) {
        this.bot = bot;
        this.entities = new Map();
    }

    update() {
        // Обновляем позиции всех видимых сущностей
        for (const entity of this.bot.entities) {
            if (entity.type === 'player' && entity.username !== this.bot.username) {
                this.entities.set(entity.id, {
                    entity,
                    position: entity.position,
                    velocity: entity.velocity || { x: 0, y: 0, z: 0 }
                });
            }
        }
    }

    getNearestEnemy() {
        let nearest = null;
        let minDist = Infinity;

        for (const [, data] of this.entities) {
            const dist = this.bot.entity.position.distanceTo(data.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = data.entity;
            }
        }

        return nearest;
    }
}

module.exports = EntityTracker;
