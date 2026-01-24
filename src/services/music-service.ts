/**
 * Fetches song list from S3 bucket listing API.
 * Uses S3 ListBucket endpoint (GET on bucket root); MP3 playback uses CloudFront CDN.
 */
const S3_LIST_URL = "https://wtr98-music.s3.us-east-1.amazonaws.com/";

/**
 * Fetches all .mp3 keys from S3 bucket listing (handles pagination).
 */
export async function fetchSongList(): Promise<string[]> {
  const keys: string[] = [];
  let marker: string | undefined;
  const parser = new DOMParser();

  do {
    const url = marker
      ? `${S3_LIST_URL}?marker=${encodeURIComponent(marker)}`
      : S3_LIST_URL;
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
      if (key.toLowerCase().endsWith(".mp3")) {
        keys.push(key);
      }
    }
    const isTruncated = doc.getElementsByTagName("IsTruncated")[0]?.textContent === "true";
    const nextMarker = doc.getElementsByTagName("NextMarker")[0]?.textContent?.trim();
    marker = isTruncated ? (nextMarker || lastKey) : undefined;
  } while (marker);

  return keys;
}
