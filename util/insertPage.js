import 'dotenv/config';
import { Client as NotionClient } from "@notionhq/client";
import { markdownToBlocks } from '@tryfabric/martian';
import { getContentByUrl } from "./getContentByUrl.js";
import { fetchChatGPTContent } from "./getContentFromChatGPT.js";
import { getTitleAboutConversation } from "./getTitleAboutConversation.js";
import { summarizeText } from "./summarizeText.js";

const NOTION_TOKEN = process.env.NOTION_TOKEN;

// Initialize the Notion client
const notion = new NotionClient({
    auth: NOTION_TOKEN,
});

export async function insertPage(url, pageId) {
    if (pageId == null) {
        throw new Error("Notion page ID not found");
    }

    if (url.startsWith("https://chatgpt.com/share")) {
        return chatGPT(url, pageId);
    }

    return otherSites(url, pageId);
}

async function chatGPT(url, pageId) {
    const conversation = await fetchChatGPTContent(url);

    const { title } = await getTitleAboutConversation(conversation);
    const urlMd = `🌏 [要約元リンク](${url})`;
    const blocks = markdownToBlocks(`${urlMd}\n${conversation}`);

    await notion.pages.create({
        parent: { page_id: pageId },
        properties: {
            title: [
                { text: { content: title } }
            ],
        },
        children: blocks
    });

    return title;
}

async function otherSites(url, pageId) {
    const { title: originalTitle, markdown } = await getContentByUrl(url);

    if (markdown === "") throw new Error("Failed to get content from URL");

    const { title, tags, content } = await summarizeText(markdown);
    const tagMd = `📝 ${tags.split(",").map((tag) => `\`${tag.trim()}\``).join(" ")}`;
    const urlMd = `🌏 [要約元リンク](${url})`;
    const blocks = markdownToBlocks(`${tagMd}\n${urlMd}\n${content}`);

    await notion.pages.create({
        parent: { page_id: pageId },
        properties: {
            title: [
                { text: { content: title } }
            ],
        },
        children: blocks
    });

    return originalTitle;
}