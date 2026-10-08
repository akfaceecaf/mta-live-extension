// Typed access to build-time env vars (see .env.example).
// Falls back to defaults so the extension still builds without a .env file.
export const env = {
  mtaMnrFeedUrl:
    import.meta.env.VITE_MTA_MNR_FEED_URL ??
    'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/mnr%2Fgtfs-mnr',
} as const;
