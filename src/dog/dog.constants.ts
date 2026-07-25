/** Sexo do cão. Fonte única para entidade, DTO e validação. */
export const DOG_SEXES = ['macho', 'femea'] as const;

export type DogSex = (typeof DOG_SEXES)[number];
