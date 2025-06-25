const mineflayer = require('mineflayer');
const express = require('express');

// ==== CONFIG ====
const MINECRAFT_HOST = 'Itachi95.aternos.me';
const MINECRAFT_PORT = 13889;
const MINECRAFT_USERNAME = 'itssteve'; // Change to any unique name not used by a player

// ==== HEALTH CHECK SERVER ====
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => res.send('OK'));
app.get('/', (req, res) => res.send('Hello from the Minecraft AFK bot!'));
app.listen(PORT, () => console.log(`Health check running on port ${PORT}`));

// ==== MINECRAFT BOT SETUP ====
function createBot() {
  const bot = mineflayer.createBot({
    host: MINECRAFT_HOST,
    port: MINECRAFT_PORT,
    username: MINECRAFT_USERNAME,
    version: false // Auto-detect version
  });

  // Movement logic
  function randomMovement() {
    const actions = ['forward', 'back', 'left', 'right', 'jump', 'sneak', 'stop'];
    const action = actions[Math.floor(Math.random() * actions.length)];

    // Reset movement
    bot.setControlState('forward', false);
    bot.setControlState('back', false);
    bot.setControlState('left', false);
    bot.setControlState('right', false);
    bot.setControlState('jump', false);
    bot.setControlState('sneak', false);

    switch (action) {
      case 'forward':
      case 'back':
      case 'left':
      case 'right':
        bot.setControlState(action, true);
        break;
      case 'jump':
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        break;
      case 'sneak':
        bot.setControlState('sneak', true);
        setTimeout(() => bot.setControlState('sneak', false), 2000);
        break;
      case 'stop':
      default:
        // all movement reset above
        break;
    }
  }

  bot.on('spawn', () => {
    setInterval(randomMovement, 4000 + Math.random() * 4000);
    bot.chat('Hello! itssteve is online to keep the server alive.');
  });

  bot.on('login', () => {
    console.log(`Bot logged in as ${MINECRAFT_USERNAME}`);
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
