const mineflayer = require('mineflayer');
const axios = require('axios');
const express = require('express');

// ==== CONFIG ====
const MINECRAFT_HOST = 'Itachi95.aternos.me';
const MINECRAFT_PORT = 13889;
const MINECRAFT_USERNAME = 'AI'; // Bot's name set to AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDuLPCqWPkkNIXuzHsijqGtZFnT3J7MOn8';

// ==== HEALTH CHECK SERVER FOR UPTIMEROBOT ====
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/health', (req, res) => res.send('OK'));
app.listen(PORT, () => console.log(`Health check running on port ${PORT}`));

// ==== GEMINI 2.0 FLASH CALL ====
async function askGemini(prompt) {
  try {
    const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-latest:generateContent';
    const response = await axios.post(
      url + '?key=' + GEMINI_API_KEY,
      {
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return (
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, AI couldn't respond."
    );
  } catch (err) {
    console.error('Gemini error:', err.response?.data || err.message);
    return "Sorry, AI request failed.";
  }
}

// ==== MINECRAFT BOT SETUP ====
function createBot() {
  const bot = mineflayer.createBot({
    host: MINECRAFT_HOST,
    port: MINECRAFT_PORT,
    username: MINECRAFT_USERNAME,
    version: false // Auto-detect version
  });

  bot.on('login', () => {
    console.log(`Bot logged in as ${MINECRAFT_USERNAME}`);
    bot.chat('Hello! I am Gemini AI bot 🤖');
    startAfkMovement(bot);
  });

  // Respond to chat messages that mention the bot's name or start with !
  bot.on('chat', async (username, message) => {
    if (username === bot.username) return; // Ignore self

    if (
      message.toLowerCase().includes('ai') ||
      message.startsWith('!ai ')
    ) {
      const prompt = message.replace(/^!ai /i, '').replace(/ai/i, '').trim();
      if (!prompt) {
        bot.chat('Ask me something! Example: !ai What is the meaning of life?');
        return;
      }
      bot.chat('Thinking...');
      const aiReply = await askGemini(prompt);
      // Mineflayer chat limit: 256 chars
      aiReply.match(/.{1,240}/g)?.forEach(chunk => bot.chat(chunk));
    }
  });

  bot.on('error', err => {
    console.error('Bot error:', err);
  });
  bot.on('end', () => {
    console.log('Bot disconnected, retrying in 10s...');
    setTimeout(createBot, 10000);
  });

  return bot;
}

createBot();

// ==== AFK MOVEMENT LOGIC ====
function startAfkMovement(bot) {
  function randomAction() {
    const actions = [
      () => bot.setControlState('forward', true),    // start walking forward
      () => bot.setControlState('back', true),       // start walking back
      () => bot.setControlState('left', true),       // start walking left
      () => bot.setControlState('right', true),      // start walking right
      () => bot.setControlState('jump', true),       // jump
      () => bot.setControlState('sneak', true),      // start sneaking
    ];
    const stops = [
      () => bot.setControlState('forward', false),
      () => bot.setControlState('back', false),
      () => bot.setControlState('left', false),
      () => bot.setControlState('right', false),
      () => bot.setControlState('jump', false),
      () => bot.setControlState('sneak', false),
    ];

    // Randomly pick an action to start
    const actionIndex = Math.floor(Math.random() * actions.length);
    actions[actionIndex]();

    // Randomly stop all actions after 1-2 seconds
    setTimeout(() => {
      stops.forEach(fn => fn());
    }, 1000 + Math.random() * 1000);
  }

  // Move every 10-30 seconds
  setInterval(randomAction, 10000 + Math.random() * 20000);
}
