declare module 'piexifjs' {
  interface PIEXIF {
    load(jpegData: string): any;
    dump(exifDict: any): string;
    insert(exifBytes: string, jpegData: string): string;
    remove(jpegData: string): string;

    ImageIFD: { [key: string]: number };
    ExifIFD: { [key: string]: number };
    GPSIFD: { [key: string]: number };
    InteropIFD: { [key: string]: number };
    '0th': { [key: string]: number };
    '1st': { [key: string]: number };
    Exif: { [key: string]: number };
    GPS: { [key: string]: number };
    Interop: { [key: string]: number };
  }

  const piexif: PIEXIF;
  export = piexif;
}
