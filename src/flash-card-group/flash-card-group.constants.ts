/** Tipo do grupo: cards de texto (padrão) ou de imagem. */
export const FLASH_CARD_GROUP_TYPES = ['text', 'image'] as const;

export type FlashCardGroupType = (typeof FLASH_CARD_GROUP_TYPES)[number];

export const DEFAULT_FLASH_CARD_GROUP_TYPE: FlashCardGroupType = 'text';
