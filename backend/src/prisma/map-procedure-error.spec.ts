import { BadRequestException, ConflictException } from '@nestjs/common';
import { mapProcedureError } from './map-procedure-error';

describe('mapProcedureError', () => {
  it('converte conflito de reserva em ConflictException', () => {
    expect(() =>
      mapProcedureError(
        new Error(
          'Erro: O espaco fisico ja possui uma reserva conflitante neste horario.',
        ),
      ),
    ).toThrow(ConflictException);
  });

  it('converte demais Erro: em BadRequestException', () => {
    expect(() =>
      mapProcedureError(
        new Error('Erro: Este lote de ingressos ja esta esgotado.'),
      ),
    ).toThrow(BadRequestException);
  });

  it('repassa erros sem prefixo Erro:', () => {
    const original = new Error('connection refused');
    expect(() => mapProcedureError(original)).toThrow(original);
  });
});
