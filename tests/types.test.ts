import { describe, expect, it } from 'vitest';
import { dataBr, rotulo } from '../src/shared/types';

describe('formatacao', () => {
  it('converte data ISO para o formato brasileiro', () => {
    expect(dataBr('2026-11-20')).toBe('20/11/2026');
  });
  it('gera rotulo legivel a partir do enum', () => {
    expect(rotulo('SARGENTO_DE_DIA')).toBe('Sargento de dia');
  });
});
