module.exports = {
    server: {
        host: 'localhost',
        port: 25565,
        username: 'TierOneBot',
        version: 'auto', // Автоопределение версии
        auth: 'offline'  // 'microsoft' для лицензионного аккаунта
    },

    combat: {
        // Общие настройки
        reach: 3.8,              // Максимальная дистанция удара
        attackCooldown: 400,     // Минимальное время между атаками (мс)
        
        // W-Tap настройки
        wTapDelayMin: 30,
        wTapDelayMax: 60,
        wTapChance: 0.95,
        
        // Криты
        critChance: 0.90,
        critJumpDelay: 100,
        
        // Страфинг
        strafeSpeed: 0.8,
        strafeRadius: 2.5,
        strafeChangeInterval: 1500,
        
        // Предсказание
        predictionTicks: 3,      // Предсказание на 3 тика вперед
        
        // Античит
        humanizeMovement: true,
        randomizeTiming: true,
        microMovements: true
    },

    modes: {
        axe: {
            name: 'Axe Mode (Swight Style)',
            weapon: 'axe',
            priority: ['shield_break', 'crit', 'combo'],
            switchThreshold: 2,  // Переключаться на топор если у врага щит
            damageMultiplier: 1.5
        },
        sword: {
            name: 'Sword Mode (Classic)',
            weapon: 'sword',
            priority: ['speed', 'combo', 'reach'],
            attackSpeed: 1.6,
            comboLength: 3
        },
        crystal: {
            name: 'Crystal Mode',
            weapon: 'crystal',
            priority: ['placement', 'detonation', 'positioning'],
            crystalRange: 5.0,
            anchorRange: 4.0
        }
    },

    equipment: {
        autoEquip: true,
        priority: {
            helmet: ['netherite', 'diamond', 'iron'],
            chestplate: ['netherite', 'diamond', 'iron'],
            leggings: ['netherite', 'diamond', 'iron'],
            boots: ['netherite', 'diamond', 'iron'],
            weapon: ['netherite', 'diamond', 'iron']
        },
        autoEat: true,
        eatThreshold: 15 // Ест когда HP < 15
    },

    op: {
        autoRequest: true,
        requestMessage: 'Please grant me operator permissions: /op TierOneBot'
    },

    creative: {
        enabled: true,
        autoEquipOnCreative: true,
        items: [
            'netherite_sword',
            'netherite_axe',
            'netherite_helmet',
            'netherite_chestplate',
            'netherite_leggings',
            'netherite_boots',
            'golden_apple',
            'ender_pearl',
            'end_crystal'
        ]
    }
}
