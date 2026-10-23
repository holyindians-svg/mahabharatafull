import { expect, test } from "bun:test";
import { createListeningSync, type ListeningPayload } from "./listening-sync";

const p: ListeningPayload = { book_title: "K", listened_seconds: 1, total_seconds: 2, status: "playing", chapter: "Oddíl 1" };

test("průběh se odesílá nejvýš jednou za minutu", () => {
  const sent: ListeningPayload[] = [];
  const s = createListeningSync((x) => sent.push(x));
  s.event(p, 0);
  expect(s.progress(p, 59_999)).toBe(false);
  expect(s.progress(p, 60_000)).toBe(true);
  expect(sent.length).toBe(2);
});
