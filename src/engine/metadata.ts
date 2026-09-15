import { ExifInfo } from '../types/image';

export async function parseExif(file: File): Promise<ExifInfo> {
  const defaultInfo: ExifInfo = { hasExif: false };
  
  if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
    return defaultInfo;
  }

  try {
    const buffer = await file.slice(0, 256 * 1024).arrayBuffer();
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

          let gpsIFDOffset: number | null = null;

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
            // GPS Info IFD Pointer (0x8825)
            if (tag === 0x8825) {
              gpsIFDOffset = valOffset;
            }
          }

          // Parse GPS Sub-IFD if present
          if (gpsIFDOffset !== null) {
            parseGpsIFD(view, tiffStart, tiffStart + gpsIFDOffset, isLittleEndian, exif);
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

/**
 * Parse the GPS Sub-IFD and populate latitude/longitude on the exif object.
 */
function parseGpsIFD(
  view: DataView,
  tiffStart: number,
  gpsIFDStart: number,
  isLittleEndian: boolean,
  exif: ExifInfo
): void {
  try {
    if (gpsIFDStart + 2 > view.byteLength) return;
    const entriesCount = view.getUint16(gpsIFDStart, isLittleEndian);

    let latRef: string | null = null;
    let lonRef: string | null = null;
    let latitude: number | null = null;
    let longitude: number | null = null;

    for (let i = 0; i < entriesCount; i++) {
      const entryOffset = gpsIFDStart + 2 + i * 12;
      if (entryOffset + 12 > view.byteLength) break;

      const tag = view.getUint16(entryOffset, isLittleEndian);
      const type = view.getUint16(entryOffset + 2, isLittleEndian);
      const count = view.getUint32(entryOffset + 4, isLittleEndian);
      const valueOffset = view.getUint32(entryOffset + 8, isLittleEndian);

      // GPSLatitudeRef (0x0001) — ASCII 'N' or 'S'
      if (tag === 0x0001) {
        latRef = readString(view, entryOffset + 8, 1);
      }
      // GPSLatitude (0x0002) — 3 RATIONALs: degrees, minutes, seconds
      if (tag === 0x0002 && type === 5 /* RATIONAL */ && count === 3) {
        latitude = readDMS(view, tiffStart + valueOffset, isLittleEndian);
      }
      // GPSLongitudeRef (0x0003) — ASCII 'E' or 'W'
      if (tag === 0x0003) {
        lonRef = readString(view, entryOffset + 8, 1);
      }
      // GPSLongitude (0x0004) — 3 RATIONALs: degrees, minutes, seconds
      if (tag === 0x0004 && type === 5 /* RATIONAL */ && count === 3) {
        longitude = readDMS(view, tiffStart + valueOffset, isLittleEndian);
      }
    }

    if (latitude !== null && latRef !== null) {
      exif.latitude = latRef === 'S' ? -latitude : latitude;
    }
    if (longitude !== null && lonRef !== null) {
      exif.longitude = lonRef === 'W' ? -longitude : longitude;
    }
  } catch {
    // GPS parsing failed silently — not a critical error
  }
}

/**
 * Read 3 consecutive RATIONAL values (deg/min/sec) and convert to decimal degrees.
 * Each RATIONAL is two UInt32s: numerator / denominator.
 */
function readDMS(view: DataView, offset: number, isLittleEndian: boolean): number {
  const deg = readRational(view, offset, isLittleEndian);
  const min = readRational(view, offset + 8, isLittleEndian);
  const sec = readRational(view, offset + 16, isLittleEndian);
  return deg + min / 60 + sec / 3600;
}

function readRational(view: DataView, offset: number, isLittleEndian: boolean): number {
  if (offset + 8 > view.byteLength) return 0;
  const numerator = view.getUint32(offset, isLittleEndian);
  const denominator = view.getUint32(offset + 4, isLittleEndian);
  return denominator === 0 ? 0 : numerator / denominator;
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
