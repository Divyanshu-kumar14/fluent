/**
 * Audio Download Utility
 *
 * Triggers a browser download for an audio file with a sanitized
 * filename derived from the text content. Shared by both the desktop
 * and mobile voice preview components.
 */

/**
 * Download an audio file via a temporary <a> element.
 * Creates a safe filename from the first 50 characters of the text.
 */
export async function downloadAudioFile(audioUrl: string, text: string): Promise<void> {
  const safeName =
    text
      .slice(0, 50)
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "speech";

  try {
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error("Failed to fetch audio");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${safeName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
}
