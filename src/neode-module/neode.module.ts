import { Global, Module, DynamicModule } from '@nestjs/common';
import * as Neode from 'neode';

@Global()
@Module({})
export class NeodeModule {
  static forRoot(directory?: string): DynamicModule {
    return {
      module: NeodeModule,
      global: true,
      providers: [
        {
          provide: 'DIRECTORY',
          useValue: directory ?? null,
        },
        {
          provide: Neode,
          useFactory: async () => {
            let connection: Neode;
            if (typeof directory === 'string') {
              connection = await Neode.fromEnv().withDirectory(directory);
              await connection.schema.install();
            } else {
              connection = await Neode.fromEnv();
            }
            return connection;
          },
          inject: ['DIRECTORY'],
        },
      ],
      exports: [Neode],
    };
  }

  static forFeature(schema: Neode.SchemaObject): DynamicModule {
    return {
      module: NeodeModule,
      global: false,
      providers: [
        {
          provide: 'SCHEMA',
          useValue: schema,
        },
        {
          provide: Neode,
          useFactory: async () => {
            const connection = await Neode.fromEnv().with({ schema });
            await connection.schema.install();
            return connection;
          },
          inject: ['SCHEMA'],
        },
      ],
      exports: [Neode],
    };
  }
}
