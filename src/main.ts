
// import prompt from 'custom-electron-prompt'
import PromptManager from "./electron-prompts/src/index"
const prompts = new PromptManager({width: 400})

import {BrowserWindow, ipcMain} from 'electron';
import {PromptTemplate} from "./electron-prompts/src/types";
import {PBApi} from "./pb/api";

const api = new PBApi()

interface PokeParams{
    groupUin: string;
    userUin: string;
}

interface SpecialTitleParams{
    groupUin: string;
    userUid: string;
}

ipcMain.handle('llqqnt_pp_poke', async (event: any, {groupUin, userUin}: PokeParams) => {
    console.log('llqqnt_pp_poke called', userUin, groupUin);
    try {
        if (groupUin) {
            api.sendGroupPoke(+groupUin, +userUin);
        } else {
            api.sendFriendPoke(+userUin);
        }
    }catch (e) {
        console.log('llqqnt_pp_poke error', e);
    }
});

ipcMain.handle('llqqnt_pp_setSpecialTitle', async (event: any, {groupUin, userUid}: SpecialTitleParams) => {
    // let prompt = require('electron-osx-prompt');
    // const title = await prompt('设置头衔', '');
    const pTemplate: PromptTemplate = {
        windowTitle: "",
        cancelButton: {
            classes: ["btn", "btn-secondary"],
        },
        elements: [
            {
                type: "header",
                value: "设置头衔",
            },
            {
                type: "input",
                name: "title",
                placeholder: "",
                value: "",
                classes: ["form-control"],
            },
        ],
        buttons: [
            {
                name: "submit",
                value: "确定",
                classes: ["btn", "btn-primary"],
            },
        ],
    }

    const title = (await prompts.spawn(pTemplate))?.values.title;

    // console.log('llqqnt_pp_setSpecialTitle called', groupUin, userUid, title);
    if (title){
        api.setSpecialTitle(+groupUin, userUid, title);
    }
});

export function onBrowserWindowCreated(window: BrowserWindow) {
    // console.log('[PMHQ PE] plugin: onBrowserWindowCreated', window.id);
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach((window) => {
        if (!window.isDestroyed()) {
            window.webContents.send('llqqnt_pp_create_window', {windowId: window.id});
        }
    });
}