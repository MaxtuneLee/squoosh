import * as piexif from 'piexifjs';

export interface ExifData {
  [key: string]: any;
}

export class ExifManager {
  private static isJpeg(buffer: ArrayBuffer): boolean {
    const uint8 = new Uint8Array(buffer);
    return uint8[0] === 0xff && uint8[1] === 0xd8;
  }

  /**
   * 从图片文件中提取EXIF数据
   */
  static async extractExif(file: File): Promise<ExifData | null> {
    try {
      // 只有JPEG文件支持EXIF
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        return null;
      }

      const arrayBuffer = await file.arrayBuffer();

      if (!this.isJpeg(arrayBuffer)) {
        return null;
      }

      // 转换为base64格式，piexifjs需要这种格式
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      const dataUrl = 'data:image/jpeg;base64,' + base64;

      // 提取EXIF数据
      const exifData = piexif.load(dataUrl);
      console.log(exifData);

      // 如果没有EXIF数据，返回null
      if (!exifData || Object.keys(exifData).length === 0) {
        return null;
      }

      return exifData;
    } catch (error) {
      console.warn('Failed to extract EXIF data:', error);
      return null;
    }
  }

  /**
   * 将EXIF数据嵌入到JPEG图片中
   */
  static async insertExif(imageBlob: Blob, exifData: ExifData): Promise<Blob> {
    try {
      // 只对JPEG格式进行EXIF处理
      if (!imageBlob.type.includes('jpeg') && !imageBlob.type.includes('jpg')) {
        return imageBlob;
      }

      if (!exifData) {
        return imageBlob;
      }

      const arrayBuffer = await imageBlob.arrayBuffer();

      if (!this.isJpeg(arrayBuffer)) {
        return imageBlob;
      }

      // 转换为base64格式
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      const dataUrl = 'data:image/jpeg;base64,' + base64;

      // 生成EXIF字节数据
      const exifBytes = piexif.dump(exifData);

      // 将EXIF数据插入到图片中
      const resultDataUrl = piexif.insert(exifBytes, dataUrl);

      // 转换回Blob
      const base64Data = resultDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Blob([bytes], { type: imageBlob.type });
    } catch (error) {
      console.warn('Failed to insert EXIF data:', error);
      return imageBlob;
    }
  }

  /**
   * 从图片中移除EXIF数据
   */
  static async removeExif(imageBlob: Blob): Promise<Blob> {
    try {
      if (!imageBlob.type.includes('jpeg') && !imageBlob.type.includes('jpg')) {
        return imageBlob;
      }

      const arrayBuffer = await imageBlob.arrayBuffer();

      if (!this.isJpeg(arrayBuffer)) {
        return imageBlob;
      }

      // 转换为base64格式
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      const dataUrl = 'data:image/jpeg;base64,' + base64;

      // 移除EXIF数据
      const resultDataUrl = piexif.remove(dataUrl);

      // 转换回Blob
      const base64Data = resultDataUrl.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return new Blob([bytes], { type: imageBlob.type });
    } catch (error) {
      console.warn('Failed to remove EXIF data:', error);
      return imageBlob;
    }
  }
}
