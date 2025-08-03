// types/html-docx-js.d.ts
declare module "html-docx-js/dist/html-docx" {
  const htmlDocx: {
    asBlob(html: string, options?: { orientation?: string }): Blob;
    asArrayBuffer(html: string, options?: { orientation?: string }): ArrayBuffer;
  };
  export = htmlDocx;
}