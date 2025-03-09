import { Readability } from "@mozilla/readability";
import axios from "axios";
import { JSDOM } from "jsdom";
import TurndownService from 'turndown'

/**
 * URLからコンテンツを取得し、メタデータとコンテンツを返す
 * @param {string} url - 取得するURL
 * @returns {Promise<{ title: string; markdown: string }>} - メタデータとコンテンツ
 */
export async function getContentByUrl(url) {
    try {
        // URLからデータを取得
        const response = await axios.get(url);
        const html = response.data;

        // Readabilityを使用してメインコンテンツを抽出
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article) {
            return { title: "", markdown: "" };
        }

        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(article.content ?? "");

        return { title: article.title ?? "", markdown: markdown };
    } catch (e) {
        throw new Error(`Error in getContentByUrl: ${e}`);
    }
}
