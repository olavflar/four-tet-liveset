import { AudioSample } from './audio-processor';

export class ZipCreator {
  static async createSamplePackZip(samples: AudioSample[], originalFilename: string): Promise<Blob> {
    // Simple ZIP implementation without external dependencies
    const files: Array<{ name: string; data: Uint8Array }> = [];

    // Add all sample files
    for (const sample of samples) {
      const arrayBuffer = await sample.blob.arrayBuffer();
      files.push({
        name: sample.filename,
        data: new Uint8Array(arrayBuffer)
      });
    }

    // Create metadata.json
    const metadata = samples.map(sample => ({
      filename: sample.filename,
      duration_ms: Math.round(sample.duration_ms),
      dbfs: Math.round(sample.dbfs * 10) / 10
    }));

    const metadataJson = JSON.stringify(metadata, null, 2);
    files.push({
      name: 'metadata.json',
      data: new TextEncoder().encode(metadataJson)
    });

    // Create simple ZIP structure
    return this.createZipBlob(files);
  }

  private static createZipBlob(files: Array<{ name: string; data: Uint8Array }>): Blob {
    const chunks: Uint8Array[] = [];
    const centralDirectory: Uint8Array[] = [];
    let offset = 0;

    // Create local file headers and file data
    for (const file of files) {
      const filename = new TextEncoder().encode(file.name);
      const fileData = file.data;
      
      // Local file header
      const localHeader = new Uint8Array(30 + filename.length);
      const view = new DataView(localHeader.buffer);
      
      view.setUint32(0, 0x04034b50, true); // Local file header signature
      view.setUint16(4, 20, true); // Version needed to extract
      view.setUint16(6, 0, true); // General purpose bit flag
      view.setUint16(8, 0, true); // Compression method (stored)
      view.setUint16(10, 0, true); // Last mod file time
      view.setUint16(12, 0, true); // Last mod file date
      view.setUint32(14, this.crc32(fileData), true); // CRC-32
      view.setUint32(18, fileData.length, true); // Compressed size
      view.setUint32(22, fileData.length, true); // Uncompressed size
      view.setUint16(26, filename.length, true); // File name length
      view.setUint16(28, 0, true); // Extra field length
      
      localHeader.set(filename, 30);
      
      chunks.push(localHeader);
      chunks.push(fileData);
      
      // Central directory file header
      const centralHeader = new Uint8Array(46 + filename.length);
      const centralView = new DataView(centralHeader.buffer);
      
      centralView.setUint32(0, 0x02014b50, true); // Central file header signature
      centralView.setUint16(4, 20, true); // Version made by
      centralView.setUint16(6, 20, true); // Version needed to extract
      centralView.setUint16(8, 0, true); // General purpose bit flag
      centralView.setUint16(10, 0, true); // Compression method
      centralView.setUint16(12, 0, true); // Last mod file time
      centralView.setUint16(14, 0, true); // Last mod file date
      centralView.setUint32(16, this.crc32(fileData), true); // CRC-32
      centralView.setUint32(20, fileData.length, true); // Compressed size
      centralView.setUint32(24, fileData.length, true); // Uncompressed size
      centralView.setUint16(28, filename.length, true); // File name length
      centralView.setUint16(30, 0, true); // Extra field length
      centralView.setUint16(32, 0, true); // File comment length
      centralView.setUint16(34, 0, true); // Disk number start
      centralView.setUint16(36, 0, true); // Internal file attributes
      centralView.setUint32(38, 0, true); // External file attributes
      centralView.setUint32(42, offset, true); // Relative offset of local header
      
      centralHeader.set(filename, 46);
      centralDirectory.push(centralHeader);
      
      offset += localHeader.length + fileData.length;
    }

    // End of central directory record
    const centralDirSize = centralDirectory.reduce((sum, header) => sum + header.length, 0);
    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    
    endView.setUint32(0, 0x06054b50, true); // End of central dir signature
    endView.setUint16(4, 0, true); // Number of this disk
    endView.setUint16(6, 0, true); // Number of the disk with start of central directory
    endView.setUint16(8, files.length, true); // Total number of entries on this disk
    endView.setUint16(10, files.length, true); // Total number of entries
    endView.setUint32(12, centralDirSize, true); // Size of central directory
    endView.setUint32(16, offset, true); // Offset of start of central directory
    endView.setUint16(20, 0, true); // ZIP file comment length

    // Combine all parts
    const allChunks = [...chunks, ...centralDirectory, endRecord];
    const totalLength = allChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const zipData = new Uint8Array(totalLength);
    
    let pos = 0;
    for (const chunk of allChunks) {
      zipData.set(chunk, pos);
      pos += chunk.length;
    }

    return new Blob([zipData], { type: 'application/zip' });
  }

  private static crc32(data: Uint8Array): number {
    let crc = -1;
    const table = this.makeCRCTable();
    
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
    }
    
    return (crc ^ (-1)) >>> 0;
  }

  private static makeCRCTable(): number[] {
    let c: number;
    const crcTable: number[] = [];
    
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      crcTable[n] = c;
    }
    
    return crcTable;
  }
}