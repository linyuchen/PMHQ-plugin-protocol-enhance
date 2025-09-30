import { BrowserWindow } from "electron";
import Logger from "./logger.js";
import { PromptManagerOptions, PromptResult, PromptTemplate } from "./types.js";
export default class PromptManager {
    adoptablePrompts: Record<string, PromptTemplate>;
    windows: Record<string, BrowserWindow>;
    logs: Logger;
    options: PromptManagerOptions;
    events: any;
    /**
     * `PromptManager` class
     * ----
     * [github.io docs ⧉](https://pbxx.github.io/electron-prompts/docs/api/class/prompt-manager/)
     *
     * Orchestrates all spawning of prompts and returning of changed data.
     * ***
     * @param opts
     * @returns the PromptManager class
     */
    constructor(opts?: PromptManagerOptions);
    handlers: {
        adopt: () => Promise<PromptTemplate>;
        sizeUp: (event: any, id: string, amount: number) => Promise<void>;
        formDone: (event: any, id: string, data: PromptResult) => Promise<void>;
        cancel: (event: any, id: string) => Promise<void>;
    };
    /**
     * `spawn` method (async)
     * ----
     * [github.io docs ⧉](https://pbxx.github.io/electron-prompts/docs/api/class/prompt-manager/spawn)
     *
     * Spawns a prompt window given a passed `PromptTemplate`
     * ***
     * @param opts The `PromptTemplate` to use for creating prompt.
     * @returns A `PromptResult` object if user completes, `null` if not.
     *
     */
    spawn: (opts: PromptTemplate) => Promise<PromptResult | null>;
}
