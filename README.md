## Payments Microservice


For Install Stripe
https://docs.stripe.com/libraries?lang=node
```
npm install stripe --save
```

https://dashboard.hookdeck.com/connections
1. Crear coneccion tipo cli apuntando al enpoint que sera del webhook /payments/webhook
2. Hacer un login en la consola
```
hookdeck login
```
3. Referencia al port en el que corre el servicio con el endpoint de webhook
```
hookdeck listen [PORT] stripe-to-localhost-2
```