const superagent = require('superagent');
const cheerio = require("cheerio");
const UA = require('random-useragent');
const fs = require('fs');
const settings = require('../configs/settings.json')

function __cekfilesess(file) {
    if (fs.existsSync(`./uad_log_sessions/${file}.json`)) {
        return true
    } else {
        return false
    }
}
function __readfile(file) {
    get = fs.readFileSync(`./uad_log_sessions/${file}.json`)
    return JSON.parse(get)
}

const __ceksession = async (sessId) => {
    const superagentCookie = superagent.agent()
    const setCookie = await superagentCookie
        .post('https://portal.uad.ac.id/')
        .set('Cookie', `portal_session=${sessId}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('User-Agent', UA.getRandom())
    const $ = cheerio.load(setCookie.text);
    if ($('.username.username-hide-mobile').length === 0)
        return false
    return true
}

const __postReq = async (url, sessId, _send = null) => {
    const superagentCookie = superagent.agent()
    const result = await superagentCookie
        .post(url)
        .send(_send)
        .set('Cookie', `portal_session=${sessId}`)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('User-Agent', UA.getRandom())
    return result.text
}

const loginUadHandler = async (sock, sender, args, msg) => {
    if (args.length === 0 || args.length >= 2)
        return await sock.sendMessage(sender, { text: `*[LOGIN PORTAL UAD]* \n\nSilahkan login terlebih dahulu dengan cara chat _*${settings.prefix}loginuad nim&password*_\nContoh :\n*${settings.prefix}loginuad 1900018001&uad12345*` }, { quoted: msg });

    var split = args[0].split('&');
    var nim = split[0];
    var pass = split[1];
    var senderNum = sender.replace('@s.whatsapp.net', '')

    if (split.length !== 2 || nim.length !== 10 || pass.length <= 3 || !/^\d+$/.test(nim))
        return await sock.sendMessage(sender, { text: `*Format Login Salah* \n\nPastikan :\n• Pastikan format sama seperti contoh login diatas atau ketik *${settings.prefix}loginuad*\n• Nim harus angka dan berjumlah 10\n• Password harus lebih dari 3 karakter` }, { quoted: msg });

    const superagentCookie = superagent.agent()
    superagentCookie
        .post('https://portal.uad.ac.id/')
        .set('User-Agent', UA.getRandom())
        .then(response => {
            let res = response.headers['set-cookie'][0];
            let cookie = res.split(';')[0].replace('portal_session=', '')
            superagentCookie
                .post('https://portal.uad.ac.id/login')
                .send({ login: nim, password: pass })
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('User-Agent', UA.getRandom())
                .then(response => {
                    const $ = cheerio.load(response.text);
                    if ($('.username.username-hide-mobile').length === 0)
                        return sock.sendMessage(sender, { text: `*Login Gagal* \n\nPastikan Nim dan Password benar!` }, { quoted: msg });
                    const data = { nim: nim, sessId: cookie };
                    fs.writeFileSync(`./uad_log_sessions/${sender}.json`, JSON.stringify(data))
                    return sock.sendMessage(sender, { text: `*Login Berhasil*\n\nSekarang anda dapat mengakses menu Portal UAD yang tersedia!\n_*Login Session*_ akan Expired dalam waktu *3 Jam*.` }, { quoted: msg });
                }).catch(error => {
                    console.error('Gagal Login!');
                });
        })
        .catch(error => {
            console.error('Gagal Mendapat SessionID');
        });
}

const logoutUadHandler = async (sock, sender, msg) => {
    try {
        fs.unlinkSync(`./uad_log_sessions/${sender}.json`);
        await sock.sendMessage(sender, { text: `*Logout Berhasil*\n\nUntuk melakukan login kembali ketik *${settings.prefix}loginuad*` }, { quoted: msg });
    } catch (error) {
        await sock.sendMessage(sender, { text: `*Logout Gagal*\n\nAnda belum melakukan login, untuk melakukan login ketik *${settings.prefix}loginuad*` }, { quoted: msg });
    }
}

const statusUadHandler = async (sock, sender, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq('https://portal.uad.ac.id/dashboard', getSess.sessId);
        const $ = cheerio.load(data);
        const nim = getSess.nim
        const nama = $('.username.username-hide-mobile').text().trim()
        const statusMhs = $("div:nth-child(1) > a > div.details > div.number").text().trim()
        const ipk = $("div:nth-child(2) > a > div.details > div.number").text().trim()
        const sks = $("div:nth-child(3) > a > div.details > div.number").text().trim()
        await sock.sendMessage(sender, { text: `*Status Mahasiswa*\n• NIM : ${nim}\n• Nama : ${nama}\n• Status : ${statusMhs}\n\n• IPK : *${ipk}*\n• SKS : *${sks}*` }, { quoted: msg })
    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

const transkripUadHandler = async (sock, sender, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq('https://portal.uad.ac.id/transkrip/Transkrip', getSess.sessId);
        const $ = cheerio.load(data);

        const nim = $('div.table-scrollable.table-scrollable-borderless > table > tbody > tr:nth-child(1) > td:nth-child(3)').text().trim()
        const nama = $('div.table-scrollable.table-scrollable-borderless > table > tbody > tr:nth-child(2) > td:nth-child(3)').text().trim()
        const prodi = $('div.table-scrollable.table-scrollable-borderless > table > tbody > tr:nth-child(3) > td:nth-child(3)').text().trim()

        const listItems = $(".table.table-striped.table-bordered.table-hover > tbody > tr");
        const rekap = [];
        const smt = []
        listItems.each((idx, el) => {
            const xx = { semester: "", matkul: "", sks: "", nilai: "" };
            xx.semester = $(el).find('td:nth-child(2)').text();
            xx.matkul = $(el).find('td:nth-child(4)').text();
            xx.sks = $(el).find('td:nth-child(5)').text();
            xx.nilai = $(el).find('td:nth-child(6)').text();
            rekap.push(xx)
            if (!smt.find(obj => obj === xx.semester)) {
                smt.push(xx.semester)
            }
        });
        var aa = '';
        for (let i = 0; i < smt.length; i++) {
            aa += `*${smt[i]}*\n`
            for (let k = 0; k < rekap.length; k++) {
                if (rekap[k].semester === smt[i])
                    aa += `• ${rekap[k].matkul} || ${rekap[k].sks} || ${rekap[k].nilai}\n`
            }
        }
        const add = $('address').text().trim().split('\n')
        var bb = ''
        for (let i = 0; i < add.length; i++) {
            if (/Jumlah|IP/.test(add[i]))
                bb += `*${add[i].trim().replace('\t', '')}*\n`
        }

        await sock.sendMessage(sender, { text: `*TRANSKRIP NILAI*\n• Nim : ${nim}\n• Nama : ${nama}\n• Prodi : ${prodi}\n\n[ Matakuliah || SKS || Nilai ]\n${aa}\n${bb}` }, { quoted: msg })
    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

const infoPembayaranUadHandler = async (sock, sender, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq('https://portal.uad.ac.id/pembayaran/Kuliah', getSess.sessId);
        const $ = cheerio.load(data);
        const listItems = $("select[name='semester'] > option");
        const semesterNow = $("div:nth-child(1) > table > tbody > tr:nth-child(4) > td:nth-child(3)").text().trim();
        const select = [];
        listItems.each((idx, el) => {
            const xx = { teks: "", value: "" };
            xx.teks = $(el).text();
            xx.value = $(el).attr('value');
            if (xx.value === '') return
            select.push(xx)
        });

        const rowsList = () => {
            var myArray = [];
            for (i = 0; i < select.length; i++) {
                myArray.push({
                    title: select[i].teks,
                    rowId: `infoBayarUad||${select[i].value}`
                });
            };
            return myArray
        }
        const sections = [
            {
                title: 'Pilih Semester',
                rows: rowsList()
            }
        ]
        const listMessage = {
            text: `Silahkan pilih semester di bawah untuk menampilkan info pembayaran.\n\nSemester anda sekarang : _*${semesterNow}*_`,
            title: "*Info Pembayaran Kuliah UAD*",
            buttonText: "Pilih Semester",
            sections
        }
        await sock.sendMessage(sender, listMessage, { quoted: msg })

    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

const cekTagihanUadHandler = async (sock, sender, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq('https://portal.uad.ac.id/pembayaran/Virtual_account', getSess.sessId);
        const $ = cheerio.load(data);

        const listItems = $("select[id='jnsTagihan'] > option");
        const script = $(".portlet-body > script").text();
        const regex = /https?:\/\/[^\s]+/g;
        const links = script.match(regex)[0].replace('"', '');

        const select = [];
        listItems.each((idx, el) => {
            const xx = { teks: "", value: "" };
            xx.teks = $(el).text();
            xx.value = $(el).attr('value');
            if (xx.value === '') return
            if (xx.teks === 'Lain-lain') return
            select.push(xx)
        });

        const rowsList = () => {
            var myArray = [];
            for (i = 0; i < select.length; i++) {
                myArray.push({
                    title: select[i].teks,
                    rowId: `cekTagihanUad||${links}${select[i].value}||${select[i].teks}`
                });
            };
            return myArray
        }
        const sections = [
            {
                title: 'Pilih Tagihan',
                rows: rowsList()
            }
        ]
        const listMessage = {
            text: `Silahkan pilih tagihan di bawah untuk menampilkan info harga tagihan.`,
            title: "*Cek Tagihan Pembayaran UAD*",
            buttonText: "Pilih Tagihan",
            sections
        }
        await sock.sendMessage(sender, listMessage, { quoted: msg })

    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

const rekaPresensiUadHandler = async (sock, sender, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq('https://portal.uad.ac.id/presensi/Presensi', getSess.sessId);
        const $ = cheerio.load(data);

        const listItems = $("select[name='semester'] > option");
        const select = [];
        listItems.each((idx, el) => {
            const xx = { semester: "", value: "" };
            xx.semester = $(el).text();
            xx.value = $(el).attr('value');
            if (xx.value === '') return
            select.push(xx)
        });

        const rowsList = () => {
            var myArray = [];
            for (i = 0; i < select.length; i++) {
                myArray.push({
                    title: select[i].semester,
                    rowId: `rekaPresensiUad||${select[i].value}||${select[i].semester}`
                });
            };
            return myArray
        }
        const sections = [
            {
                title: 'Pilih Semester',
                rows: rowsList()
            }
        ]
        const listMessage = {
            text: `Silahkan pilih semester di bawah untuk menampilkan info Rekap Presensi anda.`,
            title: "*Rekap Presensi UAD*",
            buttonText: "Pilih Semester",
            sections
        }
        await sock.sendMessage(sender, listMessage, { quoted: msg })

    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

const khsUadHandler = async (sock, sender, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq('https://portal.uad.ac.id/khs/Khs', getSess.sessId);
        const $ = cheerio.load(data);

        const listItems = $("select[name='semester'] > option");
        const select = [];
        listItems.each((idx, el) => {
            const xx = { semester: "", value: "" };
            xx.semester = $(el).text();
            xx.value = $(el).attr('value');
            if (xx.value === '') return
            select.push(xx)
        });

        const rowsList = () => {
            var myArray = [];
            for (i = 0; i < select.length; i++) {
                myArray.push({
                    title: select[i].semester,
                    rowId: `khsUad||${select[i].value}||${select[i].semester}`
                });
            };
            return myArray
        }
        const sections = [
            {
                title: 'Pilih Semester',
                rows: rowsList()
            }
        ]
        const listMessage = {
            text: `Silahkan pilih semester di bawah untuk menampilkan info KHS anda.`,
            title: "*Kartu Hasil Studi UAD*",
            buttonText: "Pilih Semester",
            sections
        }
        await sock.sendMessage(sender, listMessage, { quoted: msg })

    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}


/* ====================================================================== */
/*                         RESPONSE LIST BUTTON                           */
/* ====================================================================== */
const infoPembayaranUadResponseList = async (sock, sender, _smt, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq('https://portal.uad.ac.id/pembayaran/Kuliah', getSess.sessId, { semester: _smt });
        const $ = cheerio.load(data);
        const semester = $('option[selected="selected"]').text().trim()
        const info = $('div:nth-child(2) > table > tbody > tr:nth-child(3) > th').text().trim()
        const bTetap = $('div:nth-child(2) > table > tbody > tr:nth-child(4) > td:nth-child(2)').text().trim()
        const bBebanSKS = $('div:nth-child(2) > table > tbody > tr:nth-child(5) > td:nth-child(2)').text().trim()
        const bDppt = $('div:nth-child(2) > table > tbody > tr:nth-child(6) > td:nth-child(2)').text().trim() || '-'
        const total = $('div:nth-child(2) > table > tbody > tr:nth-child(7) > th').text().trim()
        const jumTotal = $('div:nth-child(2) > table > tbody > tr:nth-child(8) > td:nth-child(2)').text().trim()
        const jumTrbyr = $('div:nth-child(2) > table > tbody > tr:nth-child(9) > td:nth-child(2)').text().trim()
        const kurByr = $('div:nth-child(2) > table > tbody > tr:nth-child(10) > td:nth-child(2)').text().trim()
        const klbhByr = $('div:nth-child(2) > table > tbody > tr:nth-child(11) > td:nth-child(2)').text().trim()

        var smtTemp = `Semester : _*${semester}*_`
        var infoTemp = `*${info}*\n• Biaya Tetap (Rp.) : ${bTetap}\n• Biaya Beban Variabel (SKS) (Rp.) : ${bBebanSKS}\n• Biaya DPPT Awal (Rp.) : ${bDppt}`
        var totalTemp = `*${total}*\n• Jumlah Total (Rp.) : ${jumTotal}\n• Jumlah Terbayar (Rp.) : ${jumTrbyr}\n• Kekurangan Bayar (Rp.) : ${kurByr}\n• Kelebihan Bayar (Rp.) : ${klbhByr}`

        await sock.sendMessage(sender, { text: `${smtTemp}\n\n${infoTemp}\n${totalTemp}` }, { quoted: msg })
    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

const cekTagihanUadResponseList = async (sock, sender, _url, _jenis, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq(_url, getSess.sessId);
        var parse = JSON.parse(data)
        var jumlah = parse.jml || '-'

        await sock.sendMessage(sender, { text: `• Jenis Tagihan : *${_jenis}*\n• Jumlah (Rp.) : *${jumlah.toLocaleString('id', { minimumFractionDigits: 0 })}*` }, { quoted: msg })
    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

const rekaPresensiUadResponseList = async (sock, sender, _value, _smt, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq('https://portal.uad.ac.id/presensi/Presensi/index', getSess.sessId, { semester: _value });
        const $ = cheerio.load(data);

        const listItems = $('.table.table-striped.table-bordered.table-hover tbody tr')
        const rekap = [];
        listItems.each((idx, el) => {
            const xx = { matkul: "", kelas: "", hadir: "", tidak: "", jumlah: "" };
            xx.matkul = $(el).find('td:nth-child(3)').text().trim();
            xx.kelas = $(el).find('td:nth-child(4)').text().trim();
            xx.hadir = $(el).find('td:nth-child(6)').text().trim();
            xx.tidak = $(el).find('td:nth-child(7)').text().trim();
            xx.jumlah = $(el).find('td:nth-child(5)').text().trim();
            if (xx.matkul === '') return
            rekap.push(xx)
        });

        var aa = `Presensi Semester : _*${_smt}*_\n\n`
        for (let i = 0; i < rekap.length; i++) {
            aa += `*${i + 1}. ${rekap[i].matkul}* (Kelas ${rekap[i].kelas})\n`
            aa += `• Hadir : ${rekap[i].hadir} || Tidak : ${rekap[i].tidak} || Jumlah : ${rekap[i].jumlah}\n`
        }

        await sock.sendMessage(sender, { text: `${aa}` }, { quoted: msg })
    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

const khsUadResponseList = async (sock, sender, _value, _smt, msg) => {
    if (!__cekfilesess(sender))
        return await sock.sendMessage(sender, { text: `*Request Gagal*\n\nSilahkan login terlebih dahulu dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });
    const getSess = __readfile(sender);
    const cekSess = await __ceksession(getSess.sessId);
    if (!cekSess)
        return await sock.sendMessage(sender, { text: `*Session Sudah Berakhir*\n\nSilahkan login ulang dengan mengetikan *${settings.prefix}loginuad*` }, { quoted: msg });

    try {
        const data = await __postReq('https://portal.uad.ac.id/khs/Khs/index', getSess.sessId, { semester: _value });
        const $ = cheerio.load(data);

        const listItems = $('.table.table-striped.table-bordered.table-hover tbody tr')
        const khs = [];
        listItems.each((idx, el) => {
            const xx = { matkul: "", kelas: "", w_p: "", sks: "", nilai: "" };
            xx.matkul = $(el).find('td:nth-child(3)').text().trim();
            xx.kelas = $(el).find('td:nth-child(4)').text().trim();
            xx.w_p = $(el).find('td:nth-child(5)').text().trim();
            xx.sks = $(el).find('td:nth-child(6)').text().trim();
            xx.nilai = $(el).find('td:nth-child(7)').text().trim() || '-';
            if (xx.matkul === '') return
            khs.push(xx)
        });

        var aa = `KHS Semester : _*${_smt}*_\n\n`
        for (let i = 0; i < khs.length; i++) {
            aa += `*${i + 1}. ${khs[i].matkul}* (Kelas ${khs[i].kelas})\n`
            aa += `• W/P : ${khs[i].w_p} || SKS : ${khs[i].sks} || Nilai : *${khs[i].nilai}*\n`
        }

        const add = $('address').text().trim().split('\n')
        var bb = ''
        for (let i = 0; i < add.length; i++) {
            if (/Jumlah|IP/.test(add[i]))
                bb += `*${add[i].trim().replace('\t', '')}*\n`
        }

        await sock.sendMessage(sender, { text: `${aa}\n${bb}` }, { quoted: msg })
    } catch (error) {
        await sock.sendMessage(sender, { text: `*Terjadi Kesalahan!*` }, { quoted: msg })
    }
}

module.exports = { loginUadHandler, logoutUadHandler, statusUadHandler, transkripUadHandler, infoPembayaranUadHandler, infoPembayaranUadResponseList, cekTagihanUadHandler, cekTagihanUadResponseList, rekaPresensiUadHandler, rekaPresensiUadResponseList, khsUadHandler, khsUadResponseList }