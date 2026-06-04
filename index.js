const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const readline = require('readline');

// --- CORE ---
const EventBus = require('./src/core/EventBus');
const Logger = require('./src/core/Logger');
const ConfigManager = require('./src/core/ConfigManager');

// --- PERCEPTION ---
const WorldState = require('./src/perception/WorldState');
const EntityTracker = require('./src/perception/EntityTracker');
const CombatAnalyzer = require('./src/perception/CombatAnalyzer');

// --- AI ---
const DecisionEngine = require('./src/ai/DecisionEngine');

// --- EXECUTION ---
const CombatExecutor = require('./src/execution/CombatExecutor');
const MovementEngine = require('./src/execution/MovementEngine');
const ItemManager = require('./src/execution/ItemManager');

// --- STRATEGY ---
const StrategyManager = require('./src/strategy/StrategyManager');

// --- METRICS ---
const Telemetry = require('./src/metrics/Telemetry');
const ReplayRecorder = require('./src/metrics/ReplayRecorder');

// ==========================================
// 🎨 STARTUP BANNER
// ==========================================
console.log('\x1b[36m' + `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   ████████╗██╗███████╗██████╗      ██████╗ ███╗   ██╗║
║   ╚══██╔══╝██║██╔════╝██╔══██╗    ██╔═══██╗████╗  ██║║
║      ██║   ██║█████╗  ██████╔╝    ██║   ██║██╔██╗ ██║║
║      ██║   ██║██╔══╝  ██╔══██╗    ██║   ██║██║╚██╗██║║
║      ██║   ██║███████╗██║  ██║    ╚██████╔╝██║ ╚████║║
║      ╚═╝   ╚═╝╚══════╝╚═╝  ╚═╝     ╚═════╝ ╚═╝  ╚═══╝║
║                                                       ║
║          TIER-ONE AI Framework v2.0.0                 ║
║              H1 Level PvP Architecture                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
` + '\x1b[0m');

// ==========================================
// ⚙️ INITIALIZATION
// ==========================================
const config = ConfigManager.load();
Logger.info('Initializing TIER-ONE AI Framework...');

const bot = mineflayer.createBot(config.server);
bot.loadPlugin(pathfinder);

// Initialize all layers
const worldState = new WorldState(bot);
const entityTracker = new EntityTracker(bot);
const combatAnalyzer = new CombatAnalyzer(worldState);
const telemetry = new Telemetry();
const replayRecorder = new ReplayRecorder();

const combatExecutor = new CombatExecutor(bot, worldState);
const movementEngine = new MovementEngine(bot, worldState);
const itemManager = new ItemManager(bot);

const strategyManager = new StrategyManager(combatExecutor, movementEngine, itemManager);
const decisionEngine = new DecisionEngine(worldState, strategyManager, combatAnalyzer);

let isOP = false;

// ==========================================
// 🔌 EVENT SUBSCRIPTIONS
// ==========================================

// Combat events
EventBus.on('COMBAT:TARGET_ACQUIRED', (data) => {
    Logger.combat(`Engaging target: ${data.entity.username}`);
    replayRecorder.startRecording();
});

EventBus.on('COMBAT:TARGET_LOST', (data) => {
    Logger.warn('Target lost. Combat ended.');
    replayRecorder.stopRecording();
    movementEngine.resetControls();
});

EventBus.on('COMBAT:ATTACK_EXECUTED', (data) => {
    telemetry.recordAttack(data);
    replayRecorder.recordEvent('attack', data);
});

EventBus.on('COMBAT:DAMAGE_TAKEN', (data) => {
    telemetry.recordDamage(data);
    Logger.warn(`Took ${data.amount} damage!`);
});

// World updates
EventBus.on('WORLD:TICK_UPDATED', (data) => {
    decisionEngine.tick(data);
});

// ==========================================
// 🎮 MINEFLAYER EVENTS
// ==========================================

bot.on('spawn', () => {
    Logger.success(`Bot spawned. Version: ${bot.version}`);
    
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    defaultMove.canDig = false;
    defaultMove.allow1by1towers = false;
    bot.pathfinder.setMovements(defaultMove);
    
    if (config.op?.autoRequest) {
        setTimeout(() => requestOP(), 2000);
    }
});

bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    
    const args = message.split(' ');
    const command = args[0].toLowerCase();
    
    handleCommand(command, args, username);
});

bot.on('entityHurt', (entity) => {
    if (entity === bot.entity) {
        EventBus.emit('COMBAT:DAMAGE_TAKEN', { 
            entity, 
            amount: 0, // Mineflayer doesn't provide damage amount directly
            health: bot.health 
        });
    }
});

bot.on('error', (err) => Logger.error('Bot error:', err));
bot.on('kicked', (reason) => Logger.warn('Bot kicked:', reason));
bot.on('end', () => {
    Logger.info('Bot disconnected');
    process.exit();
});

// ==========================================
// 🎮 COMMAND HANDLER
// ==========================================

function handleCommand(command, args, username) {
    switch (command) {
        case '!fight':
            if (args[1]) {
                const target = bot.players[args[1]]?.entity;
                if (target) {
                    worldState.setTarget(target);
                    bot.chat(`[AI] Target locked: ${args[1]}`);
                } else {
                    bot.chat('[ERROR] Player not found');
                }
            }
            break;
            
        case '!stop':
            worldState.clearTarget();
            bot.chat('[AI] Combat stopped');
            break;
            
        case '!mode':
            if (args[1] && ['axe', 'sword', 'crystal'].includes(args[1])) {
                strategyManager.setStrategy(args[1]);
                bot.chat(`[AI] Mode switched to: ${args[1]}`);
            }
            break;
            
        case '!creative':
            if (!isOP) {
                bot.chat('[ERROR] Need OP permissions');
                return;
            }
            bot.chat('/gamemode creative');
            setTimeout(() => {
                itemManager.creativeEquip(config.creative?.items || []);
                bot.chat('[AI] Creative gear equipped');
            }, 1000);
            break;
            
        case '!status':
            const stats = telemetry.getStats();
            bot.chat(`[STATUS] HP: ${Math.floor(bot.health)} | Mode: ${strategyManager.currentStrategy} | Attacks: ${stats.totalAttacks}`);
            break;
            
        case '!help':
            bot.chat('[HELP] !fight <player> | !stop | !mode <axe|sword|crystal> | !creative | !status');
            break;
    }
}

function requestOP() {
    Logger.info('Requesting operator permissions...');
    bot.chat('Please grant OP: /op ' + bot.username);
    
    setTimeout(() => {
        if (bot.player?.gamemode === 1) {
            isOP = true;
            Logger.success('OP permissions granted!');
        }
    }, 5000);
}

// ==========================================
// 💻 TERMINAL CONTROL
// ==========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n[TIER-ONE] > '
});

rl.on('line', (input) => {
    const args = input.trim().split(' ');
    const command = args[0].toLowerCase();
    
    switch (command) {
        case 'fight':
            if (args[1]) {
                const target = bot.players[args[1]]?.entity;
                if (target) {
                    worldState.setTarget(target);
                    Logger.combat(`Target acquired: ${args[1]}`);
                }
            }
            break;
            
        case 'stop':
            worldState.clearTarget();
            Logger.info('Combat stopped');
            break;
            
        case 'mode':
            if (args[1]) {
                strategyManager.setStrategy(args[1]);
                Logger.info(`Strategy changed to: ${args[1]}`);
            }
            break;
            
        case 'chat':
            const msg = args.slice(1).join(' ');
            if (msg) bot.chat(msg);
            break;
            
        case 'status':
            const stats = telemetry.getStats();
            Logger.info(`HP: ${Math.floor(bot.health)} | Mode: ${strategyManager.currentStrategy}`);
            Logger.info(`Attacks: ${stats.totalAttacks} | Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
            break;
            
        case 'exit':
        case 'quit':
            Logger.info('Shutting down...');
            bot.quit();
            process.exit(0);
            break;
            
        case 'help':
            Logger.info('Commands: fight <player>, stop, mode <type>, chat <msg>, status, exit');
            break;
    }
    
    rl.prompt();
});

bot.on('spawn', () => {
    Logger.success('Terminal control active. Type "help" for commands.');
    rl.prompt();
});

// ==========================================
// 🔄 MAIN LOOP
// ==========================================

bot.on('physicsTick', () => {
    worldState.update();
    entityTracker.update();
});

Logger.info('TIER-ONE AI Framework initialized');
Logger.info(`Connecting to ${config.server.host}:${config.server.port}...`);
