const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("./configs/settings.json"));
var namaBot = settings.namaBot;
var prefix = settings.prefix;

const startHandler = async (sock, sender, msg) => {
  const buttons = [
    {
      buttonId: "btnMenu1",
      buttonText: { displayText: "ð Tools Menu" },
      type: 1,
    },
    {
      buttonId: "btnMenu2",
      buttonText: { displayText: "ð« UAD Menu" },
      type: 1,
    },
  ];
  const buttonInfo = {
    text: `Selamat Datang di *${namaBot}*,\n\n${namaBot} merupakan Whatsapp Bot sederhana yang dibuat hanya untuk bahan pembelajaran dan iseng-iseng saja ð.\n`,
    footer: "Created by Alfian",
    buttons: buttons,
    headerType: 1
  };
  await sock.sendMessage(sender, buttonInfo, { quoted: msg });
};

const menu1Handler = async (sock, sender, msg) => {
  await sock.sendMessage(
    sender,
    {
      text:
        `*[TOOLS MENUâï¸]*\n
_*OpenAI (Terbaik)*_
â¢ ${prefix}ai

_*Downloader*_
â¢ ${prefix}ythumb
â¢ ${prefix}ytmp4
â¢ ${prefix}ytmp3
â¢ ${prefix}igreel
â¢ ${prefix}igpost
â¢ ${prefix}twdl

_*Search Image*_
â¢ ${prefix}pinterest
â¢ ${prefix}google

_*Kata Bijak & Peribahasa*_
â¢ ${prefix}bijak
â¢ ${prefix}peri

_*Islami*_
â¢ ${prefix}asmaulhusna
â¢ ${prefix}jadwalsholat

_*Lainnya*_
â¢ ${prefix}sticker
â¢ ${prefix}toimg
â¢ ${prefix}waktu\n`
    },
    { quoted: msg }
  );
};

const menu2Handler = async (sock, sender, msg) => {
  await sock.sendMessage(
    sender,
    {
      text:
        `*[MENU UADð]*\n
_*DAFTAR DOSEN*_
â¢ ${prefix}dsntif
â¢ ${prefix}dsnact
â¢ ${prefix}dsnpbio\n
_*PORTAL UAD*_
â¢ ${prefix}loginuad
â¢ ${prefix}statusmhsuad
â¢ ${prefix}transkripuad
â¢ ${prefix}infopembayaranuad
â¢ ${prefix}cektagihanuad
â¢ ${prefix}rekapresensiuad
â¢ ${prefix}logoutuad\n
_*LAINNYA*_
â¢ ${prefix}newsuad
â¢ ${prefix}klndrakdmk\n`
    },
    { quoted: msg }
  );
};

module.exports = { startHandler, menu1Handler, menu2Handler };
