import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  it('deve chamar $disconnect e pool.end no onModuleDestroy para prevenir vazamento de conexoes', async () => {
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue();
    const poolEndSpy = jest.spyOn(service.pool, 'end').mockResolvedValue();

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
    expect(poolEndSpy).toHaveBeenCalled();
  });
});
