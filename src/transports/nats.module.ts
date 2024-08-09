import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE, envs } from 'src/config';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: NATS_SERVICE, 
                transport: Transport.NATS,
                options: {
                // host: envs.productsMicroserviceHsost,
                // port: envs.productsMicroservicePort
                servers: envs.natsServers
                }
            }
        ])
    ],
    exports: [
        ClientsModule.register([
            {
                name: NATS_SERVICE, 
                transport: Transport.NATS,
                options: {
                // host: envs.productsMicroserviceHost,
                // port: envs.productsMicroservicePort
                servers: envs.natsServers
                }
            }
        ])
    ]
})
export class NatsModule {}
