import { ExifInfo } from '../types/image';

export async function parseExif(file: File): Promise<ExifInfo> {
  const defaultInfo: ExifInfo = { hasExif: false };
  
  if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
    return defaultInfo;
  }

  try {
    const buffer = await file.slice(0, 128 * 1024).arrayBuffer();
    const view = new DataView(buffer);

    // Check for JPEG SOI (Start Of Image) 0xFFD8
    if (view.getUint16(0, false) !== 0xFFD8) {
      return defaultInfo;
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 4) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      // APP1 Marker (EXIF) 0xFFE1
      if (marker === 0xFFE1) {
        const app1Length = view.getUint16(offset, false);
        offset += 2;

        // Check for 'Exif\0\0'
        if (view.getUint32(offset, false) === 0x45786966 && view.getUint16(offset + 4, false) === 0x0000) {
          const tiffStart = offset + 6;
          const isLittleEndian = view.getUint16(tiffStart, false) === 0x4949; // 'II'

          const ifdOffset = view.getUint32(tiffStart + 4, isLittleEndian);
          const ifdStart = tiffStart + ifdOffset;

          const entriesCount = view.getUint16(ifdStart, isLittleEndian);
          const exif: ExifInfo = { hasExif: true };

          for (let i = 0; i < entriesCount; i++) {
            const entryOffset = ifdStart + 2 + i * 12;
            if (entryOffset + 12 > length) break;

            const tag = view.getUint16(entryOffset, isLittleEndian);
            const valOffset = view.getUint32(entryOffset + 8, isLittleEndian);

            // Read Make (0x010F)
            if (tag === 0x010F) {
              exif.make = readString(view, tiffStart + valOffset, 32);
            }
            // Read Model (0x0110)
            if (tag === 0x0110) {
              exif.model = readString(view, tiffStart + valOffset, 32);
            }
            // Orientation (0x0112)
            if (tag === 0x0112) {
              exif.orientation = view.getUint16(entryOffset + 8, isLittleEndian);
            }
            // DateTime (0x0132)
            if (tag === 0x0132) {
              exif.dateTime = readString(view, tiffStart + valOffset, 20);
            }
            // Software (0x0131)
            if (tag === 0x0131) {
              exif.software = readString(view, tiffStart + valOffset, 32);
            }
          }

          return exif;
        }
        offset += app1Length - 2;
      } else if ((marker & 0xFF00) === 0xFF00) {
        // Skip other markers
        if (marker === 0xFFDA || marker === 0xFFD9) break; // SOS or EOI
        const sectionLength = view.getUint16(offset, false);
        offset += sectionLength;
      } else {
        break;
      }
    }
  } catch (err) {
    console.debug('EXIF parsing skipped or unsupported for file', err);
  }

  return defaultInfo;
}

function readString(view: DataView, offset: number, maxLen: number): string {
  let str = '';
  for (let i = 0; i < maxLen; i++) {
    if (offset + i >= view.byteLength) break;
    const charCode = view.getUint8(offset + i);
    if (charCode === 0) break;
    str += String.fromCharCode(charCode);
  }
  return str.trim();
}
