const BaseCombat = require('./base_combat')
const vec3 = require('vec3')

class AxeMode extends BaseCombat {
    constructor(bot, config, movement, anticheat) {
        super(bot, config, movement, anticheat)
        this.name = 'Axe Mode (Swight Style)'
        this.weaponType = 'axe'
        this.lastStrafeChange = 0
        this.strafeDirection = 1
    }

    update(target) {
        super.update(target)
        
        if (!this.isActive || !target) return

        const dist = this.getDistance(target)
        const canSee = this.hasLineOfSight(target)

        // Переключение на топор если у врага щит
        this.manageWeapon(target)

        // Движение к цели
        if (dist > 4.0) {
            this.approachTarget(target)
        } else if (dist <= 3.8) {
            this.strafeTarget(target)
            
            // Атака
            if (canSee && this.canAttack()) {
                this.performAxeAttack()
            }
        }
    }

    approachTarget(target) {
        this.bot.pathfinder.setGoal(new this.bot.pathfinder.goals.GoalFollow(target, 3), true)
        this.bot.setControlState('sprint', true)
    }

    strafeTarget(target) {
        const now = Date.now()
        
        // Смена направления стрейфа каждые 1.5 секунды
        if (now - this.lastStrafeChange > 1500) {
            this.strafeDirection *= -1
            this.lastStrafeChange = now
        }

        const angle = Date.now() / 800
        const radius = 2.5
        
        const x = target.position.x + Math.cos(angle) * radius
        const z = target.position.z + Math.sin(angle) * radius
        
        this.bot.lookAt(target.position.offset(0, 1.6, 0))
        
        // Движение по кругу
        const strafeKey = this.strafeDirection > 0 ? 'left' : 'right'
        this.bot.setControlState(strafeKey, true)
        this.bot.setControlState('forward', true)
    }

    performAxeAttack() {
        // Критический удар (95% шанс)
        if (Math.random() < 0.95) {
            this.performCrit()
        }

        // Атака
        if (this.performAttack()) {
            // W-Tap после удара
            if (Math.random() < 0.95) {
                this.performWTap()
            }
            
            console.log(`[AXE] Attack! Combo: ${this.comboCount}`)
        }
    }

    manageWeapon(target) {
        // Проверяем, есть ли у нас топор
        const axe = this.bot.inventory.items().find(item => 
            item.name.includes('axe') && !item.name.includes('pickaxe')
        )
        
        if (axe && (!this.bot.heldItem || !this.bot.heldItem.name.includes('axe'))) {
            this.bot.equip(axe, 'hand')
            console.log('[AXE] Equipped axe')
        }
    }
}

module.exports = AxeMode
