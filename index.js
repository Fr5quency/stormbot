const mineflayer = require('mineflayer')

function createBot() {
  const bot = mineflayer.createBot({
    host: 'stormsmps3.aternos.me',
    port: 29739,
    username: 'Storm_coreafkbot',
    version: '1.20.1',
    auth: 'offline'
  })

  bot.on('spawn', () => {
    console.log('storm Bot is online! 🔥')

    // Anti AFK - moves every 30 seconds
    setInterval(() => {
      bot.setControlState('jump', true)
      setTimeout(() => {
        bot.setControlState('jump', false)
      }, 500)
    }, 30000)
  })

  bot.on('kicked', (reason) => {
    console.log('Bot got kicked:', reason)
    setTimeout(createBot, 5000)
  })

  bot.on('error', (err) => {
    console.log('Error:', err)
    setTimeout(createBot, 5000)
  })

  bot.on('end', () => {
    console.log('Bot disconnected, reconnecting...')
    setTimeout(createBot, 5000)
  })
}

createBot()
