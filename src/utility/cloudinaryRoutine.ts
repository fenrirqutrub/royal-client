// src/utils/cloudinaryRoutine.ts
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const sanitizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "-");

export const getRoutinePageViewUrl = ({
  publicId,
  page,
  width = 1400,
  format = "pdf",
}: {
  publicId: string;
  page: number;
  width?: number;
  format?: string;
}) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/pg_${page},f_webp,q_auto,w_${width},c_limit/${publicId}.${format}`;
};

export const getRoutinePageDownloadUrl = ({
  publicId,
  page,
  fileName,
  format = "pdf",
}: {
  publicId: string;
  page: number;
  fileName?: string;
  format?: string;
}) => {
  const safe = sanitizeFileName(fileName || `routine-page-${page}.webp`);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/pg_${page},f_webp,q_100,fl_attachment:${safe}/${publicId}.${format}`;
};
