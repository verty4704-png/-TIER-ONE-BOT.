const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const config = require('./config')

// Боевые модули
const AxeMode = require('./combat/axe_mode')
const SwordMode = require('./combat/sword_mode')
const CrystalMode = require('./combat/crystal_mode')

// Утилиты
const Equipment = require('./utils/equipment')
const Movement = require('./utils/movement')
const Anticheat = require('./utils/anticheat')

console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ████████╗██╗███████╗██████╗      ██████╗ ███╗   ██╗║
║   ╚══██╔══╝██║██╔════╝██╔══██╗    ██╔═══██╗████╗  ██║║
║      ██║   ██║█████╗  ██████╔╝    ██║   ██║██╔██╗ ██║║
║      ██║   ██║██╔══╝  ██╔══██╗    ██║   ██║██║╚██╗██║║
║      ██║   ██║███████╗██║  ██║    ╚██████╔╝██║ ╚████║║
║      ╚═╝   ╚═╝╚══════╝╚═╝  ╚═╝     ╚═════╝ ╚═╝  ╚═══╝║
║                                                       ║
║              H1 Level PvP Bot v1.0.0                  ║
║              For MCTIER Rating System                 ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`)

// Создание бота
const bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: config.server.username,
    version: config.server.version,
    auth: config.server.auth
})

// Загрузка плагинов
bot.loadPlugin(pathfinder)

// Инициализация модулей
const equipment = new Equipment(bot, config.equipment)
const movement = new Movement(bot, config.combat)
const anticheat = new Anticheat(bot, config.combat)

// Боевые режимы
const combatModes = {
    axe: new AxeMode(bot, config.modes.axe, movement, anticheat),
    sword: new SwordMode(bot, config.modes.sword, movement, anticheat),
    crystal: new CrystalMode(bot, config.modes.crystal, movement, anticheat)
}

let currentMode = 'axe'
let target = null
let isOP = false

// --- СОБЫТИЯ ПОДКЛЮЧЕНИЯ ---

bot.on('spawn', () => {
    console.log(`[SYSTEM] Bot spawned. Version: ${bot.version}`)
    
    // Настройка pathfinder
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    defaultMove.canDig = false
    defaultMove.allow1by1towers = false
    bot.pathfinder.setMovements(defaultMove)
    
    // Запрос OP прав
    if (config.op.autoRequest) {
        setTimeout(() => {
            requestOP()
        }, 2000)
    }
})

bot.on('login', () => {
    console.log('[SYSTEM] Bot logged in successfully')
})

// --- ЗАПРОС OP ПРАВ ---

function requestOP() {
    console.log('[OP] Requesting operator permissions...')
    bot.chat(config.op.requestMessage)
    
    // Проверяем через 5 секунд
    setTimeout(() => {
        if (bot.player.gamemode === 1) {
            isOP = true
            console.log('[OP] ✓ Operator permissions granted!')
        } else {
            console.log('[OP] ✗ Still waiting for operator permissions...')
        }
    }, 5000)
}

// --- ОБРАБОТКА ЧАТА ---

bot.on('chat', (username, message) => {
    if (username === bot.username) return

    const args = message.split(' ')
    const command = args[0].toLowerCase()

    switch (command) {
        case '!help':
            showHelp()
            break

        case '!fight':
            if (args[1]) {
                startFight(args[1])
            } else {
                bot.chat('[ERROR] Usage: !fight <player>')
            }
            break

        case '!stop':
            stopFight()
            break

        case '!mode':
            if (args[1]) {
                changeMode(args[1])
            } else {
                bot.chat('[ERROR] Usage: !mode <axe|sword|crystal>')
            }
            break

        case '!creative':
            enableCreative()
            break

        case '!survival':
            enableSurvival()
            break

        case '!equip':
            equipment.autoEquip()
            bot.chat('[EQUIP] Auto-equipping best gear...')
            break

        case '!status':
            showStatus()
            break
    }
})

// --- КОМАНДЫ ---

function showHelp() {
    bot.chat('╔════════════════════════════════════╗')
    bot.chat('║      TIER-ONE BOT Commands         ║')
    bot.chat('╠════════════════════════════════════╣')
    bot.chat('║ !fight <player> - Attack target    ║')
    bot.chat('║ !stop - Stop fighting              ║')
    bot.chat('║ !mode <axe|sword|crystal>          ║')
    bot.chat('║ !creative - Enable creative mode   ║')
    bot.chat('║ !survival - Enable survival mode   ║')
    bot.chat('║ !equip - Auto-equip best gear      ║')
    bot.chat('║ !status - Show bot status          ║')
    bot.chat('║ !help - Show this help             ║')
    bot.chat('╚════════════════════════════════════╝')
}

function startFight(playerName) {
    const player = bot.players[playerName]
    if (!player || !player.entity) {
        bot.chat(`[ERROR] Player ${playerName} not found`)
        return
    }

    target = player.entity
    bot.chat(`[COMBAT] Target locked: ${playerName}`)
    bot.chat(`[MODE] Using ${combatModes[currentMode].name}`)
    
    // Запуск боевого режима
    combatModes[currentMode].start(target)
}

function stopFight() {
    if (target) {
        combatModes[currentMode].stop()
        target = null
        bot.chat('[COMBAT] Fight stopped')
    }
}

function changeMode(mode) {
    const validModes = ['axe', 'sword', 'crystal']
    if (!validModes.includes(mode)) {
        bot.chat('[ERROR] Invalid mode. Use: axe, sword, or crystal')
        return
    }

    // Остановка текущего режима
    if (target) {
        combatModes[currentMode].stop()
    }

    currentMode = mode
    
    // Запуск нового режима
    if (target) {
        combatModes[currentMode].start(target)
    }

    bot.chat(`[MODE] Switched to ${combatModes[currentMode].name}`)
}

function enableCreative() {
    if (!isOP) {
        bot.chat('[ERROR] Need operator permissions first!')
        bot.chat('[HINT] Use: /op TierOneBot in server console')
        return
    }

    bot.chat('/gamemode creative')
    bot.chat('[CREATIVE] Switching to creative mode...')
    
    setTimeout(() => {
        equipment.creativeEquip(config.creative.items)
        bot.chat('[CREATIVE] ✓ Equipped with creative items!')
    }, 1000)
}

function enableSurvival() {
    if (!isOP) {
        bot.chat('[ERROR] Need operator permissions first!')
        return
    }

    bot.chat('/gamemode survival')
    bot.chat('[SURVIVAL] Switching to survival mode...')
}

function showStatus() {
    bot.chat('╔════════════════════════════════════╗')
    bot.chat('║         Bot Status                 ║')
    bot.chat('╠════════════════════════════════════╣')
    bot.chat(`║ Version: ${bot.version}`)
    bot.chat(`║ Mode: ${combatModes[currentMode].name}`)
    bot.chat(`║ Target: ${target ? 'Active' : 'None'}`)
    bot.chat(`║ Health: ${Math.floor(bot.health)}/20`)
    bot.chat(`║ Food: ${Math.floor(bot.food)}/20`)
    bot.chat(`║ OP: ${isOP ? 'Yes' : 'No'}`)
    bot.chat(`║ Gamemode: ${bot.game.gameMode}`)
    bot.chat('╚════════════════════════════════════╝')
}

// --- ГЛАВНЫЙ ЦИКЛ ---

bot.on('physicsTick', () => {
    if (!target || !target.isValid) {
        target = null
        return
    }

    // Обновление текущего боевого режима
    combatModes[currentMode].update(target)
    
    // Авто-еда
    if (config.equipment.autoEat && bot.health < config.equipment.eatThreshold) {
        equipment.eat()
    }
})

// --- ОБРАБОТКА ОШИБОК ---

bot.on('error', (err) => {
    console.error('[ERROR]', err)
})

bot.on('kicked', (reason) => {
    console.log('[KICKED]', reason)
})

bot.on('end', () => {
    console.log('[SYSTEM] Bot disconnected')
    process.exit()
})

console.log('[SYSTEM] Bot starting...')
console.log(`[SYSTEM] Connecting to ${config.server.host}:${config.server.port}`)
