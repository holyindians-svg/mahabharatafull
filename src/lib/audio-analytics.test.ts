import { test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { createAudioAnalytics } from "./audio-analytics";

function setup() {
  const events: { event: string; parameters: { audio_title: string; minutes_played?: number } }[] = [];
  const tracker = createAudioAnalytics(() => "Kniha počátku", (event, parameters) => events.push({ event, parameters }));
  return { tracker, events };
}

test("play sends audio_play with the audiobook title", () => {
  const { tracker, events } = setup();
  tracker.play();
  deepStrictEqual(events, [{ event: "audio_play", parameters: { audio_title: "Kniha počátku" } }]);
});

test("5, 10 and 15 listening minutes are each reported once, including after replay", () => {
  const { tracker, events } = setup();
  tracker.play();
  tracker.resume(0, 0);
  tracker.update(299, 299000, 1);
  strictEqual(events.length, 1);
  tracker.update(300, 300000, 1);
  tracker.update(300, 300000, 1);
  tracker.update(900, 900000, 1);
  tracker.play();
  tracker.resume(0, 1000000);
  tracker.update(900, 1900000, 1);
  deepStrictEqual(events.filter(({ event }) => event === "audio_progress").map(({ parameters }) => parameters), [
    { audio_title: "Kniha počátku", minutes_played: 5 },
    { audio_title: "Kniha počátku", minutes_played: 10 },
    { audio_title: "Kniha počátku", minutes_played: 15 },
  ]);
});

test("seeking, buffering and playback speed do not inflate listening minutes", () => {
  const { tracker, events } = setup();
  tracker.play();
  tracker.resume(0, 0);
  tracker.update(450, 225000, 2);
  tracker.suspend();
  tracker.update(9000, 1000000, 2);
  tracker.resume(9000, 1000000);
  tracker.update(9150, 1075000, 2);
  deepStrictEqual(events.at(-1), { event: "audio_progress", parameters: { audio_title: "Kniha počátku", minutes_played: 5 } });
  strictEqual(events.length, 2);
});

test("a pause breaks continuous listening", () => {
  const { tracker, events } = setup();
  tracker.play();
  tracker.resume(0, 0);
  tracker.update(200, 200000, 1);
  tracker.suspend();
  tracker.play();
  tracker.resume(200, 1000000);
  tracker.update(400, 1200000, 1);
  strictEqual(events.filter(({ event }) => event === "audio_progress").length, 0);
});

test("ending sends audio_complete with the audiobook title", () => {
  const { tracker, events } = setup();
  tracker.complete();
  deepStrictEqual(events, [{ event: "audio_complete", parameters: { audio_title: "Kniha počátku" } }]);
});

test("missing Analytics is safe, including when gtag becomes available later", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  const fakeWindow: { gtag?: (...args: unknown[]) => void } = {};
  Object.defineProperty(globalThis, "window", { value: fakeWindow, configurable: true });
  try {
    const tracker = createAudioAnalytics(() => "Kniha počátku");
    tracker.play();
    const calls: unknown[][] = [];
    fakeWindow.gtag = (...args) => { calls.push(args); };
    tracker.complete();
    deepStrictEqual(calls, [["event", "audio_complete", { audio_title: "Kniha počátku" }]]);
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});