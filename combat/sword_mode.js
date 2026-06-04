const BaseCombat = require('./base_combat')

class SwordMode extends BaseCombat {
    constructor(bot, config, movement, anticheat) {
        super(bot, config, movement, anticheat)
        this.name = 'Sword Mode (Classic)'
        this.weaponType = 'sword'
        this.comboTarget = 3
    }

    update(target) {
        super.update(target)
        
        if (!this.isActive || !target) return

        const dist = this.getDistance(target)
        const canSee = this.hasLineOfSight(target)

        // Переключение на меч
        this.manageWeapon()

        // Быстрое движение к цели
        if (dist > 3.5) {
            this.approachTarget(target)
        } else if (dist <= 3.8) {
            this.aggressiveStrafe(target)
            
            // Быстрые атаки
            if (canSee && this.canAttack()) {
                this.performSwordAttack()
            }
        }
    }

    approachTarget(target) {
        this.bot.pathfinder.setGoal(new this.bot.pathfinder.goals.GoalFollow(target, 2.5), true)
        this.bot.setControlState('sprint', true)
    }

    aggressiveStrafe(target) {
        // Более агрессивный стрейф для меча
        const time = Date.now() / 500
        const radius = 2.0
        
        const x = target.position.x + Math.cos(time) * radius
        const z = target.position.z + Math.sin(time) * radius
        
        this.bot.lookAt(target.position.offset(0, 1.6, 0))
        
        // Быстрая смена направлений
        if (Math.sin(time * 2) > 0) {
            this.bot.setControlState('left', true)
            this.bot.setControlState('right', false)
        } else {
            this.bot.setControlState('right', true)
            this.bot.setControlState('left', false)
        }
        
        this.bot.setControlState('forward', true)
    }

    performSwordAttack() {
        // Крит только в начале комбо
        if (this.comboCount % this.comboTarget === 0 && Math.random() < 0.90) {
            this.performCrit()
        }

        // Быстрая атака
        if (this.performAttack()) {
            // W-Tap только каждый второй удар
            if (this.comboCount % 2 === 0 && Math.random() < 0.95) {
                this.performWTap()
            }
            
            console.log(`[SWORD] Attack! Combo: ${this.comboCount}`)
        }
    }

    manageWeapon() {
        const sword = this.bot.inventory.items().find(item => item.name.includes('sword'))
        
        if (sword && (!this.bot.heldItem || !this.bot.heldItem.name.includes('sword'))) {
            this.bot.equip(sword, 'hand')
            console.log('[SWORD] Equipped sword')
        }
    }
}

module.exports = SwordMode
