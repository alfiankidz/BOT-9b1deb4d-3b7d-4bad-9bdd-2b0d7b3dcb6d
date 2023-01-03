const {
  default: makeWASocket,
  MessageType,
  MessageOptions,
  Mimetype,
  DisconnectReason,
  BufferJSON,
  WA_DEFAULT_EPHEMERAL,
  Presence,
  downloadMediaMessage,
  useMultiFileAuthState,
} = require("@adiwajshing/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const { writeFile } = require("fs/promises")
const ffmpeg = require('fluent-ffmpeg')
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter')

const settings = JSON.parse(fs.readFileSync("./configs/settings.json"));
const test = JSON.parse(fs.readFileSync("./configs/test.json"));

var allowedNum = settings.allowed;
var prefix = settings.prefix;
const getRandom = (ext) => { return `${Math.floor(Math.random() * 10000)}${ext}` }

const { startHandler, menu1Handler, menu2Handler } = require("./handlers/start_menu");
const { waktuindoHandler } = require("./handlers/waktuindo");
const { dsntifHandler, dsnpbioHandler, klnderakdmkHandler, dsnactHandler, newsUadHandler, kataBijakHandler, peribahasaHandler } = require("./handlers/webScrape");
const { imgSrchPintHandler, imgSrchGoogleHandler, jadwalsholatHandler, asmaulhusnaHandler } = require("./handlers/bochilScraper");
const { ytmp4Handler, ytmp3Handler, ythumbHandler, igreelHandler, igpostHandler, twdlHandler } = require("./handlers/downloader");
const { openAIHandler } = require("./handlers/chatOpenAI");
const { loginUadHandler, logoutUadHandler, statusUadHandler, transkripUadHandler, infoPembayaranUadHandler, infoPembayaranUadResponseList, cekTagihanUadHandler, cekTagihanUadResponseList, rekaPresensiUadHandler, rekaPresensiUadResponseList, khsUadHandler, khsUadResponseList } = require("./handlers/portalUadHandler");
const { ssHandler } = require("./handlers/puppeteerHandler");

const main = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  async function connectToWhatsApp() {
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    sock.ev.on("connection.update", (update) => {
      //console.log(update);
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect.error = Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;
        console.log(
          "connection closed due to ",
          lastDisconnect.error,
          ", reconnecting ",
          shouldReconnect
        );
        // reconnect if not logged out
        if (shouldReconnect) {
          connectToWhatsApp();
        }
      } else if (connection === "open") {
        console.log("opened connection");
      }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
      // msg = JSON.parse(JSON.stringify(messages)).messages[0];
      msg = messages[0];
      if (!msg.message) return;
      const type = Object.keys(msg.message)[0];
      const content = JSON.stringify(msg.message);
      const from = msg.key.remoteJid;
      // const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType;

      body = (type === 'conversation' && msg.message.conversation.startsWith(prefix)) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption.startsWith(prefix) ? msg.message.imageMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption.startsWith(prefix) ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text.startsWith(prefix) ? msg.message.extendedTextMessage.text : ''

      const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
      const args = body.trim().split(/ +/).slice(1)
      const isCmd = body.startsWith(prefix)

      const botNumber = settings.botNum
      const isGroup = from.endsWith('@g.us')
      const sender = isGroup ? msg.key.remoteJid : msg.key.remoteJid
      const senderName = isGroup ? msg.pushName : msg.pushName

      const reply = (teks) => {
        sock.sendMessage(from, teks, {
          quoted: msg
        })
      }
      const send = (teks) => {
        sock.sendMessage(from, teks)
      }

      const presence = (tipe) => {
        sock.updatePresence(sender, Presence + `.${tipe}`)
      }

      const isMedia = (type === 'imageMessage' || type === 'videoMessage')
      const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
      const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
      const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
      const responseList = msg.message.listResponseMessage;
      const responseButton = msg.message.buttonsResponseMessage;
      const btnId = responseButton ? responseButton.selectedButtonId : '';
      const listId = responseList ? responseList.singleSelectReply.selectedRowId : '';

      // Sementara Ga Bisa Group
      if (isGroup || !allowedNum.includes(sender.replace("@s.whatsapp.net", ""))) return;
      if (settings.dev === true && sender.replace("@s.whatsapp.net", "") !== '62895360702055') return

      switch (command) {
        case 'mulai':
        case 'start':
        case 'menu':
          startHandler(sock, sender, msg);
          break;
        case 'sticker':
        case 'stiker':
          packName = `Generated by ${settings.namaBot}`
          authorName = senderName

          if ((isMedia && !msg.message.videoMessage || isQuotedImage)) {
            reply({ text: '_Sek lagi diproses ...._' })
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
            const media = await downloadMediaMessage(encmedia, 'buffer', {})
            ran = getRandom('.webp')
            await writeFile(ran, media)

            const sticker = new Sticker(ran, {
              // pack: packName,
              author: authorName,
              // type: StickerTypes.FULL,
              quality: 60
            })
            reply(await sticker.toMessage())
            fs.unlinkSync(ran)
          } else {
            reply({ text: '_*Cara mengubah Gambar Menjadi Sticker :*_ \n1. Lakukan *reply* gambar dan tambahkan caption *.sticker*\n2. Kirimkan gambar dan tambahkan caption *.sticker*' })
          }

          break;
        case 'toimg':
          if (isQuotedSticker) {
            try {
              const encmedia = isQuotedSticker ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
              const media = await downloadMediaMessage(encmedia, 'buffer', {})
              ran = getRandom(`-${sender}.jpg`)
              reply({ text: '_Sek lagi diproses ...._' })
              await writeFile(`./${ran}`, media)
              await reply({
                image: { url: `./${ran}` },
                caption: "_Ini dia hasilnya..._",
              })
              // await fs.unlink(`./${ran}`);

            } catch (error) {
              reply({ text: 'ERROR: Silahkan coba lagi!' })
            }
          } else {
            reply({ text: '_*Cara mengubah Sticker Menjadi Gambar :*_ \nLakukan *reply* pada sticker dan tambahkan caption *.toimg*' })
          }
          break;
        case 'waktu':
          waktuindoHandler(sock, sender, msg);
          break;
        case 'pinterest':
          imgSrchPintHandler(sock, sender, args, msg);
          break;
        case 'google':
          imgSrchGoogleHandler(sock, sender, args, msg);
          break;
        case 'dsntif':
          dsntifHandler(sock, sender, msg);
          break;
        case 'dsnact':
          dsnactHandler(sock, sender, msg);
          break;
        case 'dsnpbio':
          dsnpbioHandler(sock, sender, msg);
          break;
        case 'klnderakdmk':
          klnderakdmkHandler(sock, sender, msg);
          break;
        case 'ytmp4':
          ytmp4Handler(sock, sender, args, msg);
          break;
        case 'ytmp3':
          ytmp3Handler(sock, sender, args, msg);
          break;
        case 'ythumb':
          ythumbHandler(sock, sender, args, msg);
          break;
        case 'igreel':
          igreelHandler(sock, sender, args, msg);
          break;
        case 'igpost':
          igpostHandler(sock, sender, args, msg);
          break;
        case 'twdl':
          twdlHandler(sock, sender, args, msg);
          break;
        case 'ai':
          openAIHandler(sock, sender, args, msg);
          break;
        case 'jadwalsholat':
          jadwalsholatHandler(sock, sender, args, msg);
          break;
        case 'asmaulhusna':
          asmaulhusnaHandler(sock, sender, args, msg);
          break;
        case 'bijak':
          kataBijakHandler(sock, sender, msg);
          break;
        case 'peri':
          peribahasaHandler(sock, sender, msg);
          break;
        case 'loginuad':
          loginUadHandler(sock, sender, args, msg);
          break;
        case 'logoutuad':
          logoutUadHandler(sock, sender, msg);
          break;
        case 'statusmhsuad':
          statusUadHandler(sock, sender, msg);
          break;
        case 'transkripuad':
          transkripUadHandler(sock, sender, msg);
          break;
        case 'infopembayaranuad':
          infoPembayaranUadHandler(sock, sender, msg);
          break;
        case 'cektagihanuad':
          cekTagihanUadHandler(sock, sender, msg);
          break;
        case 'rekapresensiuad':
          rekaPresensiUadHandler(sock, sender, msg);
          break;
        case 'khsuad':
          khsUadHandler(sock, sender, msg);
          break;
        case 'newsuad':
          newsUadHandler(sock, sender, msg);
          break;
        case 'ss':
          ssHandler(sock, sender, args, msg);
          break;
        case 'mp3':
          sock.sendMessage(sender, { audio: { url: "./test.mp3" }, mimetype: 'audio/mp4' })
          break;
        case 'buff':
          // const buffer = fs.readFileSync("./62895360702055@s.whatsapp.net-ss.png")
          // sock.sendMessage(sender, { image: buffer, mimetype: 'image/jpg' })
          await sock.sendMessage(sender, { text: 'kompetisi kegiatan Latihan Keterampilan Manajemen Mahasiswa (LKMM) Tingkat Dasar se-DIY pada Kamis, 29 Desember 2022. Bertempat di Auditorium Kampus II Unit A UAD, acara tersebut dihadiri juga oleh pimpinan bidang kemahasiswaan dari universitas kolaborasi.\n\u200FAlfian Hakim' })
          break;

        default:
          break;
      }

      if (responseButton) {
        var splitId = btnId.split('||');
        switch (splitId[0]) {
          case 'btnMenu1':
            menu1Handler(sock, sender, msg)
            break;
          case 'btnMenu2':
            menu2Handler(sock, sender, msg)
            break;

          default:
            break;
        }
      }

      if (responseList) {
        var splitId = listId.split('||');
        switch (splitId[0]) {
          case 'dsnTif':
            reply({ text: '_Tunggu bentar..._' })
            send({ image: { url: splitId[2] }, caption: `*${splitId[1]}*\n${splitId[3]}` })
            break;
          case 'dsnAct':
            reply({ text: '_Tunggu bentar..._' })
            send({ image: { url: splitId[2] }, caption: `*${splitId[1]}*\n${splitId[3]}` })
            break;
          case 'dsnPbio':
            reply({ text: '_Tunggu bentar..._' })
            send({ image: { url: splitId[2] }, caption: `*${splitId[1]}*\n${splitId[3]}` })
            break;
          case 'klnderAkdmk':
            reply({ text: '_Tunggu bentar..._' })
            send({ document: { url: splitId[2] }, caption: `*${splitId[1]}*` })
            break;
          case 'igPostAll':
            reply({ text: '_Tunggu lagi didownload..._' })
            var links = JSON.parse(splitId[1])
            for (let i = 0; i < links.length; i++) {
              if (links[i].includes('jpg'))
                send({ image: { url: links[i] } })
              if (links[i].includes('mp4'))
                send({ video: { url: links[i] } })
            }
            break;
          case 'igPostEach':
            reply({ text: '_Tunggu lagi didownload..._' })
            var links = splitId[1]
            if (links.includes('jpg'))
              send({ image: { url: links } })
            if (links.includes('mp4'))
              send({ video: { url: links } })
            break;
          case 'igPostImgOnly':
            reply({ text: '_Tunggu lagi didownload..._' })
            var links = JSON.parse(splitId[1])
            for (let i = 0; i < links.length; i++) {
              if (links[i].includes('jpg'))
                send({ image: { url: links[i] } })
            }
            break;
          case 'igPostVidOnly':
            reply({ text: '_Tunggu lagi didownload..._' })
            var links = JSON.parse(splitId[1])
            for (let i = 0; i < links.length; i++) {
              if (links[i].includes('mp4'))
                send({ video: { url: links[i] } })
            }
            break;

          case 'twPostAll':
            reply({ text: '_Tunggu lagi didownload..._' })
            var links = JSON.parse(splitId[1])
            for (let i = 0; i < links.length; i++) {
              if (links[i].includes('jpg'))
                send({ image: { url: links[i] } })
              if (links[i].includes('mp4'))
                send({ video: { url: links[i] } })
            }
            break;
          case 'twPostEach':
            reply({ text: '_Tunggu lagi didownload..._' })
            var links = splitId[1]
            if (links.includes('jpg'))
              send({ image: { url: links } })
            if (links.includes('mp4'))
              send({ video: { url: links } })
            break;
          case 'twPostImgOnly':
            reply({ text: '_Tunggu lagi didownload..._' })
            var links = JSON.parse(splitId[1])
            for (let i = 0; i < links.length; i++) {
              if (links[i].includes('jpg'))
                send({ image: { url: links[i] } })
            }
            break;
          case 'twPostVidOnly':
            reply({ text: '_Tunggu lagi didownload..._' })
            var links = JSON.parse(splitId[1])
            for (let i = 0; i < links.length; i++) {
              if (links[i].includes('mp4'))
                send({ video: { url: links[i] } })
            }
            break;
          case 'infoBayarUad':
            infoPembayaranUadResponseList(sock, sender, splitId[1], msg)
            break;
          case 'cekTagihanUad':
            cekTagihanUadResponseList(sock, sender, splitId[1], splitId[2], msg)
            break;
          case 'rekaPresensiUad':
            rekaPresensiUadResponseList(sock, sender, splitId[1], splitId[2], msg)
            break;
          case 'khsUad':
            khsUadResponseList(sock, sender, splitId[1], splitId[2], msg)
            break;

          default:
            break;
        }
      }

    });
  }
  // run in main file
  connectToWhatsApp().catch((err) => console.log("unexpected error: " + err)); // catch any errors
};

main();
