import parse, { HTMLElement, TextNode } from "node-html-parser";
import {
  BlockObjectRequest,
  CreatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { URL_REGEX } from "./constants";
import { FeedItem } from "./types";

const MAX_RICH_TEXT_LENGTH = 2000;

export function createNoteBody(
  entry: FeedItem,
  databaseId: string
): CreatePageParameters {
  const entryHTML = parse(entry["content:encoded"] ?? entry.content ?? "");

  const noteBody: CreatePageParameters = {
    parent: {
      type: "database_id",
      database_id: databaseId,
    },
    properties: {
      title: {
        title: [
          {
            text: {
              content: entry.title ?? "",
            },
          },
        ],
      },
      author: {
        rich_text: [
          {
            text: {
              content: entry.creator ?? "",
            },
          },
        ],
      },
      link: {
        url: entry.link ?? "",
      },
      entryDate: {
        date: {
          start: new Date(entry.isoDate ?? "").toISOString(),
        },
      },
      summary: {
        rich_text: [
          {
            text: {
              content: entry.contentSnippet ?? "",
            },
          },
        ],
      },
    },
    children: [],
  };

  for (const childNode of entryHTML.childNodes) {
    if (
      childNode instanceof HTMLElement &&
      childNode.tagName?.toLowerCase() === "img"
    ) {
      const src = getImgSrc(childNode);
      if (!noteBody.cover) {
        noteBody.cover = {
          type: "external",
          external: {
            url: src,
          },
        };
      }

      noteBody.children?.push({
        object: "block",
        image: {
          type: "external",
          external: {
            url: src,
          },
        },
      });
    }

    if (childNode instanceof TextNode) {
      childNode.text
        .split("\n")
        .filter((str) => str.trim() !== "")
        .forEach((str) => {
          if (str.length <= MAX_RICH_TEXT_LENGTH) {
            addParagraphToNoteBody(noteBody.children!, str);
            return;
          }

          str
            .split(".")
            .forEach((sentence) =>
              addParagraphToNoteBody(noteBody.children!, `${sentence}.`)
            );
        });
    }
  }

  return noteBody;
}

function addParagraphToNoteBody(
  blockObject: BlockObjectRequest[],
  text: string
) {
  blockObject.push({
    object: "block",
    paragraph: {
      rich_text: [
        {
          text: {
            content: text,
          },
        },
      ],
      color: "default",
    },
  });
}

function getImgSrc(element: HTMLElement): string {
  let src = element.getAttribute("src");

  if (src) return src;

  src = element.getAttribute("srcset");
  if (src) {
    const srcset: RegExpMatchArray[] = [...src.matchAll(URL_REGEX)];
    const srcsetString: string[] = srcset.map(
      (nodeAttribute) => nodeAttribute[0]
    );
    return srcsetString[0] ?? "";
  }

  return "";
}
