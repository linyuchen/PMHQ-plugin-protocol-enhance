export default class Logger {
    options: Record<string, any>;
    constructor(opts?: Record<string, any>);
    levelTextFromInt: (level: any) => string;
    log: (...args: Array<any>) => any;
    error: (...args: Array<any>) => void;
}
