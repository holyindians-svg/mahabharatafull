import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page, PageHeader } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_VOICE_SETTINGS,
  loadVoiceSettings,
  saveVoiceSettings,
  type VoiceSettings,
} from "@/lib/voice-settings";
import { speak, type SpeakHandle } from "@/lib/speak";

export const Route = createFileRoute("/nastaveni-hlasu")({
  head: () => ({
    meta: [
      { title: "Nastavení hlasu – Mahábhárata" },
      { name: "description", content: "Vyberte hlas, rychlost a výšku předčítání Mahábháraty." },
      { property: "og:title", content: "Nastavení hlasu – Mahábhárata" },
      { property: "og:description", content: "Vlastní hlas, rychlost a výška předčítání eposu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VoiceSettingsPage,
});

const AUTO = "__auto__";

function VoiceSettingsPage() {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [handle, setHandle] = useState<SpeakHandle | null>(null);

  useEffect(() => {
    setSettings(loadVoiceSettings());
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const load = () => {
      const list = [...synth.getVoices()];
      list.sort((a, b) => {
        const ac = a.lang.toLowerCase().startsWith("cs") ? 0 : 1;
        const bc = b.lang.toLowerCase().startsWith("cs") ? 0 : 1;
        return ac - bc || a.name.localeCompare(b.name);
      });
      setVoices(list);
    };
    load();
    synth.addEventListener("voiceschanged", load);
    return () => synth.removeEventListener("voiceschanged", load);
  }, []);

  useEffect(() => () => handle?.stop(), [handle]);

  const update = (patch: Partial<VoiceSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveVoiceSettings(next);
      return next;
    });
  };

  const test = () => {
    handle?.stop();
    setHandle(speak("Vítejte. Takto zní vypravěč Mahábháraty s vaším nastavením."));
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Svara"
        title="Nastavení hlasu"
        description="Vyberte hlas, rychlost a výšku předčítání. Nastavení se uloží v tomto zařízení a platí pro všechna čtení."
      />
      <div className="max-w-xl space-y-8 rounded-xl border border-border bg-card/40 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Hlas</label>
          <Select
            value={settings.voiceURI ?? AUTO}
            onValueChange={(v) => update({ voiceURI: v === AUTO ? null : v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AUTO}>Automaticky – český hlas</SelectItem>
              {voices.map((v) => (
                <SelectItem key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Rychlost</span>
            <span className="text-muted-foreground">{settings.rate.toFixed(2)}×</span>
          </div>
          <Slider
            min={0.5}
            max={1.5}
            step={0.05}
            value={[settings.rate]}
            onValueChange={([v]) => update({ rate: v ?? 1 })}
            aria-label="Rychlost"
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Výška hlasu</span>
            <span className="text-muted-foreground">{settings.pitch.toFixed(2)}</span>
          </div>
          <Slider
            min={0.5}
            max={1.5}
            step={0.05}
            value={[settings.pitch]}
            onValueChange={([v]) => update({ pitch: v ?? 1 })}
            aria-label="Výška hlasu"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={test}>Vyzkoušet</Button>
          <Button variant="outline" onClick={() => update({ ...DEFAULT_VOICE_SETTINGS })}>
            Obnovit výchozí
          </Button>
        </div>
      </div>
    </Page>
  );
}
