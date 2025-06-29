const mineflayer = require('mineflayer');
const http = require('http');

// === CONFIGURATION ===
const BASE_BOT_NAME = process.env.BOT_USERNAME || "AternosBot";
const SERVER_IP = process.env.SERVER_IP || "itachi95.aternos.me";
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 13889;

// === BOT LOGIC ===
function getRandomBotName() {
  // Add 4 random digits to base name
  return BASE_BOT_NAME + Math.floor(1000 + Math.random() * 9000);
}

function createBot() {
  const botUsername = getRandomBotName();
  console.log(`Starting bot with username: ${botUsername}`);
  const bot = mineflayer.createBot({
    host: SERVER_IP,
    port: SERVER_PORT,
    username: botUsername,
    version: false
  });

  function randomMove() {
    if (!bot.entity || !bot.entity.position) return;
    const actions = [
      () => bot.setControlState('forward', true),
      () => bot.setControlState('back', true),
      () => bot.setControlState('left', true),
      () => bot.setControlState('right', true),
      () => bot.setControlState('jump', true),
      () => bot.setControlState('sneak', true),
      () => bot.setControlState('sprint', true),
      () => bot.setControlState('jump', false),
      () => bot.setControlState('sneak', false),
      () => bot.setControlState('forward', false),
      () => bot.setControlState('back', false),
      () => bot.setControlState('left', false),
      () => bot.setControlState('right', false),
      () => bot.setControlState('sprint', false),
    ];
    const action = actions[Math.floor(Math.random() * actions.length)];
    action();
    setTimeout(randomMove, 5000 + Math.random() * 5000);
  }

  bot.on('spawn', () => {
    console.log('Bot spawned! Starting random movement.');
    randomMove();
  });

  bot.on('end', () => {
    console.log('Bot disconnected, reconnecting in 10 seconds with a new name...');
    setTimeout(createBot, 10000);
  });

  bot.on('error', err => {
    console.log('Bot error:', err.message, 'Reconnecting in 15 seconds with a new name...');
    setTimeout(createBot, 15000);
  });

  bot.on('kicked', (reason) => {
    console.log('Bot was kicked:', reason, 'Reconnecting in 15 seconds with a new name...');
    setTimeout(createBot, 15000);
  });
}

// Start the bot
createBot();

// UptimeRobot Web Server
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running!');
}).listen(PORT, () => {
  console.log(`HTTP server for UptimeRobot started on port ${PORT}`);
});
