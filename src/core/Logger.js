/**
 * @fileoverview Структурированный логгер с уровнями и цветами. (оригинал сохранён)
 */
class Logger {
    constructor(prefix = 'TIER-ONE') {
        this.prefix = prefix;
        this.colors = {
            reset:   '\x1b[0m',
            red:     '\x1b[31m',
            green:   '\x1b[32m',
            yellow:  '\x1b[33m',
            blue:    '\x1b[34m',
            magenta: '\x1b[35m',
            cyan:    '\x1b[36m',
            gray:    '\x1b[90m'
        };
    }

    _format(level, color) {
        const time = new Date().toLocaleTimeString();
        return `${this.colors.gray}[${time}]${this.colors.reset} ${color}[${level}]${this.colors.reset} ${this.colors.cyan}[${this.prefix}]${this.colors.reset}`;
    }

    info(message, ...args)    { console.log(`${this._format('INFO', this.colors.blue)}`,    message, ...args); }
    success(message, ...args) { console.log(`${this._format('OK',   this.colors.green)}`,   message, ...args); }
    warn(message, ...args)    { console.warn(`${this._format('WARN', this.colors.yellow)}`,  message, ...args); }
    error(message, ...args)   { console.error(`${this._format('ERR', this.colors.red)}`,    message, ...args); }
    combat(message, ...args)  { console.log(`${this._format('PVP',  this.colors.magenta)}`, message, ...args); }

    debug(message, ...args) {
        if (process.env.DEBUG) {
            console.debug(`${this._format('DBG', this.colors.gray)}`, message, ...args);
        }
    }

    ht1(message, ...args) {
        console.log(`${this._format('HT1', '\x1b[38;5;214m')}`, message, ...args);
    }
}

module.exports = new Logger();
