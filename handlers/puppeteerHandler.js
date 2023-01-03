const puppeteer = require('puppeteer')
const UA = require('random-useragent');

const ssHandler = async (sock, sender, args, msg) => {
    if (args.length === 0 || args.length >= 2)
        return await sock.sendMessage(sender, { text: `_*[SCREENSHOT WEBSITE]*_ \n\nContoh :\n*${settings.prefix}ss https://google.com/*` }, { quoted: msg });

    if (!/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(args[0]))
        return await sock.sendMessage(sender, { text: `_URL Tidak Valid!!_` }, { quoted: msg });

    await sock.sendMessage(sender, { text: `_Sek lagi diproses ...._` }, { quoted: msg });

    try {
        const browser = await puppeteer.launch({
            headless: true,
            userAgent: UA.getRandom(),
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        await page.goto(args[0], { waitUntil: 'networkidle2' });
        const b64string = await page.screenshot({ encoding: "base64", fullPage: true });
        const buffer = Buffer.from(b64string, "base64");
        await browser.close();
        await sock.sendMessage(sender, { image: buffer, mimetype: 'image/jpg' })

    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

module.exports = { ssHandler }