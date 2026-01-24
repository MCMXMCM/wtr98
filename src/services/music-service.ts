/**
 * Fetches song list from S3 bucket listing API.
 * Uses S3 ListBucket endpoint (GET on bucket root); MP3 playback uses CloudFront CDN.
 */
const S3_LIST_URL = "https://wtr98-music.s3.us-east-1.amazonaws.com/";

/**
 * Fetches available playlist directories from S3 bucket.
 * Uses delimiter=/ to get CommonPrefixes (directory names).
 */
export async function fetchPlaylists(): Promise<string[]> {
  const playlists: string[] = [];
  const parser = new DOMParser();
  
  const url = `${S3_LIST_URL}?delimiter=/`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch playlists: ${res.status} ${res.statusText}`);
  }
  
  const xml = await res.text();
  const doc = parser.parseFromString(xml, "text/xml");
  const commonPrefixes = doc.getElementsByTagName("CommonPrefixes");
  
  for (let i = 0; i < commonPrefixes.length; i++) {
    const prefixEl = commonPrefixes[i].getElementsByTagName("Prefix")[0];
    if (!prefixEl?.textContent) continue;
    const prefix = prefixEl.textContent.trim();
    // Remove trailing slash to get clean playlist name
    const playlistName = prefix.replace(/\/$/, "");
    if (playlistName) {
      playlists.push(playlistName);
    }
  }
  
  return playlists.sort();
}

/**
 * Fetches all .mp3 keys from S3 bucket listing (handles pagination).
 * @param playlist - Optional playlist name. If provided, fetches songs from that playlist directory.
 *                   If null/undefined, fetches songs from root directory (backward compatibility).
 */
export async function fetchSongList(playlist?: string | null): Promise<string[]> {
  const keys: string[] = [];
  let marker: string | undefined;
  const parser = new DOMParser();

  do {
    let url = S3_LIST_URL;
    const params: string[] = [];
    
    // Add prefix if playlist is specified
    if (playlist) {
      params.push(`prefix=${encodeURIComponent(playlist + "/")}`);
    }
    
    // Add marker for pagination
    if (marker) {
      params.push(`marker=${encodeURIComponent(marker)}`);
    }
    
    if (params.length > 0) {
      url += "?" + params.join("&");
    }
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch song list: ${res.status} ${res.statusText}`);
    }
    const xml = await res.text();
    const doc = parser.parseFromString(xml, "text/xml");
    const contents = doc.getElementsByTagName("Contents");
    let lastKey: string | undefined;
    for (let i = 0; i < contents.length; i++) {
      const keyEl = contents[i].getElementsByTagName("Key")[0];
      if (!keyEl?.textContent) continue;
      const key = keyEl.textContent.trim();
      lastKey = key;
      
      // Filter for .mp3 files
      if (!key.toLowerCase().endsWith(".mp3")) continue;
      
      // If fetching from root, only include files at root level (no slash in path)
      if (!playlist && key.includes("/")) {
        continue;
      }
      
      keys.push(key);
    }
    const isTruncated = doc.getElementsByTagName("IsTruncated")[0]?.textContent === "true";
    const nextMarker = doc.getElementsByTagName("NextMarker")[0]?.textContent?.trim();
    marker = isTruncated ? (nextMarker || lastKey) : undefined;
  } while (marker);

  return keys;
}
