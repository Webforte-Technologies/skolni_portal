export async function registerCzechFonts(doc: any): Promise<boolean> {
  try {
    const basePath = '/fonts';
    const regularUrl = `${basePath}/Inter-Regular.ttf`;
    const boldUrl = `${basePath}/Inter-Bold.ttf`;

    const [regularResp, boldResp] = await Promise.all([
      fetch(regularUrl),
      fetch(boldUrl)
    ]);

    if (!regularResp.ok || !boldResp.ok) {
      return false;
    }

    const [regularBuf, boldBuf] = await Promise.all([
      regularResp.arrayBuffer(),
      boldResp.arrayBuffer()
    ]);

    const toBase64 = (buffer: ArrayBuffer) => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return btoa(binary);
    };

    const regularB64 = toBase64(regularBuf);
    const boldB64 = toBase64(boldBuf);

    doc.addFileToVFS('Inter-Regular.ttf', regularB64);
    doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
    doc.addFileToVFS('Inter-Bold.ttf', boldB64);
    doc.addFont('Inter-Bold.ttf', 'Inter', 'bold');
    doc.setFont('Inter', 'normal');
    return true;
  } catch {
    return false;
  }
}


