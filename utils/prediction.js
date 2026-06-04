const vec3 = require('vec3')

class Prediction {
    constructor(bot, config) {
        this.bot = bot
        this.config = config
        this.positionHistory = new Map()
    }

    trackEntity(entity) {
        if (!entity || !entity.id) return
        
        const now = Date.now()
        const history = this.positionHistory.get(entity.id) || []
        
        // Сохраняем последние 10 позиций
        history.push({
            position: entity.position.clone(),
            time: now
        })
        
        if (history.length > 10) {
            history.shift()
        }
        
        this.positionHistory.set(entity.id, history)
    }

    predictPosition(entity, ticksAhead = 3) {
        this.trackEntity(entity)
        
        const history = this.positionHistory.get(entity.id)
        if (!history || history.length < 2) {
            return entity.position
        }

        // Вычисляем среднюю скорость
        const latest = history[history.length - 1]
        const previous = history[Math.max(0, history.length - 3)]
        
        const timeDiff = (latest.time - previous.time) / 1000 // в секундах
        if (timeDiff === 0) return entity.position

        const velocity = vec3(
            (latest.position.x - previous.position.x) / timeDiff,
            (latest.position.y - previous.position.y) / timeDiff,
            (latest.position.z - previous.position.z) / timeDiff
        )

        // Предсказываем позицию через N тиков (1 тик = 50мс)
        const predictionTime = ticksAhead * 0.05
        
        const predictedPosition = vec3(
            entity.position.x + velocity.x * predictionTime,
            entity.position.y + velocity.y * predictionTime,
            entity.position.z + velocity.z * predictionTime
        )

        return predictedPosition
    }

    getVelocity(entity) {
        const history = this.positionHistory.get(entity.id)
        if (!history || history.length < 2) {
            return vec3(0, 0, 0)
        }

        const latest = history[history.length - 1]
        const previous = history[Math.max(0, history.length - 2)]
        
        const timeDiff = (latest.time - previous.time) / 1000
        if (timeDiff === 0) return vec3(0, 0, 0)

        return vec3(
            (latest.position.x - previous.position.x) / timeDiff,
            (latest.position.y - previous.position.y) / timeDiff,
            (latest.position.z - previous.position.z) / timeDiff
        )
    }
}

module.exports = Prediction
