import Entry, { IEntry } from "../db/models/entry";
import { FeedItem } from "../utils/types";

async function removeInsertedItems(
  items: Array<FeedItem>
): Promise<Array<FeedItem>> {
  const query = {
    entryId: { $in: items.map((item) => item.guid) },
  };

  const entries = await Entry.find(query).select({ entryId: 1 });

  return items.filter(
    (item) => !entries.find((entry) => item.guid === entry.entryId)
  );
}

export async function insertEntries(entries: Array<FeedItem>) {
  const entryArr: Array<IEntry> = [];
  const newEntries = await removeInsertedItems(entries);

  for (const item of newEntries) {
    entryArr.push(new Entry(toDTO(item)));
  }

  try {
    const entries = await Entry.insertMany(entryArr, {
      ordered: false,
    });

    console.log(`Inserted ${entries.length} entries`);
  } catch (error) {
    console.error("Error inserting entries:", error);
  }
}

export function toDTO(feed: FeedItem): IEntry {
  return {
    entryId: feed.guid ?? "",
    title: feed.title,
    author: feed.creator,
    content: feed["content:encoded"],
    link: feed.link ?? "",
    entryDate: new Date(feed.isoDate ?? ""),
  } as IEntry;
}

export function getEntries() {
  return Entry.find({
    created: false,
    $expr: {
      $not: { $gte: [{ $size: "$entryErrors" }, 5] },
    },
  })
    .sort({ createdAt: 1 })
    .limit(3);
}
