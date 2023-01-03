const { pinterest, googleImage, jadwalsholat, asmaulhusna } = require('@bochilteam/scraper')
const settings = require('../configs/settings.json')
const moment = require("moment-timezone");

const imgSrchPintHandler = async (sock, sender, args, msg) => {
    if (args.length === 0)
        return await sock.sendMessage(sender, { text: `_Harap masukan keyword!_ \nContoh : *${settings.prefix}pinterest raja wali*` }, { quoted: msg });

    var keyword = ''
    for (let i = 0; i < args.length; i++) {
        keyword += args[i] + ' '
    }
    try {
        await sock.sendMessage(sender, { text: `_Sedang mencari gambar *${keyword.trim()}* pada Pinterest_` }, { quoted: msg });
        const get = await pinterest(keyword);
        if (get == null || get.length === 0)
            return await sock.sendMessage(sender, { text: '_Gagal: Silahkan coba lagi!_' });
        var rand = get[Math.floor(Math.random() * get.length)];
        await sock.sendMessage(sender, { image: { url: rand } });
    } catch (error) {
        await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }
}

const imgSrchGoogleHandler = async (sock, sender, args, msg) => {
    if (args.length === 0)
        return await sock.sendMessage(sender, { text: `_Harap masukan keyword!_ \nContoh : *${settings.prefix}google raja wali*` }, { quoted: msg });

    var keyword = ''
    for (let i = 0; i < args.length; i++) {
        keyword += args[i] + ' '
    }
    try {
        await sock.sendMessage(sender, { text: `_Sedang mencari gambar *${keyword.trim()}* pada Google_` }, { quoted: msg });
        const get = await googleImage(keyword);
        if (get == null || get.length === 0)
            return await sock.sendMessage(sender, { text: '_Gagal: Silahkan coba lagi!_' });
        var rand = get[Math.floor(Math.random() * get.length)];
        await sock.sendMessage(sender, { image: { url: rand } });
    } catch (error) {
        await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }
}

const jadwalsholatHandler = async (sock, sender, args, msg) => {
    if (args.length === 0)
        return await sock.sendMessage(sender, { text: `_Harap masukan kota!_ \nContoh : *${settings.prefix}jadwalsholat yogyakarta*` }, { quoted: msg });

    var keyword = ''
    for (let i = 0; i < args.length; i++) {
        keyword += args[i] + ' '
    }

    await sock.sendMessage(sender, { text: `_Sek lagi diproses ...._` }, { quoted: msg });
    try {
        moment.locale('id')
        const date = moment().tz("Asia/Jakarta").format("dddd, DD MMMM YYYY");
        const res = await jadwalsholat(keyword.trim());
        if (res.today)
            return await sock.sendMessage(sender, { text: `*${date}*\n• Subuh : ${res.today.Shubuh}\n• Dzuhur : ${res.today.Dzuhur}\n• Ashr : ${res.today.Ashr}\n• Maghrib : ${res.today.Maghrib}\n• Isya : ${res.today.Isya}\n` });
    } catch (error) {
        if (error.toString().includes('ScraperError'))
            return await sock.sendMessage(sender, { text: `_Kota tidak ditemukan!_` }, { quoted: msg });
        return await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }
}

const asmaulhusnaHandler = async (sock, sender, args, msg) => {
    try {
        const res = await asmaulhusna();
        await sock.sendMessage(sender, { text: `_*Asma #${res.index}*_\n• Latin : ${res.latin}\n• Arabic : ${res.arabic}\n• ID : ${res.translation_id}\n• EN : ${res.translation_en}\n` }, { quoted: msg });
    } catch (error) {
        await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }

}

module.exports = { imgSrchPintHandler, imgSrchGoogleHandler, jadwalsholatHandler, asmaulhusnaHandler };
