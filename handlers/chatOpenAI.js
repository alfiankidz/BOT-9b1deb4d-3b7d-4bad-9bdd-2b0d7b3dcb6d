const axios = require('axios')
const UA = require('random-useragent');
const settings = require('../configs/settings.json')

const openAIHandler = async (sock, sender, args, msg) => {
    if (args.length === 0)
        return await sock.sendMessage(sender, { text: `_*[OpenAI ChatGPT]*_\n\nChatGPT merupakan sebuah kecerdasan buatan atau Artificial Intelligence, program pembelajaran mesin ini dikembangkan oleh OpenAI. ChatGPT adalah sebuah program ChatBot yang dapat menjawab hampir semua pertanyaan.\n\nContoh : *${settings.prefix}ai cara memasak indomie*` }, { quoted: msg });

    var keyword = ''
    for (let i = 0; i < args.length; i++) {
        keyword += args[i] + ' '
    }
    await sock.sendMessage(sender, { text: `_Sek lagi diproses ...._` }, { quoted: msg });

    axios.post('https://api.openai.com/v1/completions', {
        model: 'text-davinci-003',
        prompt: keyword,
        max_tokens: 1000,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    }, {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': UA.getRandom(),
            'Authorization': `Bearer ${settings.KEY_OPENAI}`
        }
    }).then(response => {
        if (response.status === 200) {
            var hasil = response.data?.choices?.[0].text.trim() || 'Saya tidak tahu';
            sock.sendMessage(sender, { text: `Q : _*${keyword.trim()}*_\n\n${hasil}` });
        }
    }).catch(error => {
        sock.sendMessage(sender, { text: `_Error, Silahkan coba lagi..._` });
    });
}

module.exports = { openAIHandler }