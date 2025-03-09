import 'dotenv/config';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const schema = {
    description: "Summary of an article",
    type: SchemaType.OBJECT,
    properties: {
        title: {
            type: SchemaType.STRING,
            description: "Title of the article",
            nullable: false,
        },
        tags: {
            type: SchemaType.STRING,
            description: "Tags associated with the article",
            nullable: false,
        },
        content: {
            type: SchemaType.STRING,
            description: "Summary of the article",
            nullable: false,
        },
    },
    required: ["title", "tags", "content"],
};

const prompt = `あなたはwebサイト上からスクレイピングされたテキストを要約するAIです。
これからユーザーがテキストを入力します。そのテキストを日本語で要約してください。

タイトルについて
- タイトルは、元のテキストのタイトルを元に考えてください。
- タイトルは記事の内容次第で適切なものを考えることができます。

タグについて
- 記事の内容に基づいて適切なタグを選択してください。
- タグは複数選択することができます。
- 技術記事の場合、具体的な技術名をタグに追加してください。
- 大まかな言語やフレームワークをタグに追加してください。
- 具体的な関数やメソッド名はタグに追加しないでください。
- Rust, JavaScript, C, TypeScriptなどは適切なタグです。
- 具体的な関数であるraw-window-handle,main, console.log, printfなどは適切なタグではありません。

コンテンツについて、要約する際には以下の点を考慮してください
- 要約の結果にはMarkdownを用いることができます。
- 要約はできるだけテキストだけではなく、箇条書きやリストを用いてわかりやすく要約してください。
- 元の記事が構造的になっている場合、箇条書き等を用いてわかりやすく要約してください。
- 要約時は元のテキストの要点を押さえ、冗長な情報は省いてください。
- 要約の結果は日本語で出力してください。
- 要約の結果には、元のテキストのリンクを含めないでください。
- 元のテキストには記事の本文以外にも、広告やコメントなどが含まれることがありますが、要約の際には本文のみを要約してください。`;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function summarizeText(text) {
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
