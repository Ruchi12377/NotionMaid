import 'dotenv/config'
import { Client as DiscordClient, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { closeDb, deleteNotionConfig, insertNotionConfig, setupDb } from './util/db.js';
import { getNotionPageIdByServerId } from './util/db.js';
import { extractAllUrls } from './util/extractAllUrls.js';
import { insertPage } from './util/insertPage.js';
// Get the tokens from the environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Create a new Discord client instance
const client = new DiscordClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const commands = [
    {
        name: "register",
        description: "Register the Notion page ID for this server",
        options: [
            {
                name: "pageid",
                type: 3, // STRING
                description: "The Notion page ID to set",
                required: true
            }
        ]
    },
    {
        name: "unregister",
        description: "Unregister the Notion page ID for this server"
    }
];

// When the client is ready, run this code
client.once(Events.ClientReady, async (readyClient) => {
    setupDb();
    await client.application.commands.set(commands, readyClient.guildId);

    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Listen for messages
client.on(Events.MessageCreate, async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if the bot is mentioned
    if (client.user && message.mentions.has(client.user.id)) {
        await onMention(message);
    }
});

// Listen for and handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "register") {
        const pageId = interaction.options.getString("pageid");
        insertNotionConfig(interaction.guildId, pageId);
        await interaction.reply("Notion page ID has been successfully configured");
    } else if (interaction.commandName === "unregister") {
        deleteNotionConfig(interaction.guildId);
        await interaction.reply("Notion page ID removed");
    }
});

// Handle mentions of the bot
async function onMention(message) {
    const urls = extractAllUrls(message.content);

    // If there are no URLs in the message, do nothing
    if (urls.length === 0) return;

    // Get the Notion page ID associated with this Discord server
    const pageId = await getNotionPageIdByServerId(message.guild.id);

    if (pageId == null) {
        await message.channel.send("Notion page ID not found");
        return;
    }

    for (let index = 0; index < urls.length; index++) {
        const url = urls[index];
        console.log(url);
        try {
            const originalTitle = await insertPage(url, pageId);
            await message.channel.send(`「${originalTitle}」の要約が完了しました！`);
        } catch (error) {
            console.error(error);
            await message.channel.send(`「${originalTitle}」の要約に失敗しました。`);
        }
    }
}

// Log in to Discord with your client's token
try {
    if (DISCORD_TOKEN) {
        await client.login(DISCORD_TOKEN);
    } else {
        throw new Error("DISCORD_TOKEN environment variable not set.");
    }
} catch (error) {
    console.error(`An error occurred: ${error}`);
}

// Add a signal listener that closes the DB upon termination
process.on("SIGINT", () => {
    closeDb();
    process.exit(0);
});
