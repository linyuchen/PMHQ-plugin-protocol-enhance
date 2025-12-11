export interface PMHQ {
  sendPB: (cmd: string, pbHex: string) => Promise<any>;
}

declare global {
  var PMHQ: PMHQ
}
