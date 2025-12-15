export const initiateKhaltiPayment = (amount, onSuccess, onError) => {
    const config = {
        // Replace with your public key
        "publicKey": "test_public_key_12345",
        "productIdentity": "1234567890",
        "productName": "E-commerce Product",
        "productUrl": "http://localhost:5173/",
        "eventHandler": {
            onSuccess(payload) {
                console.log('Payment Success', payload);
                onSuccess(payload);
            },
            onError(error) {
                console.error('Payment Failed', error);
                onError(error);
            },
            onClose() {
                console.log('Payment widget closed');
            }
        },
        "paymentPreference": ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"]
    };

    const checkout = new window.KhaltiCheckout(config);
    checkout.show({ amount: amount });
};
