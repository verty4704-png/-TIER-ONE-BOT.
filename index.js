const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const readline = require('readline') // Модуль для управления через терминал
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

// ==========================================
// 🎮 НАСТРОЙКА ТЕРМИНАЛА (READLINE)
// ==========================================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n[TIER-ONE TERMINAL] > '
})

// ==========================================
// ⚙️ СОБЫТИЯ ПОДКЛЮЧЕНИЯ И СПАВНА
// ==========================================

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
        setTimeout(() => requestOP(), 2000)
    }

    // Активируем терминал
    console.log('[TERMINAL] Консоль управления активна. Введите "help" для списка команд.')
    rl.prompt()
})

bot.on('login', () => {
    console.log('[SYSTEM] Bot logged in successfully')
})

function requestOP() {
    console.log('[OP] Requesting operator permissions...')
    bot.chat(config.op.requestMessage)
    setTimeout(() => {
        if (bot.player && bot.player.gamemode === 1) {
            isOP = true
            console.log('[OP] ✓ Operator permissions granted!')
        } else {
            console.log('[OP] ✗ Still waiting for operator permissions... (Use /op ' + bot.username + ' in server console)')
        }
    }, 5000)
}

// ==========================================
// 💬 ОБРАБОТКА ЧАТА В ИГРЕ (Команды с !)
// ==========================================

bot.on('chat', (username, message) => {
    if (username === bot.username) return

    // 🔒 ЗАЩИТА: Раскомментируйте и добавьте свой ник, чтобы бот слушал только вас
    // const ADMINS = ['ВашНик', 'Admin2'] 
    // if (!ADMINS.includes(username)) return

    const args = message.split(' ')
    const command = args[0].toLowerCase()

    switch (command) {
        case '!help': showHelp(); break
        case '!fight': if (args[1]) startFight(args[1]); break
        case '!stop': stopFight(); break
        case '!mode': if (args[1]) changeMode(args[1]); break
        case '!creative': enableCreative(); break
        case '!survival': enableSurvival(); break
        case '!equip': 
            equipment.autoEquip()
            bot.chat('[EQUIP] Auto-equipping best gear...')
            break
        case '!status': showStatus(); break
    }
})

// ==========================================
// 💻 ОБРАБОТКА КОМАНД ТЕРМИНАЛА
// ==========================================

rl.on('line', (input) => {
    const args = input.trim().split(' ')
    const command = args[0].toLowerCase()

    switch (command) {
        case 'help':
            console.log('\n--- Доступные команды терминала ---')
            console.log('fight <ник>  - Атаковать игрока')
            console.log('stop         - Остановить бой')
            console.log('mode <тип>   - Сменить режим (axe/sword/crystal)')
            console.log('creative     - Включить креатив (нужен OP)')
            console.log('survival     - Включить выживание')
            console.log('equip        - Надеть лучшую броню')
            console.log('chat <текст> - Написать сообщение в чат игры')
            console.log('status       - Показать статус бота')
            console.log('exit / quit  - Отключить бота')
            console.log('-----------------------------------\n')
            break

        case 'fight':
            if (args[1]) startFight(args[1])
            else console.log('[TERMINAL] Укажите ник: fight <ник>')
            break

        case 'stop':
            stopFight()
            break

        case 'mode':
            if (args[1]) changeMode(args[1])
            else console.log('[TERMINAL] Укажите режим: mode <axe|sword|crystal>')
            break

        case 'creative':
            enableCreative()
            break

        case 'survival':
            enableSurvival()
            break

        case 'equip':
            equipment.autoEquip()
            console.log('[TERMINAL] Экипировка обновлена.')
            break

        case 'chat':
            const chatMessage = args.slice(1).join(' ')
            if (chatMessage) {
                bot.chat(chatMessage)
                console.log(`[TERMINAL] Отправлено в чат: ${chatMessage}`)
            }
            break

        case 'status':
            showConsoleStatus()
            break

        case 'exit':
        case 'quit':
            console.log('[SYSTEM] Отключение бота...')
            bot.quit()
            process.exit(0)
            break

        default:
            if (command !== '') console.log('[TERMINAL] Неизвестная команда. Введите "help".')
    }
    
    rl.prompt() // Возвращаем строку ввода
})

// ==========================================
// 🛠️ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (Общие для чата и терминала)
// ==========================================

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
    bot.chat('╚════════════════════════════════════╝')
}

function startFight(playerName) {
    const player = bot.players[playerName]
    if (!player || !player.entity) {
        const msg = `[ERROR] Player ${playerName} not found or not in render distance`
        bot.chat(msg)
        console.log(`[TERMINAL] ${msg}`)
        return
    }

    target = player.entity
    combatModes[currentMode].start(target)
    
    const msg = `[COMBAT] Target locked: ${playerName} | Mode: ${currentMode}`
    bot.chat(msg)
    console.log(`[TERMINAL] ${msg}`)
}

function stopFight() {
    if (target) {
        combatModes[currentMode].stop()
        target = null
        bot.chat('[COMBAT] Fight stopped')
        console.log('[TERMINAL] Fight stopped')
    }
}

function changeMode(mode) {
    const validModes = ['axe', 'sword', 'crystal']
    if (!validModes.includes(mode)) {
        const msg = '[ERROR] Invalid mode. Use: axe, sword, or crystal'
        bot.chat(msg)
        console.log(`[TERMINAL] ${msg}`)
        return
    }

    if (target) combatModes[currentMode].stop()
    currentMode = mode
    if (target) combatModes[currentMode].start(target)

    const msg = `[MODE] Switched to ${combatModes[currentMode].name}`
    bot.chat(msg)
    console.log(`[TERMINAL] ${msg}`)
}

function enableCreative() {
    if (!isOP) {
        const msg = '[ERROR] Need OP! Use: /op ' + bot.username + ' in server console'
        bot.chat(msg)
        console.log(`[TERMINAL] ${msg}`)
        return
    }

    bot.chat('/gamemode creative')
    console.log('[TERMINAL] Switching to creative mode...')
    
    setTimeout(() => {
        equipment.creativeEquip(config.creative.items)
        bot.chat('[CREATIVE] ✓ Equipped!')
        console.log('[TERMINAL] Creative items given.')
    }, 1000)
}

function enableSurvival() {
    if (!isOP) {
        bot.chat('[ERROR] Need OP!')
        return
    }
    bot.chat('/gamemode survival')
    console.log('[TERMINAL] Switching to survival mode...')
}

function showStatus() {
    bot.chat(`[STATUS] HP: ${Math.floor(bot.health)} | Food: ${Math.floor(bot.food)} | Mode: ${currentMode} | Target: ${target ? 'Active' : 'None'}`)
}

function showConsoleStatus() {
    console.log('\n--- BOT STATUS ---')
    console.log(`Version:  ${bot.version}`)
    console.log(`Mode:     ${combatModes[currentMode].name}`)
    console.log(`Target:   ${target ? 'Active' : 'None'}`)
    console.log(`Health:   ${Math.floor(bot.health)}/20`)
    console.log(`Food:     ${Math.floor(bot.food)}/20`)
    console.log(`OP:       ${isOP ? 'Yes' : 'No'}`)
    console.log(`Gamemode: ${bot.game ? bot.game.gameMode : 'Unknown'}`)
    console.log('------------------\n')
}

// ==========================================
// 🔄 ГЛАВНЫЙ ЦИКЛ БОЯ (Physics Tick)
// ==========================================

bot.on('physicsTick', () => {
    if (!target || !target.isValid) {
        if (target) {
            combatModes[currentMode].stop()
            target = null
        }
        return
    }

    combatModes[currentMode].update(target)
    
    if (config.equipment.autoEat && bot.health < config.equipment.eatThreshold) {
        equipment.eat()
    }
})

// ==========================================
// ❌ ОБРАБОТКА ОШИБОК И ОТКЛЮЧЕНИЯ
// ==========================================

bot.on('error', (err) => console.error('[ERROR]', err))
bot.on('kicked', (reason) => console.log('[KICKED]', reason))
bot.on('end', () => {
    console.log('[SYSTEM] Bot disconnected')
    rl.close()
    process.exit()
})

console.log('[SYSTEM] Bot starting...')
console.log(`[SYSTEM] Connecting to ${config.server.host}:${config.server.port}`)
