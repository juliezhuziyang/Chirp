export type PlaybackPool = "echo" | "cheer";

export interface PlaybackClip {
  id: string;
  bird: string;
  pool: PlaybackPool;
  audioUrl: string;
}

/**
 * Chosen from listener reactions in the playback experiment, not from words in the filename.
 * Echo: at least two of three listeners answered (responded, approached, or called back),
 * none shut down or alarmed, and they oriented toward the sound.
 * Cheer: listeners turned and attended, without that answer, and without shutting down.
 * At most two clips per bird. See notebooks/08_playback_response_model.ipynb.
 */
export const PLAYBACK_CLIPS: PlaybackClip[] = [
  clip("echo", "Cleo_alarmresponding_1848", "Cleo"),
  clip("echo", "Aster_callingfizzy_1336", "Aster"),
  clip("echo", "Bobby_readytofly_0905", "Bobby"),
  clip("echo", "Eko_landingcallmate_1343", "Eko"),
  clip("echo", "Cleo_readytofly_1831", "Cleo"),
  clip("echo", "Aster_warnmate_1326", "Aster"),
  clip("echo", "Fizzy_respondtomate_1402", "Fizzy"),
  clip("echo", "Bobby_callmate_1857", "Bobby"),
  clip("cheer", "Bobby_callmate_1314", "Bobby"),
  clip("cheer", "Bobby_callmate_1326", "Bobby"),
  clip("cheer", "Fizzy_talkingtomateandhuman_1323", "Fizzy"),
  clip("cheer", "Duke_drinkwater_1333", "Duke"),
  clip("cheer", "Cleo_alonewalking_1527", "Cleo"),
  clip("cheer", "Aster_curiousobservingneighbor_1200", "Aster"),
  clip("cheer", "Duke_gotohuman_1841", "Duke"),
  clip("cheer", "Eko_tellingbobbyshescoming_1352", "Eko"),
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
