/** Nahrané audioknihy: jedna MP3 na knihu, oddíly jsou časové úseky v ní. */
export interface AudioChapter {
  startTime: number;
  endTime: number;
}

export interface AudioBook {
  audioUrl: string;
  /** Pořadový index oddílu (0 = od. 1) → časový úsek v sekundách. */
  sections: Record<number, AudioChapter>;
}

export const audiobooks: Record<string, AudioBook> = {
  "adi-parva": {
    audioUrl:
      "https://ckcnmvnjxziekezhzozh.supabase.co/storage/v1/object/public/audiobooks/MAHABHARATA/MB%201%20Kniha-pocatku.mp3",
    sections: {
      0: { startTime: 0, endTime: 125 },
      1: { startTime: 125, endTime: 340 },
    },
  },
};

export const audiobookFor = (slug: string): AudioBook | undefined => audiobooks[slug];
