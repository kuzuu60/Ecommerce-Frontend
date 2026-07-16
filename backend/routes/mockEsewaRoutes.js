const express = require('express');
const router = express.Router();

/**
 * Mock eSewa Transaction Verification API
 * Path: /mobile/transaction
 * Method: GET
 * Query Params: 
 *  - txnRefId 
 *  OR
 *  - productId & amount
 */
router.get('/mobile/transaction', (req, res) => {
    const { txnRefId, productId, amount } = req.query;
    const merchantId = req.headers['merchantid'];
    const merchantSecret = req.headers['merchantsecret'];

    // In a real scenario, you would validate merchant credentials.
    // For this mock, we just ensure they are sent (or you could completely bypass).
    if (!merchantId || !merchantSecret) {
        return res.status(401).json([{
            code: "41",
            message: {
                technicalSuccessMessage: "Authentication Failed",
                successMessage: "Invalid Merchant Credentials"
            }
        }]);
    }

    // Mock response payload
    const responsePayload = [
        {
            "productId": productId || "1999",
            "productName": "Android SDK Payment",
            "totalAmount": amount || "25.0",
            "code": "00",
            "message": {
                "technicalSuccessMessage": "Your transaction has been completed.",
                "successMessage": "Your transaction has been completed."
            },
            "transactionDetails": {
                "date": new Date().toString(),
                "referenceId": txnRefId || "0004VZR",
                "status": "COMPLETE"
            },
            "merchantName": "Luxe E-commerce"
        }
    ];

    res.json(responsePayload);
});

/**
 * Mock eSewa Callback URL endpoint
 * Path: /callback
 * Method: POST
 */
router.post('/callback', (req, res) => {
    // eSewa sends proof of payment here
    console.log("Received eSewa Callback:", req.body);
    res.status(200).json({ status: "success", message: "Callback received" });
});

module.exports = router;
