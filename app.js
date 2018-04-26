const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    // get these info on PayPal developer account page when generate fake accounts for buyer and seller
    'client_id': 'Aa6bv0HjRx0o-vUdSMPbEfGkuIhNRUkB3dUhnIc3LJYiTcFRP-Ip2umBnZSEBHTSljq0G-LuWjgkT4lg',
    'client_secret': 'EHfUEESV1DawAzz80GYbMlafNfJrGNDV4IExeO--9CDYAOaG1CXGZp93kuJX1DHC7Lt3AKs3duh6eFva'
  });

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:8000/success",
            "cancel_url": "http://localhost:8000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Black Wind Breaker",
                    "sku": "001",
                    "price": "250",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "250"
            },
            "description": "This is the best wind breaker ever."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log(payment);
            // need to send the user to 'approval_url', since post route come back array with json urls
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
                
            }
        }
    });

});

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "250"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });

});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(8000, () => console.log('****** Server Started ******'));