const express = require('express')
const dotenv = require("dotenv");
const cors = require("cors");

const { Configuration, OpenAIApi } = require("openai");
const TelegramBot = require('node-telegram-bot-api');

dotenv.config();
const configration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configration);

const app = express();
app.use(cors());
app.use(express.json());
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });


let conversationHistory = [];

// listen for incoming messages

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const question = msg.text;
  if (question === '/start') {
    return;
  }
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: 'you are bino, an AI created by bino dev to assist developers.' },
        ...conversationHistory, // include previous messages 
        { role: "user", content: `${question}` }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = response.data.choices[0].message;
    conversationHistory.push(answer);

    // send answer to user
    bot.sendMessage(chatId, answer.content);
  } catch (error) {
    console.log(error);
    bot.sendMessage(chatId, 'Something went wrong');
  }
});


app.listen(8000, () => {
  console.log("App is running");
});

app.get('/api', function (req, res) {
  res.send('Hello World!');
});
