// Іконки адмінки: тонкі лінії, квадратні кінці — як стрілки на сайті.
const PATHS = {
  plus: "M12 5v14M5 12h14",
  back: "M10 6 4 12l6 6M4 12h16",
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M6 13l6 6 6-6",
  copy: "M8 8h11v11H8zM5 16V5h11",
  trash: "M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13",
  grip: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  close: "M6 6l12 12M18 6 6 18",
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  upload: "M12 16V4M6 10l6-6 6 6M4 20h16",
  image: "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" strokeWidth={name === "grip" ? 3 : 1.6}>
      <path d={PATHS[name]} />
    </svg>
  );
}
