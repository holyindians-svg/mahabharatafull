export interface SectionRange {
  startTime: number;
  endTime: number;
}

export function sectionProgress(time: number, range: SectionRange) {
  const duration = Math.max(0, range.endTime - range.startTime);
  return { duration, elapsed: Math.max(0, Math.min(duration, time - range.startTime)) };
}

export function clampSectionTime(time: number, range: SectionRange) {
  return Math.max(range.startTime, Math.min(range.endTime, time));
}

export function skipSectionTime(time: number, delta: number, range: SectionRange) {
  return clampSectionTime(time + delta, range);
}

/** Gaps between subtitles belong to the preceding chapter until the next starts. */
export function chapterAtTime<T extends SectionRange>(time: number, chapters: T[]): T | undefined {
  return chapters.find((chapter) => time >= chapter.startTime && time < chapter.endTime)
    ?? [...chapters].reverse().find((chapter) => time >= chapter.startTime);
}

export function readerClock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60).toString().padStart(2, "0")}:${(whole % 60).toString().padStart(2, "0")}`;
}