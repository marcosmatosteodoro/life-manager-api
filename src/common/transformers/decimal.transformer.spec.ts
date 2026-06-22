import { decimalTransformer } from './decimal.transformer';

describe('decimalTransformer', () => {
  describe('from (banco -> aplicação)', () => {
    it('converte string decimal para number', () => {
      expect(decimalTransformer.from('81.55')).toBe(81.55);
    });

    it('preserva null', () => {
      expect(decimalTransformer.from(null)).toBeNull();
    });

    it('converte string inteira para number', () => {
      expect(decimalTransformer.from('80')).toBe(80);
    });
  });

  describe('to (aplicação -> banco)', () => {
    it('repassa o number sem alterar', () => {
      expect(decimalTransformer.to(81.55)).toBe(81.55);
    });

    it('preserva null', () => {
      expect(decimalTransformer.to(null)).toBeNull();
    });
  });
});
