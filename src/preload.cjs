const { contextBridge } = require('electron');
const { ipcRenderer } = require('electron');

const llqqnt_protocol_packet = {
    poke: async (userUin, groupUin) =>{
        return ipcRenderer.invoke('llqqnt_pp_poke', {groupUin, userUin});
    },
    setSpecialTitle: async (groupUin, userUid) =>{
        return ipcRenderer.invoke('llqqnt_pp_setSpecialTitle', {groupUin, userUid});
    },
    ipcOn: (channel, callback) =>{
        ipcRenderer.on(channel, callback);
    },
};
// 在window对象下导出只读对象
const exposeInMainWorld = (key, value) => contextBridge.executeInMainWorld({
    func: key => key in globalThis,
    args: [key]
}) || contextBridge.exposeInMainWorld(key, value);
exposeInMainWorld('llqqnt_pp', llqqnt_protocol_packet);
