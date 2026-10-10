export const CATEGORIES = [
  "Hostel",
  "Academics",
  "Infrastructure",
  "Canteen",
  "Transport",
  "Other",
] as const;

export const STATUSES = ["pending", "in_progress", "resolved"] as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const COMPLAINT_IMAGES_BUCKET = "complaint-images";
