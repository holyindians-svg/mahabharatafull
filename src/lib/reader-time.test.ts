import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { chapterAtTime, clampSectionTime, formatTime, sectionProgress, skipSectionTime } from "./reader-time";

const section = { startTime: 120, endTime: 990 };

describe("immersive reader timing", () => {
  test("shows time relative to the section: 02:15 / 14:30", () => {
    deepStrictEqual(sectionProgress(255, section), { elapsed: 135, duration: 870 });
  });
  test("seeking is confined to the current section", () => {
    strictEqual(clampSectionTime(0, section), 120);
    strictEqual(clampSectionTime(2000, section), 990);
    strictEqual(clampSectionTime(400, section), 400);
  });
  test("backward skip is exactly 15 seconds and stops at the start", () => {
    strictEqual(skipSectionTime(300, -15, section), 285);
    strictEqual(skipSectionTime(125, -15, section), 120);
  });
  test("forward skip is exactly 15 seconds and stops at the end", () => {
    strictEqual(skipSectionTime(300, 15, section), 315);
    strictEqual(skipSectionTime(985, 15, section), 990);
  });
  test("continuous playback selects the next chapter at its start, including subtitle gaps", () => {
    const chapters = [{ index: 0, startTime: 0, endTime: 120 }, { index: 1, startTime: 121, endTime: 245 }];
    strictEqual(chapterAtTime(119, chapters)?.index, 0);
    strictEqual(chapterAtTime(120.5, chapters)?.index, 0);
    strictEqual(chapterAtTime(121, chapters)?.index, 1);
    strictEqual(chapterAtTime(130, chapters)?.index, 1);
  });
  test("formats long times with hours", () => {
    strictEqual(formatTime(93835.78), "26:03:55");
    strictEqual(formatTime(3600), "1:00:00");
    strictEqual(formatTime(2720), "45:20");
    strictEqual(formatTime(75), "01:15");
  });
});