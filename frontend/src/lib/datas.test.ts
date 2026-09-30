import { chaveDia, formatDiaLongo, formatHora, formatIntervaloHora } from './datas';

describe('RF05.2 - horários apresentados no cronograma', () => {
  it('preserva horário cadastrado em UTC mesmo perto da virada do dia', () => {
    expect(formatHora('2026-10-01T00:30:00Z')).toBe('00:30');
    expect(formatDiaLongo('2026-10-01T00:30:00Z')).toContain('01 de outubro');
    expect(chaveDia('2026-10-01T00:30:00Z')).toBe('2026-10-01');
  });

  it('formata intervalo e permite horário final ausente', () => {
    expect(formatIntervaloHora('2026-10-01T08:30:00Z', '2026-10-01T12:30:00Z')).toBe('08:30 – 12:30');
    expect(formatIntervaloHora('2026-10-01T08:30:00Z', '')).toBe('08:30');
  });

  it('dados ausentes não produzem datas ou horários fictícios', () => {
    expect(formatDiaLongo('')).toBe('');
    expect(formatHora('')).toBe('');
    expect(formatIntervaloHora('', '')).toBe('');
    expect(chaveDia('')).toBe('');
  });
});
