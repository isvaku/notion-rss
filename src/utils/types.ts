import Parser from "rss-parser";

export type TODO = any;

export type FeedItem = {
  [key: string]: any;
} & Parser.Item;
