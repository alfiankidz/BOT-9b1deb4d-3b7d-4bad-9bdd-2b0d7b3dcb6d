const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("./configs/settings.json"));
const moment = require("moment-timezone");

const waktuindoHandler = async (sock, sender, msg) => {
  moment.locale('id')
  const date = moment().tz("Asia/Jakarta").format("dddd, DD MMMM YYYY");
  const wib = moment().tz("Asia/Jakarta").format("HH:mm");
  const wita = moment().tz("Asia/Makassar").format("HH:mm");
  const wit = moment().tz("Asia/Jayapura").format("HH:mm");

  await sock.sendMessage(
    sender,
    {
      text:
        `_Waktu di *INDONESIA*_ :\n
*${date}*
• *${wib}* WIB
• *${wit}* WIT
• *${wita}* WITA\n`
    },
    { quoted: msg }
  );
};

module.exports = { waktuindoHandler };
