export async function getImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.addEventListener(
      "load",
      () => {
        resolve(image);
      },
      { once: true }
    );
    image.addEventListener(
      "error",
      (e) => {
        reject(e);
      },
      { once: true }
    );
  });
}
