/**
 * Interface for a logger
 */
export interface ILogger {
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    success?(message: string, ...args: unknown[]): void;
    log?(message: string, ...args: unknown[]): void;
}

/**
 * ANSI color codes for terminal output
 */
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    bold: '\x1b[1m',
};

/**
 * CLI Logger for formatted console output
 */
export class Logger implements ILogger {
    private verbose: boolean;

    constructor(verbose: boolean = false) {
        this.verbose = verbose;
    }

    public error(message: string, ...args: unknown[]): void {
        console.error(`${colors.red}✗${colors.reset} ${message}`, ...args);
    }

    public warn(message: string, ...args: unknown[]): void {
        console.warn(`${colors.yellow}⚠${colors.reset} ${message}`, ...args);
    }

    public info(message: string, ...args: unknown[]): void {
        console.log(`${colors.blue}ℹ${colors.reset} ${message}`, ...args);
    }

    public success(message: string, ...args: unknown[]): void {
        console.log(`${colors.green}✓${colors.reset} ${message}`, ...args);
    }

    public debug(message: string, ...args: unknown[]): void {
        if (this.verbose) {
            console.log(`${colors.gray}[DEBUG]${colors.reset} ${message}`, ...args);
        }
    }

    public log(message: string, ...args: unknown[]): void {
        console.log(message, ...args);
    }

    public header(message: string): void {
        console.log(`\n${colors.bold}${colors.cyan}${message}${colors.reset}\n`);
    }

    public divider(): void {
        console.log(colors.gray + '─'.repeat(60) + colors.reset);
    }

    public newline(): void {
        console.log();
    }

    public static color(text: string, color: keyof typeof colors): string {
        return `${colors[color]}${text}${colors.reset}`;
    }

    public static bold(text: string): string {
        return `${colors.bold}${text}${colors.reset}`;
    }

    public static path(filePath: string): string {
        return `${colors.cyan}${filePath}${colors.reset}`;
    }

    public static symbol(symbolName: string): string {
        return `${colors.magenta}${symbolName}${colors.reset}`;
    }

    public static hash(hash: string, length: number = 8): string {
        return `${colors.gray}${hash.substring(0, length)}${colors.reset}`;
    }

    public getVerbose(): boolean {
        return this.verbose;
    }

    public banner(text: string): void {
        const width = 60;
        const padding = Math.max(0, Math.floor((width - text.length - 2) / 2));
        const line = '═'.repeat(width);

        console.log(`${colors.cyan}${colors.bold}`);
        console.log(`╔${line}╗`);
        console.log(`║${' '.repeat(padding)}${text}${' '.repeat(width - padding - text.length)}║`);
        console.log(`╚${line}╝`);
        console.log(colors.reset);
    }

    public box(title: string, content: string[]): void {
        const maxLength = Math.max(
            title.length,
            // eslint-disable-next-line no-control-regex
            ...content.map((line) => line.replace(/\x1b\[[0-9;]*m/g, '').length),
        );
        const width = Math.min(maxLength + 4, 70);

        console.log(`${colors.cyan}┌${'─'.repeat(width)}┐${colors.reset}`);
        console.log(
            `${colors.cyan}│${colors.reset} ${colors.bold}${title}${colors.reset}${' '.repeat(width - title.length - 1)}${colors.cyan}│${colors.reset}`,
        );
        console.log(`${colors.cyan}├${'─'.repeat(width)}┤${colors.reset}`);

        content.forEach((line) => {
            // eslint-disable-next-line no-control-regex
            const stripped = line.replace(/\x1b\[[0-9;]*m/g, '');
            const padding = width - stripped.length - 1;
            console.log(
                `${colors.cyan}│${colors.reset} ${line}${' '.repeat(padding)}${colors.cyan}│${colors.reset}`,
            );
        });

        console.log(`${colors.cyan}└${'─'.repeat(width)}┘${colors.reset}`);
    }

    public step(stepNumber: number, totalSteps: number, title: string, emoji: string = '▶'): void {
        console.log();
        console.log(
            `${colors.bold}${colors.cyan}${emoji} Step ${stepNumber}/${totalSteps}: ${colors.reset}${colors.bold}${title}${colors.reset}`,
        );
        console.log();
    }

    public listItem(text: string, checked: boolean = false): void {
        const icon = checked ? `${colors.green}✓${colors.reset}` : `${colors.gray}○${colors.reset}`;
        console.log(`  ${icon} ${text}`);
    }
}
