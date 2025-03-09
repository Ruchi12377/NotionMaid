import 'dotenv/config'
import { Client as NotionClient } from "@notionhq/client";
import { markdownToBlocks } from '@tryfabric/martian';
import { Client as DiscordClient, Events, GatewayIntentBits } from "discord.js";
import { getContentByUrl } from "./util/getContentByUrl.js";
import { hasUrlInMessage } from "./util/hasUrlInMessage.js";
import { summarizeText } from "./util/summarizeText.js";

// Get the tokens from the environment variables
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID;

// Initialize the Notion client
const notion = new NotionClient({
    auth: NOTION_TOKEN,
});

// Create a new Discord client instance
const client = new DiscordClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// When the client is ready, run this code
client.once(Events.ClientReady, (readyClient) => {
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

// Handle mentions of the bot
async function onMention(message) {
    const url = hasUrlInMessage(message.content);

    // If there's no URL in the message, do nothing
    if (!url) return;

    try {
        const { title: originalTitle, markdown } = await getContentByUrl(url);

        const { title, tags, content } = await summarizeText(markdown);
        const tagMd = `📝 ${tags.split(",").map((tag) => `\`${tag.trim()}\``).join(" ")}`;
        const urlMd = `🌏 [要約元リンク](${url})`;
        const blocks = markdownToBlocks(`${tagMd}\n${urlMd}\n${content}`);

        await notion.pages.create({
            parent: { page_id: NOTION_PAGE_ID },
            properties: {
                title: [
                    { text: { content: title } }
                ],
            },
            children: blocks
        });

        await message.channel.send(`「${originalTitle}」の要約が完了しました！`);
    } catch (error) {
        console.error(error);
        await message.channel.send(`An error occurred: ${error}`);
    }
}

// Log in to Discord with your client's token
try {
    if (DISCORD_TOKEN) {
        client.login(DISCORD_TOKEN);
    } else {
        throw new Error("DISCORD_TOKEN environment variable not set.");
    }
} catch (error) {
    console.error(`An error occurred: ${error}`);
}
