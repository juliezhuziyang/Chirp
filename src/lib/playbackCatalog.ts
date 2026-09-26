export type PlaybackPool = "echo" | "cheer";

export interface PlaybackClip {
  id: string;
  bird: string;
  pool: PlaybackPool;
  audioUrl: string;
}

/** Curated from the playback experiment. Lower within-receiver score spread came first. */
export const PLAYBACK_CLIPS: PlaybackClip[] = [
  clip("echo", "Bobby_callforresponse_1401", "Bobby"),
  clip("echo", "Bobby_callandresponse_1521", "Bobby"),
  clip("echo", "Aster_respondtocallreadytofly_1331", "Aster"),
  clip("echo", "Fizzy_respondtomate_1402", "Fizzy"),
  clip("echo", "Duke_respondtohuman_1331", "Duke"),
  clip("echo", "Fizzy_readytoflyrespondingtocall_1318", "Fizzy"),
  clip("echo", "Aster_callforresponse_1356", "Aster"),
  clip("echo", "Fizzy_responding_1330", "Fizzy"),
  clip("cheer", "Cleo_lovinghappywithduke_1359", "Cleo"),
  clip("cheer", "Eko_happyflying_1325", "Eko"),
  clip("cheer", "Cleo_happylovingconversationwithduke_1348", "Cleo"),
  clip("cheer", "Cleo_happytofindhome_1350", "Cleo"),
  clip("cheer", "Eko_happychirping_1320", "Eko"),
  clip("cheer", "Cleo_lovingtalkingtoduke_1652", "Cleo"),
  clip("cheer", "Duke_happygreeting_2000", "Duke"),
  clip("cheer", "Cleo_happycurious_2000", "Cleo"),
];

function clip(pool: PlaybackPool, id: string, bird: string): PlaybackClip {
  return {
    id,
    bird,
    pool,
    audioUrl: `/audio/playback/${id}.wav`,
  };
}

export function poolForPlaybackMode(mode: "echo" | "cheer" | "companion"): PlaybackPool {
  return mode === "echo" ? "echo" : "cheer";
}

export function pickPlaybackClip(pool: PlaybackPool, excludeId?: string): PlaybackClip {
  const all = PLAYBACK_CLIPS.filter((item) => item.pool === pool);
  const poolWithoutCurrent = excludeId ? all.filter((item) => item.id !== excludeId) : all;
  const choices = poolWithoutCurrent.length > 0 ? poolWithoutCurrent : all;
  return choices[Math.floor(Math.random() * choices.length)];
}
