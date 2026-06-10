// Image assets
export const IMAGES = {
  OFFICE_TEAM_1: "/images/office_team_1.jpeg",
  CROPPED_IMAGE_0_1780898199529437987: "/images/cropped_image_0_1780898199529437987.jpg",
} as const;

export type ImageKey = keyof typeof IMAGES;
