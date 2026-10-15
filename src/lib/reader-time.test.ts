import { describe, expect, test } from "bun:test";
import { chapterAtTime, clampSectionTime, sectionProgress, skipSectionTime } from "./reader-time";

const section = { startTime: 120, endTime: 990 };

describe("immersive reader timing", () => {
  test("shows time relative to the section: 02:15 / 14:30", () => {
    expect(sectionProgress(255, section)).toEqual({ elapsed: 135, duration: 870 });
  });
  test("seeking is confined to the current section", () => {
    expect(clampSectionTime(0, section)).toBe(120);
    expect(clampSectionTime(2000, section)).toBe(990);
    expect(clampSectionTime(400, section)).toBe(400);
  });
  test("backward skip is exactly 15 seconds and stops at the start", () => {
    expect(skipSectionTime(300, -15, section)).toBe(285);
    expect(skipSectionTime(125, -15, section)).toBe(120);
  });
  test("forward skip is exactly 15 seconds and stops at the end", () => {
    expect(skipSectionTime(300, 15, section)).toBe(315);
    expect(skipSectionTime(985, 15, section)).toBe(990);
  });
  test("continuous playback selects the next chapter at its start, including subtitle gaps", () => {
    const chapters = [{ index: 0, startTime: 0, endTime: 120 }, { index: 1, startTime: 121, endTime: 245 }];
    expect(chapterAtTime(119, chapters)?.index).toBe(0);
    expect(chapterAtTime(120.5, chapters)?.index).toBe(0);
    expect(chapterAtTime(121, chapters)?.index).toBe(1);
    expect(chapterAtTime(130, chapters)?.index).toBe(1);
  });
});