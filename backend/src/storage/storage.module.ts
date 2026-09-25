import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { LocalStorageService } from './local-storage.service';
import { STORAGE_SERVICE } from './storage.interface';

@Module({
  controllers: [StorageController],
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
