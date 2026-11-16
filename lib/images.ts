/**
 * Image sources come from two places: a file inside public/ (optimised by
 * next/image) or a pasted https URL on a host we cannot know in advance.
 * Remote hosts cannot be allowlisted in next.config, so those render as plain
 * <img> tags instead.
 */

export function isRemoteImage(src: string): boolean {
  return /^https?:\/\//i.test(src.trim());
}

export function imageFileName(input: string, fallback = "image"): string {
  const base = input
    .split(/[\\/]/)
    .pop()
    ?.split("?")[0]
    ?.toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}
