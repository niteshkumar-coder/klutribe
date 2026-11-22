const MAX_RAW_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_AVATAR_DATA_URL_LENGTH = 120_000;
const AVATAR_SIZE_PX = 320;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTENSION_RE = /\.(jpe?g|png|webp)$/i;

export function isValidAvatarDataUrl(value?: string | null): value is string {
  return (
    typeof value === 'string' &&
    value.length > 23 &&
    value.length <= 140_000 &&
    value.startsWith('data:image/jpeg;base64,')
  );
}

export function getInitials(fullName: string): string {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'KL'
  );
}

export async function processProfilePhotoFile(file: File): Promise<string> {
  const mime = (file.type || '').toLowerCase();
  const hasAllowedType =
    ALLOWED_IMAGE_MIME_TYPES.has(mime) || (!mime && ALLOWED_EXTENSION_RE.test(file.name));

  if (!hasAllowedType) {
    throw new Error('Please upload a JPG, PNG, or WebP photo.');
  }

  if (file.size <= 0) {
    throw new Error('The selected photo appears to be empty.');
  }

  if (file.size > MAX_RAW_IMAGE_BYTES) {
    throw new Error('Photo is too large. Please choose an image under 10 MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not read that image file. Try another JPG or PNG photo.'));
      el.src = objectUrl;
    });

    if (!img.naturalWidth || !img.naturalHeight) {
      throw new Error('Invalid image dimensions. Please choose another photo.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_SIZE_PX;
    canvas.height = AVATAR_SIZE_PX;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to process image in this browser.');
    }

    // Fill crisp white backing so transparent PNGs convert cleanly to JPEG
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Smart portrait-biased square center crop
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = Math.max(0, Math.round((img.naturalWidth - side) / 2));
    const sy =
      img.naturalHeight > img.naturalWidth
        ? Math.max(0, Math.round((img.naturalHeight - side) * 0.25))
        : 0;

    ctx.drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE_PX, AVATAR_SIZE_PX);

    const qualities = [0.84, 0.72, 0.6, 0.48, 0.36];
    let result = '';
    for (const quality of qualities) {
      const candidate = canvas.toDataURL('image/jpeg', quality);
      if (candidate.length <= MAX_AVATAR_DATA_URL_LENGTH && isValidAvatarDataUrl(candidate)) {
        result = candidate;
        break;
      }
    }

    if (!result) {
      throw new Error('Could not compress photo enough. Please choose a simpler portrait photo.');
    }

    return result;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
