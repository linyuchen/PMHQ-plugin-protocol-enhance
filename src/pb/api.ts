// copy from LLOneBot/LLOneBot
import {Oidb} from "./compiled";

export class PBApi {
  sendPB(cmd: string, pb: Uint8Array) {
    // console.log('发送pb');
    global.PMHQ.sendPB(cmd, Buffer.from(pb).toString('hex'))
  }

  sendFriendPoke(uin: number) {
    const body = Oidb.SendPoke.encode({
      toUin: uin,
      friendUin: uin,
    }).finish()
    const data = Oidb.Base.encode({
      command: 0xed3,
      subCommand: 1,
      body,
    }).finish()
    // console.log('friend poke pb data', data)
    this.sendPB('OidbSvcTrpcTcp.0xed3_1', data)
  }

  sendGroupPoke(groupCode: number, memberUin: number) {
    const body = Oidb.SendPoke.encode({
      toUin: memberUin,
      groupCode,
    }).finish()
    const data = Oidb.Base.encode({
      command: 0xed3,
      subCommand: 1,
      body,
    }).finish()
    this.sendPB('OidbSvcTrpcTcp.0xed3_1', data)
  }

  setSpecialTitle(groupCode: number, memberUid: string, title: string) {
    const body = Oidb.SetSpecialTitle.encode({
      groupCode,
      body: {
        targetUid: memberUid,
        uidName: title,
        specialTitle: title,
        expireTime: -1,
      },
    }).finish()
    const data = Oidb.Base.encode({
      command: 0x8fc,
      subCommand: 2,
      body,
    }).finish()
    this.sendPB('OidbSvcTrpcTcp.0x8fc_2', data)
  }
}