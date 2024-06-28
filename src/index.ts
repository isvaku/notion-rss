import { Client } from "@notionhq/client";
import Parser from "rss-parser";
import { CronJob } from "cron";
import { createNoteBody } from "./utils/note";
import { FeedItem } from "./utils/types";
import connectDatabase from "./db/database";
import { getEntries, insertEntries } from "./service/entry";
import { IEntry } from "./db/models/entry";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID as string;
const feedUrl = process.env.RSS_FEED_URL as string;

async function createNotionPage(entry: IEntry, databaseId: string) {
  const body = createNoteBody(entry, databaseId);
  return notion.pages.create(body);
}

async function getRSSFeed(rssUrl: string): Promise<FeedItem[]> {
  const parser = new Parser();

  try {
    const parsedFeed = await parser.parseURL(rssUrl);
    return parsedFeed.items;
  } catch (error) {
    console.error("Error parsing RSS feed:", error);
    return [];
  }
}

async function main() {
  await connectDatabase();

  const getEntriesJob = new CronJob(
    "0 * * * * ", // cronTime
    async function () {
      console.log("Getting entries...");
      const feed = await getRSSFeed(feedUrl);
      if (feed.length === 0) {
        console.log("No entries found");
        return;
      }
      await insertEntries(feed);
    }, // onTick
    null, // onComplete
    true, // start
    "America/Mexico_City" // timeZone
  );

  const createNotionPagesJob = new CronJob(
    "10 * * * * ", // cronTime
    async function () {
      console.log("Creating entries...");

      let totalEntriesCreated = 0;
      const entries = await getEntries();

      for (const entry of entries) {
        console.log("🚀 ~ entry:", entry);
        try {
          await createNotionPage(entry, databaseId);

          entry.created = true;
          entry.save();

          totalEntriesCreated++;
        } catch (error) {
          console.error("Error creating Notion pages:", error);
          entry.entryErrors?.push((error as unknown as Error).message);
          entry.save();
        }
      }

      console.log(`Entries created: ${totalEntriesCreated}`);
    }, // onTick
    null, // onComplete
    true, // start
    "America/Mexico_City" // timeZone
  );
}

main();
