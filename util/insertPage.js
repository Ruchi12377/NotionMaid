import 'dotenv/config';
import { Client as NotionClient } from "@notionhq/client";
import { markdownToBlocks } from '@tryfabric/martian';
import { getContentByUrl } from "./getContentByUrl.js";
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

    try {
        const { title: originalTitle, markdown } = await getContentByUrl(url);

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
    } catch (error) {
        console.error(error);
    }

    return originalTitle;
}