import { Client } from "@notionhq/client";
import Parser from "rss-parser";
import { CronJob } from "cron";
import { createNoteBody } from "./utils/note";
import { FeedItem } from "./utils/types";
import connectDatabase from "./db/database";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID as string;
const feedUrl = process.env.RSS_FEED_URL as string;

// Function to create Notion pages from RSS entries
async function createNotionPage(entry: FeedItem, databaseId: string) {
  try {
    const body = createNoteBody(entry, databaseId);
    const response = await notion.pages.create(body);
  } catch (error) {
    console.error("Error creating Notion pages:", error);
  }
}

// createNotionPages(feedUrl, databaseId);

async function getRSSFeed(rssUrl: string) {
  const parser = new Parser();

  try {
    const parsedFeed = await parser.parseURL(rssUrl);
    return parsedFeed.items;
  } catch (error) {
    console.error("Error parsing RSS feed:", error);
  }
}

getRSSFeed(feedUrl).then((entries) => {
  entries?.forEach((entry) => createNotionPage(entry, databaseId));
});

async function main() {
  await connectDatabase();

  const getEntriesJob = new CronJob(
    "* * * * * ", // cronTime
    function () {
      getRSSFeed(feedUrl);
    }, // onTick
    null, // onComplete
    true, // start
    "America/Mexico_City" // timeZone
  );

  const createNotionPagesJob = new CronJob(
    "* * * * * ", // cronTime
    function () {
      getRSSFeed(feedUrl).then((entries) => {
        entries?.forEach((entry) => createNotionPage(entry, databaseId));
      });
    }, // onTick
    null, // onComplete
    true, // start
    "America/Mexico_City" // timeZone
  );
}

main();
