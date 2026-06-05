const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const readline = require('readline');

// ── CORE ─────────────────────────────────────────────────────
const EventBus       = require('./src/core/EventBus');
const Logger         = require('./src/core/Logger');
const ConfigManager  = require('./src/core/ConfigManager');

// ── PERCEPTION ───────────────────────────────────────────────
const WorldState     = require('./src/perception/WorldState');
const EntityTracker  = require('./src/perception/EntityTracker');
const CombatAnalyzer = require('./src/perception/CombatAnalyzer');

// ── AI ───────────────────────────────────────────────────────
const DecisionEngine      = require('./src/ai/DecisionEngine');
const CombatHistoryStore  = require('./src/ai/CombatHistoryStore');

// ── EXECUTION ────────────────────────────────────────────────
const CombatExecutor = require('./src/execution/CombatExecutor');
const MovementEngine = require('./src/execution/MovementEngine');
const ItemManager    = require('./src/execution/ItemManager');

// ── STRATEGY ─────────────────────────────────────────────────
const StrategyManager = require('./src/strategy/StrategyManager');

// ── METRICS ──────────────────────────────────────────────────
const Telemetry       = require('./src/metrics/Telemetry');
const ReplayRecorder  = require('./src/metrics/ReplayRecorder');

// ═══════════════════════════════════════════════════════════════
// 🎨 STARTUP BANNER
// ═══════════════════════════════════════════════════════════════
console.log('\x1b[38;5;214m' + `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ████████╗██╗███████╗██████╗      ██████╗ ███╗   ██╗       ║
║   ╚══██╔══╝██║██╔════╝██╔══██╗    ██╔═══██╗████╗  ██║       ║
║      ██║   ██║█████╗  ██████╔╝    ██║   ██║██╔██╗ ██║       ║
║      ██║   ██║██╔══╝  ██╔══██╗    ██║   ██║██║╚██╗██║       ║
║      ██║   ██║███████╗██║  ██║    ╚██████╔╝██║ ╚████║       ║
║      ╚═╝   ╚═╝╚══════╝╚═╝  ╚═╝     ╚═════╝ ╚═╝  ╚═══╝       ║
║                                                              ║
║           TIER-ONE AI Framework  ▸  MCTier HT1              ║
║     Adaptive Learning · Advanced Prediction · HT1 Combat    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
` + '\x1b[0m');

// ═══════════════════════════════════════════════════════════════
// ⚙️  INITIALIZATION
// ═══════════════════════════════════════════════════════════════
const config = ConfigManager.load();
Logger.info('Initializing TIER-ONE HT1 Framework...');

const bot = mineflayer.createBot(config.server);
bot.loadPlugin(pathfinder);

// ── Perception layer ─────────────────────────────────────────
const worldState     = new WorldState(bot);
const entityTracker  = new EntityTracker(bot);
const combatAnalyzer = new CombatAnalyzer(worldState);

// ── Metrics ──────────────────────────────────────────────────
const telemetry      = new Telemetry();          // само подписывается на EventBus
const replayRecorder = new ReplayRecorder();
const historyStore   = new CombatHistoryStore();

// ── Execution layer ──────────────────────────────────────────
const combatExecutor = new CombatExecutor(bot, worldState);
const movementEngine = new MovementEngine(bot, worldState);
const itemManager    = new ItemManager(bot);

// ── Strategy + Decision ──────────────────────────────────────
const strategyManager = new StrategyManager(combatExecutor, movementEngine, itemManager, worldState);
const decisionEngine  = new DecisionEngine(worldState, strategyManager, combatAnalyzer, historyStore);

// Установить начальную стратегию из конфига
const defaultStrategy = config.ht1?.defaultStrategy ?? 'balanced';
strategyManager.setStrategy(defaultStrategy);

let isOP         = false;
let fightStartHP = 20;

// ═══════════════════════════════════════════════════════════════
// 🔌 EVENT SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════

EventBus.on('COMBAT:TARGET_ACQUIRED', (data) => {
    Logger.combat(`Engaging: ${data.entity.username}`);
    fightStartHP = bot.health ?? 20;
    historyStore.startFight(itemManager.getCurrentWeaponType());
    replayRecorder.startRecording(itemManager.getCurrentWeaponType());
    movementEngine.startDynamicStrafe();
});

EventBus.on('COMBAT:TARGET_LOST', (data) => {
    Logger.warn('Target lost. Combat ended.');
    const result = 'draw'; // обновляется при смерти врага / нашей смерти
    historyStore.endFight(result, bot.health ?? 20);
    replayRecorder.stopRecording(result);
    movementEngine.resetControls();
    movementEngine.stopDynamicStrafe();
    combatExecutor.stopComboExtend();
    combatExecutor.resetCombo();
    telemetry.flushCombo();
    EventBus.emit('METRICS:FIGHT_ENDED', {
        result,
        finalHealth: bot.health ?? 20,
        durationMs: Date.now() - (historyStore._current?.timestamp ?? Date.now())
    });
});

EventBus.on('COMBAT:ATTACK_EXECUTED', (data) => {
    replayRecorder.recordEvent('attack', data);
    historyStore.updateCurrent({ attacks: (historyStore.getCurrent()?.attacks ?? 0) + 1 });
});

EventBus.on('COMBAT:DAMAGE_TAKEN', (data) => {
    Logger.warn(`Damage taken! HP: ${Math.floor(bot.health ?? 0)}`);
    historyStore.updateCurrent({ damageTaken: (historyStore.getCurrent()?.damageTaken ?? 0) + (data.amount ?? 0) });

    // Авто-переключение стратегии по HP
    if (config.ht1?.autoStrategySwitch?.enabled) {
        const hp = bot.health ?? 20;
        if (hp < (config.ht1.autoStrategySwitch.lowHP ?? 8)) {
            strategyManager.setStrategy('defensive');
        } else if (hp < (config.ht1.autoStrategySwitch.midHP ?? 14)) {
            if (strategyManager.currentStrategy === 'aggressive') {
                strategyManager.setStrategy('balanced');
            }
        }
    }
});

EventBus.on('COMBAT:COMBO_UPDATED', (data) => {
    historyStore.updateCurrent({ comboLengths: [...(historyStore.getCurrent()?.comboLengths ?? []), data.count] });
});

EventBus.on('WORLD:TICK_UPDATED', (data) => {
    decisionEngine.tick(data);
});

EventBus.on('AI:WEIGHTS_UPDATED', (data) => {
    Logger.ht1(`[Adaptive] New weights: attack=${data.weights.attackBase.toFixed(2)} combo=${data.weights.comboExtension.toFixed(2)}`);
});

EventBus.on('STRATEGY:CHANGED', (data) => {
    Logger.ht1(`[Strategy] Changed to: ${data.strategy}`);
});

// ═══════════════════════════════════════════════════════════════
// 🎮 MINEFLAYER EVENTS
// ═══════════════════════════════════════════════════════════════

bot.on('spawn', () => {
    Logger.success(`Spawned. Version: ${bot.version}`);

    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    defaultMove.canDig = false;
    defaultMove.allow1by1towers = false;
    bot.pathfinder.setMovements(defaultMove);

    if (config.op?.autoRequest) {
        setTimeout(() => requestOP(), 2000);
    }

    Logger.ht1(`HT1 ready. Strategy: ${strategyManager.getStrategyName()}`);
    rl.prompt();
});

bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    const args    = message.split(' ');
    const command = args[0].toLowerCase();
    handleChatCommand(command, args, username);
});

bot.on('entityHurt', (entity) => {
    if (entity === bot.entity) {
        EventBus.emit('COMBAT:DAMAGE_TAKEN', { entity, amount: 0, health: bot.health });
    }
});

bot.on('death', () => {
    Logger.warn('Bot died.');
    if (worldState.isInCombat) {
        historyStore.endFight('loss', 0);
        replayRecorder.stopRecording('loss');
        EventBus.emit('METRICS:FIGHT_ENDED', { result: 'loss', finalHealth: 0, durationMs: 0 });
        worldState.clearTarget();
    }
});

bot.on('error',  (err)    => Logger.error('Bot error:', err));
bot.on('kicked', (reason) => Logger.warn('Kicked:', reason));
bot.on('end',    ()       => { Logger.info('Disconnected'); process.exit(); });

// ═══════════════════════════════════════════════════════════════
// 🎮 COMMAND HANDLERS
// ═══════════════════════════════════════════════════════════════

function handleChatCommand(command, args, username) {
    switch (command) {
        case '!fight': {
            const target = bot.players[args[1]]?.entity;
            if (target) {
                worldState.setTarget(target);
                bot.chat(`[HT1] Target: ${args[1]}`);
            } else {
                bot.chat('[ERR] Player not found');
            }
            break;
        }
        case '!stop':
            worldState.clearTarget();
            bot.chat('[HT1] Combat stopped');
            break;

        case '!mode':
        case '!strategy': {
            const name = args[1]?.toLowerCase();
            if (name && StrategyManager.availableStrategies().includes(name)) {
                strategyManager.setStrategy(name);
                bot.chat(`[HT1] Strategy: ${strategyManager.getStrategyName()}`);
            } else {
                bot.chat(`[HT1] Strategies: ${StrategyManager.availableStrategies().join(', ')}`);
            }
            break;
        }
        case '!aim': {
            const profiles = ['aggressive','balanced','defensive','nervous','smooth'];
            const p = args[1]?.toLowerCase();
            if (p && profiles.includes(p)) {
                worldState.setAimProfile(p);
                bot.chat(`[HT1] Aim profile: ${p}`);
            }
            break;
        }
        case '!creative':
            if (!isOP) { bot.chat('[ERR] Need OP'); return; }
            bot.chat('/gamemode creative');
            setTimeout(() => { itemManager.creativeEquip(config.creative?.items ?? []); }, 1000);
            break;

        case '!status': {
            const s = telemetry.formatStatus(bot.health, strategyManager.getStrategyName());
            bot.chat(s);
            break;
        }
        case '!learn': {
            const info = decisionEngine.learner.getLastAdaptInfo();
            if (info) {
                bot.chat(`[AdaptiveLearner] win:${(info.stats.winRate*100).toFixed(0)}% acc:${(info.stats.avgAccuracy*100).toFixed(0)}%`);
            } else {
                bot.chat('[AdaptiveLearner] Not enough data yet (need 5+ fights)');
            }
            break;
        }
        case '!help':
            bot.chat('[HT1] !fight <p> | !stop | !strategy <name> | !aim <profile> | !status | !learn | !creative');
            break;
    }
}

function handleTerminalCommand(command, args) {
    switch (command) {
        case 'fight': {
            const target = bot.players[args[1]]?.entity;
            if (target) { worldState.setTarget(target); Logger.combat(`Target: ${args[1]}`); }
            else Logger.warn('Player not found');
            break;
        }
        case 'stop':
            worldState.clearTarget();
            Logger.info('Combat stopped');
            break;

        case 'strategy':
        case 'mode': {
            const name = args[1]?.toLowerCase();
            if (name && StrategyManager.availableStrategies().includes(name)) {
                strategyManager.setStrategy(name);
            } else {
                Logger.info(`Available: ${StrategyManager.availableStrategies().join(', ')}`);
            }
            break;
        }
        case 'aim': {
            if (args[1]) worldState.setAimProfile(args[1]);
            break;
        }
        case 'status': {
            const s = telemetry.getStats();
            Logger.info(`HP:${Math.floor(bot.health)} | ${strategyManager.getStrategyName()}`);
            Logger.info(`Acc:${s.accuracy}% CPS:${s.cps} Combo:${s.comboCurrent}(max ${s.comboMax})`);
            Logger.info(`DmgEff:${s.damageEfficiency} Survival:${s.survivalScore} WinRate:${s.winRate}%`);
            Logger.info(`Fights:${s.fightCount} W:${s.wins} L:${s.losses}`);
            break;
        }
        case 'learn': {
            const info = decisionEngine.learner.getLastAdaptInfo();
            if (info) {
                Logger.ht1(`Last adapt: win=${(info.stats.winRate*100).toFixed(0)}% acc=${(info.stats.avgAccuracy*100).toFixed(0)}% combo=${info.stats.avgCombo.toFixed(1)}`);
                Logger.ht1(`Weights: attack=${info.weights.attackBase.toFixed(2)} crit=${info.weights.critBonus.toFixed(2)} combo=${info.weights.comboExtension.toFixed(2)}`);
            } else {
                Logger.info('No adaptation data yet (need 5+ fights)');
            }
            break;
        }
        case 'chat': {
            const msg = args.slice(1).join(' ');
            if (msg) bot.chat(msg);
            break;
        }
        case 'exit':
        case 'quit':
            Logger.info('Shutting down...');
            bot.quit();
            process.exit(0);
            break;

        case 'help':
            Logger.info('Commands: fight <p> | stop | strategy <name> | aim <profile> | status | learn | chat <msg> | exit');
            Logger.info(`Strategies: ${StrategyManager.availableStrategies().join(', ')}`);
            Logger.info('Aim profiles: aggressive | balanced | defensive | nervous | smooth');
            break;
    }
}

function requestOP() {
    Logger.info('Requesting OP...');
    bot.chat('Please grant OP: /op ' + bot.username);
    setTimeout(() => {
        if (bot.player?.gamemode === 1) { isOP = true; Logger.success('OP granted!'); }
    }, 5000);
}

// ═══════════════════════════════════════════════════════════════
// 💻 TERMINAL CONTROL
// ═══════════════════════════════════════════════════════════════

const rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
    prompt: '\n\x1b[38;5;214m[HT1]\x1b[0m > '
});

rl.on('line', (input) => {
    const args    = input.trim().split(' ');
    const command = args[0].toLowerCase();
    if (command) handleTerminalCommand(command, args);
    rl.prompt();
});

// ═══════════════════════════════════════════════════════════════
// 🔄 MAIN LOOP
// ═══════════════════════════════════════════════════════════════

bot.on('physicsTick', () => {
    worldState.update();
    entityTracker.update();
});

Logger.info('TIER-ONE HT1 Framework initialized');
Logger.info(`Connecting to ${config.server.host}:${config.server.port}...`);
