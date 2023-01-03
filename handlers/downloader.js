const { youtubedl, youtubedlv2, youtubedlv3, youtubeSearch } = require('@bochilteam/scraper')
const instagramGetUrl = require("instagram-url-direct");

const settings = require('../configs/settings.json')

const ytmp4Handler = async (sock, sender, args, msg) => {
    if (args.length === 0 || args.length >= 2)
        return await sock.sendMessage(sender, { text: `_*[YOUTUBE VIDEO DOWNLOADER]*_ \n\nContoh :\n*${settings.prefix}ytmp4 https://youtu.be/iik25wqIuFo*` }, { quoted: msg });

    if (!/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(args[0]))
        return await sock.sendMessage(sender, { text: `_Harap masukan link Youtube!!_` }, { quoted: msg });

    await sock.sendMessage(sender, { text: `_Sek lagi diproses ...._` }, { quoted: msg });
    try {
        const res = await youtubedlv2(args[0]);
        if (!res.video['360p']) return await sock.sendMessage(sender, { text: `_Video tidak tersedia!_` }, { quoted: msg });
        await sock.sendMessage(sender, { text: `_*Detail Video :*_\n• *Title* : ${res.title}\n• *Qual* : ${res.video['360p'].quality}\n• *Size* : ${res.video['360p'].fileSizeH}\n\n_Tunggu sek lagi didownload..._` });
        var link = await res.video['360p'].download()
        await sock.sendMessage(sender, { video: { url: link } });
    } catch (error) {
        return await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }

}

const ytmp3Handler = async (sock, sender, args, msg) => {
    if (args.length === 0 || args.length >= 2)
        return await sock.sendMessage(sender, { text: `_*[YOUTUBE AUDIO DOWNLOADER]*_ \n\nContoh :\n*${settings.prefix}ytmp3 https://youtu.be/iik25wqIuFo*` }, { quoted: msg });

    if (!/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(args[0]))
        return await sock.sendMessage(sender, { text: `_Harap masukan link Youtube!!_` }, { quoted: msg });

    await sock.sendMessage(sender, { text: `_Sek lagi diproses ...._` }, { quoted: msg });
    try {
        const res = await youtubedlv2(args[0]);
        if (!res.audio['128kbps']) return await sock.sendMessage(sender, { text: `_Audio tidak tersedia!_` }, { quoted: msg });
        await sock.sendMessage(sender, { text: `_*Detail Audio :*_\n• *Title* : ${res.title}\n• *Qual* : ${res.audio['128kbps'].quality}\n• *Size* : ${res.audio['128kbps'].fileSizeH}\n\n_Tunggu sek lagi didownload..._` });
        var link = await res.audio['128kbps'].download()
        await sock.sendMessage(sender, { audio: { url: link }, mimetype: 'audio/mp4' });
    } catch (error) {
        return await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }

}

const ythumbHandler = async (sock, sender, args, msg) => {
    if (args.length === 0 || args.length >= 2)
        return await sock.sendMessage(sender, { text: `_*[YOUTUBE THUMBNAIL DOWNLOADER]*_ \n\nContoh :\n*${settings.prefix}ythumb https://youtu.be/iik25wqIuFo*` }, { quoted: msg });

    if (!/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(args[0]))
        return await sock.sendMessage(sender, { text: `_Harap masukan link Youtube!!_` }, { quoted: msg });

    await sock.sendMessage(sender, { text: `_Sek lagi diproses ...._` }, { quoted: msg });
    try {
        const res = await youtubedlv2(args[0]);
        if (!res.thumbnail) return await sock.sendMessage(sender, { text: `_Thumbnail tidak tersedia!_` }, { quoted: msg });
        var link = res.thumbnail
        await sock.sendMessage(sender, { image: { url: link } });
    } catch (error) {
        return await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }
}

const igreelHandler = async (sock, sender, args, msg) => {
    if (args.length === 0 || args.length >= 2)
        return await sock.sendMessage(sender, { text: `_*[INSTAGRAM REEL DOWNLOADER]*_ \n\nContoh :\n*${settings.prefix}igreel https://www.instagram.com/reel/Cmg06d_BXtI/*` }, { quoted: msg });

    if (!/((?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel)\/([^/?#&]+)).*/.test(args[0]))
        return await sock.sendMessage(sender, { text: `_Harap masukan link IG Reel!!_` }, { quoted: msg });

    await sock.sendMessage(sender, { text: `_Sek lagi diproses ...._` }, { quoted: msg });
    try {
        const res = await instagramGetUrl(args[0]);
        if (!res.url_list || res.results_number > 1 || !res.url_list[0].includes('.mp4')) return await sock.sendMessage(sender, { text: `_Reel tidak tersedia!_` }, { quoted: msg });
        var link = res.url_list[0]
        await sock.sendMessage(sender, { text: `_Tunggu lagi didownload..._` });
        await sock.sendMessage(sender, { video: { url: link } });
    } catch (error) {
        return await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }
}

const igpostHandler = async (sock, sender, args, msg) => {
    if (args.length === 0 || args.length >= 2)
        return await sock.sendMessage(sender, { text: `_*[INSTAGRAM POST DOWNLOADER]*_ \n\nContoh :\n*${settings.prefix}igpost https://www.instagram.com/p/Cmj0JtfhsPp/*` }, { quoted: msg });

    if (!/((?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p)\/([^/?#&]+)).*/.test(args[0]))
        return await sock.sendMessage(sender, { text: `_Harap masukan link IG Post!!_` }, { quoted: msg });

    await sock.sendMessage(sender, { text: `_Sek lagi diproses ...._` }, { quoted: msg });
    try {
        const res = await instagramGetUrl(args[0]);
        if (!res.url_list || res.results_number > 10) return await sock.sendMessage(sender, { text: `_Post tidak tersedia!_` }, { quoted: msg });

        if (res.results_number == 1) {
            var link = res.url_list[0]
            await sock.sendMessage(sender, { text: `_Tunggu lagi didownload..._` });
            if (link.includes('jpg'))
                await sock.sendMessage(sender, { image: { url: link } });
            if (link.includes('mp4'))
                await sock.sendMessage(sender, { video: { url: link } });
        } else {
            const slideLists = () => {
                var myArray = [];
                for (i = 0; i < res.url_list.length; i++) {
                    myArray.push({
                        title: `Download slide ke-${i + 1}`,
                        rowId: `igPostEach||${res.url_list[i]}`
                    });
                };
                return myArray
            }

            const typeLists = () => {
                var myArray = [];
                var str = JSON.stringify(res.url_list)
                if (str.includes('mp4') && str.includes('jpg')) {
                    myArray.push({
                        title: `Download Semuanya!`,
                        rowId: `igPostAll||${JSON.stringify(res.url_list)}`
                    });
                    myArray.push({
                        title: `Download hanya gambar!`,
                        rowId: `igPostImgOnly||${JSON.stringify(res.url_list)}`
                    });
                    myArray.push({
                        title: `Download hanya video!`,
                        rowId: `igPostVidOnly||${JSON.stringify(res.url_list)}`
                    });
                } else {
                    myArray.push({
                        title: `Download Semuanya!`,
                        rowId: `igPostAll||${JSON.stringify(res.url_list)}`
                    });
                }
                return myArray;
            }

            const sections = [{ rows: typeLists() }, { title: "Download per Slide", rows: slideLists() }]

            const listMessage = {
                text: `Terdapat total *${res.results_number}* slide Post. Silahkan pilih Opsi Download dibawah.`,
                footer: `source: ${args[0]}`,
                title: "_*IG Post Downloader*_",
                buttonText: "Opsi Download",
                sections
            }
            await sock.sendMessage(sender, listMessage);
        }

    } catch (error) {
        return await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }
}

const twdlHandler = async (sock, sender, args, msg) => {
    if (args.length === 0 || args.length >= 2)
        return await sock.sendMessage(sender, { text: `_*[TWITTER POST DOWNLOADER]*_ \n\nContoh :\n*${settings.prefix}twdl https://twitter.com/Twitter/status/1577730467436138524*` }, { quoted: msg });

    if (!/(?:http:\/\/)?(?:www\.)?twitter\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/.test(args[0]))
        return await sock.sendMessage(sender, { text: `_Harap masukan link Twitter!!_` }, { quoted: msg });

    await sock.sendMessage(sender, { text: `_Sek lagi diproses ...._` }, { quoted: msg });
    try {
        const res = await instagramGetUrl(args[0]);
        if (!res.url_list) return await sock.sendMessage(sender, { text: `_Twitter post tidak tersedia!_` }, { quoted: msg });

        if (res.results_number == 1) {
            var link = res.url_list[0]
            await sock.sendMessage(sender, { text: `_Tunggu lagi didownload..._` });
            if (link.includes('jpg'))
                await sock.sendMessage(sender, { image: { url: link } });
            if (link.includes('mp4'))
                await sock.sendMessage(sender, { video: { url: link } });
        } else {
            const slideLists = () => {
                var myArray = [];
                for (i = 0; i < res.url_list.length; i++) {
                    myArray.push({
                        title: `Download slide ke-${i + 1}`,
                        rowId: `twPostEach||${res.url_list[i]}`
                    });
                };
                return myArray
            }

            const typeLists = () => {
                var myArray = [];
                var str = JSON.stringify(res.url_list)
                if (str.includes('mp4') && str.includes('jpg')) {
                    myArray.push({
                        title: `Download Semuanya!`,
                        rowId: `twPostAll||${JSON.stringify(res.url_list)}`
                    });
                    myArray.push({
                        title: `Download hanya gambar!`,
                        rowId: `twPostImgOnly||${JSON.stringify(res.url_list)}`
                    });
                    myArray.push({
                        title: `Download hanya video!`,
                        rowId: `twPostVidOnly||${JSON.stringify(res.url_list)}`
                    });
                } else {
                    myArray.push({
                        title: `Download Semuanya!`,
                        rowId: `twPostAll||${JSON.stringify(res.url_list)}`
                    });
                }
                return myArray;
            }

            const sections = [{ rows: typeLists() }, { title: "Download per Slide", rows: slideLists() },
            ]

            const listMessage = {
                text: `Terdapat total *${res.results_number}* slide Post. Silahkan pilih Opsi Download dibawah.`,
                footer: `source: ${args[0]}`,
                title: "_*Twitter Downloader*_",
                buttonText: "Opsi Download",
                sections
            }
            await sock.sendMessage(sender, listMessage);
        }

    } catch (error) {
        return await sock.sendMessage(sender, { text: `_Error: Silahkan coba lagi!_` }, { quoted: msg });
    }
}

module.exports = { ytmp4Handler, ytmp3Handler, ythumbHandler, igreelHandler, igpostHandler, twdlHandler }