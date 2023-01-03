const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("./configs/settings.json"));
var namaBot = settings.namaBot;
var prefix = settings.prefix;

const startHandler = async (sock, sender, msg) => {
  const buttons = [
    {
      buttonId: "btnMenu1",
      buttonText: { displayText: "📃 Tools Menu" },
      type: 1,
    },
    {
      buttonId: "btnMenu2",
      buttonText: { displayText: "🏫 UAD Menu" },
      type: 1,
    },
  ];
  const buttonInfo = {
    text: `Selamat Datang di *${namaBot}*,\n\n${namaBot} merupakan Whatsapp Bot sederhana yang dibuat hanya untuk bahan pembelajaran dan iseng-iseng saja 😎.\n`,
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
        `*[TOOLS MENU⚙️]*\n
_*OpenAI (Terbaik)*_
• ${prefix}ai

_*Downloader*_
• ${prefix}ythumb
• ${prefix}ytmp4
• ${prefix}ytmp3
• ${prefix}igreel
• ${prefix}igpost
• ${prefix}twdl

_*Search Image*_
• ${prefix}pinterest
• ${prefix}google

_*Kata Bijak & Peribahasa*_
• ${prefix}bijak
• ${prefix}peri

_*Islami*_
• ${prefix}asmaulhusna
• ${prefix}jadwalsholat

_*Lainnya*_
• ${prefix}sticker
• ${prefix}toimg
• ${prefix}waktu\n`
    },
    { quoted: msg }
  );
};

const menu2Handler = async (sock, sender, msg) => {
  await sock.sendMessage(
    sender,
    {
      text:
        `*[MENU UAD🎓]*\n
_*DAFTAR DOSEN*_
• ${prefix}dsntif
• ${prefix}dsnact
• ${prefix}dsnpbio\n
_*PORTAL UAD*_
• ${prefix}loginuad
• ${prefix}statusmhsuad
• ${prefix}transkripuad
• ${prefix}infopembayaranuad
• ${prefix}cektagihanuad
• ${prefix}rekapresensiuad
• ${prefix}logoutuad\n
_*LAINNYA*_
• ${prefix}newsuad
• ${prefix}klndrakdmk\n`
    },
    { quoted: msg }
  );
};

module.exports = { startHandler, menu1Handler, menu2Handler };
