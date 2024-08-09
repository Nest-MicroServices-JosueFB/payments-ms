import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, response, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {

    private readonly stripe = new Stripe(envs.stripeSecret)
    private readonly logger = new Logger('PaymentsService')

    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy
    ){}

    async createPaymentSession(paymentSessionDto:PaymentSessionDto){

        const {currency, items, orderId} = paymentSessionDto

        const lineItems = items.map(item=>{
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name
                    },
                    unit_amount: Math.round(item.price * 100), //20 dolares como 20.00 | 2000 / 100 = 20.00
                },
                quantity: item.quantity
            }
        })

        const session = await this.stripe.checkout.sessions.create({
            // Colocar aqui id de la orden
            payment_intent_data: {
                metadata: {
                    orderId
                }
            },
            // Los articulos que esta comprando
            line_items: lineItems,
            mode: 'payment',
            success_url: envs.stripeSuccessUrl,
            cancel_url: envs.stripeCancelUrl,
        })

        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url
        }
    }

    async stripeWebhook(req: Request, res:Response){
        const signature = req.headers['stripe-signature']
        let event: Stripe.Event;
        const endpointSecret = envs.stripeEndPointSecret
        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], signature, endpointSecret)
        } catch (error) {
            res.status(400).send(`Webhook Error: ${error.message}`)
            return;
        }

        switch (event.type) {
            case 'charge.succeeded':
                const chargeSucceded = event.data.object
                const payload = {
                    stripePaymentId: chargeSucceded.id,
                    orderId: chargeSucceded.metadata.orderId,
                    receiptUrl: chargeSucceded.receipt_url
                }
                this.logger.log({payload});
                // this.client.send= Espera una respuesta | this.client.emit=No espera respuesta
                this.client.emit('payment.succeded', payload)
                break;
            default:
                console.log(`Event ${event.type} not handled`);
                break;
        }
        return res.status(200).json({
            signature
        })
    }

}
