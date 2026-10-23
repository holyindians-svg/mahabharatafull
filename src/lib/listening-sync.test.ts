import { test } from "node:test";
import { strictEqual } from "node:assert";
import { createListeningSync, getListeningSessionId, type ListeningPayload } from "./listening-sync";

const p: ListeningPayload = { book_title: "K", listened_seconds: 1, total_seconds: 2, status: "playing", chapter: "Oddíl 1" };

test("průběh se odesílá každých 10 sekund, ne dříve", () => {
  const sent: ListeningPayload[] = [];
  const s = createListeningSync((x) => sent.push(x));
  s.event(p, 0);
  strictEqual(s.progress(p, 9_999), false);
  strictEqual(s.progress(p, 10_000), true);
  strictEqual(sent.length, 2);
});

test("ID zařízení se uloží pod audiobook_session_id a použije při další návštěvě", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
  strictEqual(getListeningSessionId(storage, () => "sess_first"), "sess_first");
  strictEqual(values.get("audiobook_session_id"), "sess_first");
  strictEqual(getListeningSessionId(storage, () => "sess_other"), "sess_first");
});

test("pauza se odešle okamžitě i před uplynutím 10 sekund", () => {
  const sent: ListeningPayload[] = [];
  const sync = createListeningSync((value) => sent.push(value));
  sync.event(p, 0);
  sync.event({ ...p, status: "paused" }, 1000);
  strictEqual(sent.length, 2);
  strictEqual(sent[1]?.status, "paused");
});
