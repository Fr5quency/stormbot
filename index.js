const mineflayer = require('mineflayer')
const fs = require('fs')
const path = require('path')

const PASSWORD = '000055556'
// Remembers whether the bot has already registered on the server
const REGISTERED_FILE = path.join(__dirname, 'registered.json')

function isRegistered() {
  try {
    return JSON.parse(fs.readFileSync(REGISTERED_FILE, 'utf8')).registered === true
  } catch {
    return false
  }
}

function markRegistered() {
  fs.writeFileSync(REGISTERED_FILE, JSON.stringify({ registered: true }))
}

function createBot() {
  const bot = mineflayer.createBot({
    host: 'stormSurvivals1.aternos.me',
    port: 12311,
    username: 'stormycore',
    version: '1.20.1',
    auth: 'offline'
  })

  let authSent = false
  let reconnecting = false
  let afkInterval = null

  function register() {
    console.log('First join - registering...')
    bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
    markRegistered()
    authSent = true
  }

  function login() {
    console.log('Already registered - logging in...')
    bot.chat(`/login ${PASSWORD}`)
    authSent = true
  }

  // React to the server's auth plugin prompts (e.g. AuthMe)
  bot.on('messagestr', (message) => {
    const msg = message.toLowerCase()

    if (msg.includes('already registered')) {
      markRegistered()
      login()
      return
    }

    if (authSent) return

    if (msg.includes('/register')) {
      register()
    } else if (msg.includes('/login')) {
      markRegistered()
      login()
    }
  })

  bot.once('spawn', () => {
    console.log('storm Bot is online! 🔥')

    // Fallback: if the server didn't prompt us, decide based on saved state
    setTimeout(() => {
      if (authSent) return
      if (isRegistered()) login()
      else register()
    }, 3000)

    // Anti AFK - jumps every 30 seconds
    afkInterval = setInterval(() => {
      bot.setControlState('jump', true)
      setTimeout(() => {
        bot.setControlState('jump', false)
      }, 500)
    }, 30000)
  })

  function reconnect() {
    if (reconnecting) return
    reconnecting = true
    clearInterval(afkInterval)
    console.log('Bot disconnected, reconnecting in 5s...')
    setTimeout(createBot, 5000)
  }

  bot.on('kicked', (reason) => {
    console.log('Bot got kicked:', reason)
  })

  bot.on('error', (err) => {
    console.log('Error:', err)
    reconnect()
  })

  bot.on('end', reconnect)
}

createBot()
