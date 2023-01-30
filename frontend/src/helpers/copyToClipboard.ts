export function copyToClipboard(text: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // @ts-ignore-next-line
    if (window.clipboardData && window.clipboardData.setData) {
      // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
      // @ts-ignore-next-line
      return window.clipboardData.setData("Text", text);
    } else if (
      document.queryCommandSupported &&
      document.queryCommandSupported("copy")
    ) {
      const textarea = document.createElement("textarea");
      textarea.textContent = text;
      textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in Microsoft Edge.
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy"); // Security exception may be thrown by some browsers.
        resolve();
      } catch (ex) {
        console.warn("Copy to clipboard failed.", ex);
        reject();
      } finally {
        document.body.removeChild(textarea);
      }
    }
  });
}
