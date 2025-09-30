export interface PMHQ {
  sendPB: (cmd: string, pbHex: string) => void;
}

declare global {
  var PMHQ: PMHQ
}
