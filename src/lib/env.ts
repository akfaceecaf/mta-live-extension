// Typed access to build-time env vars (see .env.example).
// Falls back to defaults so the extension still builds without a .env file.
export const env = {
  mtaMnrFeedUrl:
    import.meta.env.VITE_MTA_MNR_FEED_URL ??
    "https://wheres-my-train-at-relay.wheresmytrainat.workers.dev/mnr",
} as const;
