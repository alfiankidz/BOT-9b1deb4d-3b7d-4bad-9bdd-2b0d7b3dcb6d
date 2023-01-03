const axios = require("axios");
const cheerio = require("cheerio");
const UA = require('random-useragent');

const dsntifHandler = async (sock, sender, msg) => {
    var url = "https://tif.uad.ac.id/dosen/";
    await sock.sendMessage(sender, { text: '_Scraping data..._' }, { quoted: msg });
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': UA.getRandom() }
        });
        const $ = cheerio.load(data);
        const listItems = $(
            ".main_color.container_wrap.fullsize"
        );
        const dosentif = [];

        listItems.each((idx, el) => {
            var doseninfo = [];
            const dosen = { nama: "", img: "", info: "" };
            dosen.nama = $(el).find("h4").text();
            dosen.img = $(el)
                .find(".avia-image-overlay-wrap > img")
                .attr("data-lazy-src");

            if (dosen.nama === "" || dosen.img === "") return;

            const dosenIList = $(el).find("ul > li");
            dosenIList.each((idx, el) => {
                var xyz = {};
                xyz = $(el).text();
                xyz = xyz.replace("[at]", "@");
                doseninfo.push('\n• ' + xyz);
            });
            dosen.info = doseninfo;
            dosentif.push(dosen);
        });
        const rowsList = () => {
            var myArray = [];
            for (i = 0; i < dosentif.length; i++) {
                myArray.push({
                    title: dosentif[i].nama,
                    rowId: `dsnTif||${dosentif[i].nama}||${dosentif[i].img}||${dosentif[i].info}`
                });
            };
            return myArray
        }
        const sections = [
            {
                title: 'Pilih Salah Satu Dosen',
                rows: rowsList()
            }
        ]
        const listMessage = {
            text: `Terdapat total *${dosentif.length}* dosen.`,
            footer: `Source : ${url}`,
            title: "*Dosen Informatika UAD*",
            buttonText: "Lihat Daftar",
            sections
        }
        await sock.sendMessage(sender, listMessage)
    } catch (err) {
        console.error(err);
        await sock.sendMessage(sender, { text: 'ERROR: Silahkan coba lagi!' }, { quoted: msg });
    }
};

const dsnactHandler = async (sock, sender, msg) => {
    var url = "https://akuntansi.uad.ac.id/dosen-prodi-akuntansi/";
    await sock.sendMessage(sender, { text: '_Scraping data..._' }, { quoted: msg });
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': UA.getRandom() }
        });
        const $ = cheerio.load(data);
        const listItems1 = $(
            ".avia-section.main_color.avia-section-no-padding.avia-no-border-styling.avia-bg-style-scroll"
        );
        const dosenact = [];

        listItems1.each((idx, el) => {
            const listItems2 = $(el).find(".flex_cell_inner");
            listItems2.each((idx, el) => {
                const dosen = { nama: "", niyp: "", email: "" };
                dosen.nama = ($(el).find(".avia-team-member h3").length === 1) ? $(el).find(".avia-team-member h3").text() : $(el).find(".avia-team-member h4").text();
                dosen.img = $(el).find(".team-img-container img").attr("data-lazy-src");

                if ($(el).find("section > p:nth-child(3)").length === 0) {
                    niyp = $(el).find("section > .team-member-description > p:nth-child(1)").text();
                    email = $(el).find("section > .team-member-description > p:nth-child(2)").text();
                } else {
                    niyp = $(el).find("section > p:nth-child(3)").text();
                    email = $(el).find("section > p:nth-child(4)").text();
                }

                dosen.niyp = niyp
                dosen.email = email.replace('\n', '')
                if (dosen.nama == "") return;
                dosenact.push(dosen);
            });
        });
        const rowsList = () => {
            var myArray = [];
            for (i = 0; i < dosenact.length; i++) {
                myArray.push({
                    title: dosenact[i].nama,
                    rowId: `dsnAct||${dosenact[i].nama}||${dosenact[i].img}||${dosenact[i].niyp}\n${dosenact[i].email}`
                });
            };
            return myArray
        }
        const sections = [
            {
                title: 'Pilih Salah Satu Dosen',
                rows: rowsList()
            }
        ]
        const listMessage = {
            text: `Terdapat total *${dosenact.length}* dosen.`,
            footer: `Source : ${url}`,
            title: "*Dosen Akuntansi UAD*",
            buttonText: "Lihat Daftar",
            sections
        }
        await sock.sendMessage(sender, listMessage)
    } catch (err) {
        console.error(err);
        await sock.sendMessage(sender, { text: 'ERROR: Silahkan coba lagi!' }, { quoted: msg });
    }
};

const dsnpbioHandler = async (sock, sender, msg) => {
    var url = "https://pbio.uad.ac.id/staf-pengajar/";
    await sock.sendMessage(sender, { text: '_Scraping data..._' }, { quoted: msg });
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': UA.getRandom() }
        });
        const $ = cheerio.load(data);
        const listItems1 = $(
            ".av-layout-grid-container.entry-content-wrapper.main_color.av-flex-cells"
        );
        const dosenpbio = [];

        listItems1.each((idx, el) => {
            const listItems2 = $(el).find(".flex_cell_inner");
            listItems2.each((idx, el) => {
                const dosen = { nama: "", niyp: "", email: "" };
                dosen.nama = $(el).find(".av_textblock_section div h5").text();
                dosen.img = $(el).find(".avia-image-container img").attr("src");
                dosen.niyp = $(el)
                    .find(".av_textblock_section div p:nth-child(2)")
                    .text();
                dosen.email = 'Email. ' + $(el)
                    .find(".av_textblock_section div p:nth-child(3)")
                    .text();
                if (dosen.nama == "") return;
                dosenpbio.push(dosen);
            });
        });

        const rowsList = () => {
            var myArray = [];
            for (i = 0; i < dosenpbio.length; i++) {
                myArray.push({
                    title: dosenpbio[i].nama,
                    rowId: `dsnPbio||${dosenpbio[i].nama}||${dosenpbio[i].img}||${dosenpbio[i].niyp}\n${dosenpbio[i].email}`
                });
            };
            return myArray
        }
        const sections = [
            {
                title: 'Pilih Salah Satu Dosen',
                rows: rowsList()
            }
        ]
        const listMessage = {
            text: `Terdapat total *${dosenpbio.length}* dosen.`,
            footer: `Source : ${url}`,
            title: "*Dosen Pendidikan Biologi UAD*",
            buttonText: "Lihat Daftar",
            sections
        }
        await sock.sendMessage(sender, listMessage)
    } catch (err) {
        console.error(err);
        await sock.sendMessage(sender, { text: 'ERROR: Silahkan coba lagi!' }, { quoted: msg });
    }
};

const klnderakdmkHandler = async (sock, sender, msg) => {
    var url = "https://baa.uad.ac.id/kalender-akademik/";
    await sock.sendMessage(sender, { text: '_Scraping data..._' }, { quoted: msg });
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': UA.getRandom() }
        });
        const $ = cheerio.load(data);
        const listItems = $(
            "table > tbody > tr"
        );
        const klnderAkdmk = [];

        listItems.each((idx, el) => {
            const klndr = { nama: "", link: "" };
            klndr.nama = $(el).find("td:nth-child(1)").text();
            klndr.link = $(el).find("td:nth-child(2) > a").attr('href');

            if (klndr.nama === "") return;

            klnderAkdmk.push(klndr);
        });

        const rowsList = () => {
            var myArray = [];
            for (i = 0; i < klnderAkdmk.length; i++) {
                myArray.push({
                    title: klnderAkdmk[i].nama,
                    rowId: `klnderAkdmk||${klnderAkdmk[i].nama}||${klnderAkdmk[i].link}}`
                });
            };
            return myArray
        }
        const sections = [
            {
                title: 'Pilih Salah Satu',
                rows: rowsList()
            }
        ]
        const listMessage = {
            text: `Terdapat total *${klnderAkdmk.length}* kalender.`,
            footer: `Source : ${url}`,
            title: "Kalender Akademik UAD",
            buttonText: "Lihat Daftar",
            sections
        }
        await sock.sendMessage(sender, listMessage)
    } catch (err) {
        console.error(err);
        await sock.sendMessage(sender, { text: 'ERROR: Silahkan coba lagi!' }, { quoted: msg });
    }
};

const kataBijakHandler = async (sock, sender, msg) => {
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const url = `https://jagokata.com/kata-bijak/popular.html?page=${randomPage}`;
    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': UA.getRandom() } });
        const $ = cheerio.load(data);
        const listItems1 = $("#citatenrijen > li");
        const bijak = [];
        listItems1.each((idx, el) => {
            const xx = { author: "", says: "" };
            xx.author = $(el).find("a").text();
            xx.says = $(el).find(".fbquote").text();
            if (xx.author === "") return;
            bijak.push(xx)
        });
        var rand = bijak[Math.floor(Math.random() * bijak.length)];
        await sock.sendMessage(sender, { text: `*"${rand.says}"*\n- _${rand.author}_` }, { quoted: msg });
    } catch (err) {
        console.error(err);
        await sock.sendMessage(sender, { text: 'ERROR: Silahkan coba lagi!' }, { quoted: msg });
    }
}
const peribahasaHandler = async (sock, sender, msg) => {
    const keyword = ['anak', 'bagai', 'baik', 'bekerja', 'harapan', 'hati', 'hidup', 'ikan', 'jahat', 'kawan', 'keluarga', 'mulut', 'makan', 'menyesal', 'susah'];
    var rand = keyword[Math.floor(Math.random() * keyword.length)];
    const url = `https://jagokata.com/peribahasa/${rand}.html`;
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': UA.getRandom() }
        });
        const $ = cheerio.load(data);
        const listItems1 = $("#arti-kata > ul:nth-child(3) > li");
        const peribahasa = [];
        listItems1.each((idx, el) => {
            const xx = { peri: "", arti: "" };
            var get = $(el).text();
            var split = get.split('=')
            xx.peri = split[0]
            xx.arti = split[1]
            if (xx.peri.includes('adsbygoogle')) return;
            peribahasa.push(xx)
        });
        var rand = peribahasa[Math.floor(Math.random() * peribahasa.length)];
        await sock.sendMessage(sender, { text: `*"${rand.peri}"*\nArti: _${rand.arti}_` }, { quoted: msg });
    } catch (err) {
        console.error(err);
        await sock.sendMessage(sender, { text: 'ERROR: Silahkan coba lagi!' }, { quoted: msg });
    }
}

const newsUadHandler = async (sock, sender, msg) => {
    var url = "https://news.uad.ac.id/tag/berita-uad/";
    await sock.sendMessage(sender, { text: '_Scraping data..._' }, { quoted: msg });
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': UA.getRandom() }
        });
        const $ = cheerio.load(data);
        const listItems = $("main > article");
        const pagiInfo = $("span.pagination-meta").text().trim();
        const cekPagi = $("span.pagination-meta").text().trim();

        const news = [];
        listItems.each((idx, el) => {
            const xx = { judul: "", link: "", tgl: "" };
            xx.judul = $(el).find("header > h2 > a").text().trim().toUpperCase();
            xx.link = $(el).find("header > h2 > a").attr('href');
            xx.tgl = $(el).find("header > span > time").text();
            if (xx.judul === "") return;
            news.push(xx);
        });

        let aa = `*~ UAD NEWS ~*\n\n`
        for (let i = 0; i < news.length; i++) {
            aa += `*${news[i].judul}*\n`
            aa += `🗓️  _${news[i].tgl}_\n`
            aa += `Read: ${news[i].link}\n\n`
        }

        await sock.sendMessage(sender, { text: aa }, { quoted: msg });
    } catch (err) {
        console.error(err);
        await sock.sendMessage(sender, { text: 'ERROR: Silahkan coba lagi!' }, { quoted: msg });
    }
}

module.exports = { dsntifHandler, dsnpbioHandler, klnderakdmkHandler, dsnactHandler, kataBijakHandler, peribahasaHandler, newsUadHandler };