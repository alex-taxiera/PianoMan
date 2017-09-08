const fs = require('fs')
const func = require('./common.js')
const Client = require('./classes/Client.js')
const data = './data/guilds/'

let clientMap = new Map()

module.exports = {
  initialize: function (guilds, channels) {
    let saves = fs.readdirSync(data).filter((file) => {
      return file.slice(-5) === '.json'
    })
    saves.forEach((save) => {
      save = save.slice(0, -5)
      let guild = guilds.get(save)
      if (!guild) {
        remove(save)
      } else {
        let tmp = {}
        tmp.guild = { id: guild.id, name: guild.name }

        let saveData = JSON.parse(fs.readFileSync(file(save)))
        let savedGuild = saveData.guildInfo
        if (savedGuild.text) {
          let text = channels.get(savedGuild.text.id)
          if (text && func.can(['SEND_MESSAGES', 'READ_MESSAGES'], text)) {
            tmp.text = { id: text.id, name: text.name }
          } else {
            tmp.text = func.findChannel('text', guild.id)
          }
        } else {
          tmp.text = func.findChannel('text', guild.id)
        }

        if (savedGuild.voice) {
          let voice = channels.get(savedGuild.voice.id)
          if (voice && func.can(['SPEAK', 'CONNECT'], voice)) {
            voice.join()
            tmp.voice = { id: voice.id, name: voice.name }
          } else {
            tmp.voice = func.findChannel('voice', guild.id)
          }
        } else {
          tmp.voice = func.findChannel('voice', guild.id)
        }
        tmp.vip = savedGuild.vip

        if (!tmp.text || !tmp.voice) {
          func.dmWarn(guild, tmp.text, tmp.voice)
        }

        let client = new Client(tmp, saveData.playerInfo)
        clientMap.set(guild.id, client)
        write(guild.id, client)
      }
    })

    guilds.forEach((guild) => {
      if (!clientMap.get(guild.id)) {
        add(guild, channels)
      }
    })
  },
  addClient: function (guild, channels) {
    add(guild, channels)
  },
  removeClient: function (id) {
    remove(id)
  },
  getClient: function (id) {
    return clientMap.get(id)
  },
  updateClient: function (id) {
    write(id, clientMap.get(id))
  },
  getGuildInfo: function (id) {
    return clientMap.get(id).guildInfo
  },
  getGameRolesInfo: function (id) {
    return clientMap.get(id).gameRolesInfo
  },
  getPlayerInfo: function (id) {
    return clientMap.get(id).playerInfo
  },
  checkChannels: function (id, channels, channelId) {
    let guildInfo = clientMap.get(id).guildInfo
    let textId = guildInfo.text.id
    let voiceId = guildInfo.voice.id

    if (!channelId || channelId === textId || channelId === voiceId) {
      if (!textId ||
      (textId && !func.can(['SEND_MESSAGES', 'READ_MESSAGES'], channels.get(textId)))) {
        // cannot use current default text channel
        guildInfo.text = func.findChannel('text', id)
      } else if (!voiceId ||
      (voiceId && !func.can(['SPEAK', 'CONNECT'], channels.get(voiceId)))) {
        // cannot use current default voice channel
        guildInfo.voice = func.findChannel('voice', id)
      } else {
        return
      }
      func.dmWarn(id, guildInfo.text, guildInfo.voice)
    }
  }
}

function add (guild, channels) {
  let tmp = {}
  tmp.guild = { id: guild.id, name: guild.name }
  tmp.text = func.findChannel('text', guild.id)
  tmp.voice = func.findChannel('voice', guild.id)

  if (tmp.voice) {
    channels.get(tmp.voice.id).join()
  }
  if (!tmp.text || !tmp.voice) {
    func.dmWarn(guild, tmp.text, tmp.voice)
  }
  let client = new Client(tmp)
  clientMap.set(guild.id, client)
  write(guild.id, client)
}

async function write (id, client) {
  fs.writeFile(file(id), JSON.stringify(client, null, 2), (e) => {
    if (e) {
      throw e
    }
  })
}

async function remove (id) {
  clientMap.delete(id)
  fs.unlink(file(id), (e) => {
    if (e) {
      throw e
    }
  })
}

function file (id) {
  return `${data}${id}.json`
}
