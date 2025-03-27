import { Builder, By, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";


export async function fetchChatGPTContent(url) {
    // Setup Chrome options for headless mode
    const options = new Options();
    options.addArguments("--headless");
    options.addArguments("--disable-gpu");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");

    // Initialize the WebDriver with headless options
    const driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

    try {
        // Navigate to the shared ChatGPT link
        await driver.get(url);

        // Wait for articles to load
        await driver.wait(until.elementLocated(By.css("article")), 10000);

        // Find all article elements
        const articles = await driver.findElements(By.css("article"));

        // Extract conversation turn number and create sortable pairs [number, element]
        const articlePairs = [];
        for (const article of articles) {
            try {
                const dataTestId = await article.getAttribute("data-testid");
                if (dataTestId?.startsWith("conversation-turn-")) {
                    const turnNumber = Number.parseInt(
                        dataTestId.replace("conversation-turn-", ""),
                        10,
                    );
                    if (!Number.isNaN(turnNumber)) {
                        articlePairs.push([turnNumber, article]);
                    }
                }
            } catch (err) {
                console.warn("Error processing an article:", err);
            }
        }

        // Sort articles by conversation turn number
        articlePairs.sort((a, b) => a[0] - b[0]);

        // Extract content from each article in order
        let combinedContent = "";
        for (const [_turnNumber, article] of articlePairs) {
            const content = await article.getText();
            const firstLine = content.split("\n")[0];
            const icon = firstLine.includes("You said:") ? "👤" : "🤖";
            const remainingLines = content.split("\n").slice(1).join("\n");
            combinedContent += `${icon} ${remainingLines}\n\n`
        }

        return combinedContent;
    } catch (error) {
        console.error("Error fetching content:", error);
        return null;
    } finally {
        // Quit the WebDriver
        await driver.quit();
    }
}
