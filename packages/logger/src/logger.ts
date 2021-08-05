import { colors } from "./colors";

export type LogLevel = "info" | "debug" | "trace" | "warn" | "error";

export type ILoggerWithSignature = {
    [key in LogLevel]: (message: string, ...optionalParams: unknown[]) => void;
};

export interface ILogInfo<L extends string = LogLevel> {
    level: L;
    name: string;
    message: string;
    args: unknown[];
    children: ILogInfo[];
}

export interface ILogger extends ILoggerWithSignature {
    log<L extends string = LogLevel>(
        level: L,
        message: string,
        ...args: unknown[]
    ): void;
}

export const createLogger = (
    base: ILogger,
    messageHook?: (level: string, msg: string) => string
): ILogger => {
    const log =
        (level: string) =>
        (message: string, ...args: unknown[]) => {
            let msg = message;
            if (messageHook) msg = messageHook(level, msg);

            base[level](msg, ...args);
        };
    return {
        log: log("log"),
        info: log("info"),
        debug: log("debug"),
        error: log("error"),
        trace: log("trace"),
        warn: log("warn")
    };
};

export const createConsoleLogger = () => createLogger(console);

export const createColoredLogger = (base: ILogger) =>
    createLogger(base, (level, msg) => {
        const format = (color: string) =>
            `[${color}${level}${colors.reset}] ${msg}`;

        switch (level) {
            default:
                return format(colors.fg.green);
            case "debug":
                return format(colors.fg.blue);
            case "trace":
                return format(colors.fg.magenta);
            case "error":
                return format(colors.fg.red);
            case "warn":
                return format(colors.fg.yellow);
        }
    });
