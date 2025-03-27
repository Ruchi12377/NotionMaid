import 'dotenv/config';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const schema = {
    description: "Title of an article",
    type: SchemaType.OBJECT,
    properties: {
        title: {
            type: SchemaType.STRING,
            description: "Title of the article",
            nullable: false,
        },
    },
    required: ["title"],
};

const prompt = `あなたはwebサイト上からスクレイピングされたテキストにタイトルをつけるAIです。
これからユーザーとAIの会話を入力します。そのテキストの話題合った簡潔で適切なタイトルをつけてください。

タイトルについて
- タイトルは記事の内容次第で適切なものを考えることができます。
- タイトルは一文で簡潔なものにして下さい。`;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function getTitleAboutConversation(text) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: prompt,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const result = await model.generateContent(text);
    const response = result.response.text();
    return JSON.parse(response);
}