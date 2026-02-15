import CryptoJS from 'crypto-js';

const key = 'UgEGKpZKGU';
const secret = 'c0582b6057d80aee02d47d7a04b352ad';

const ONE_YEAR_MS = 31556952000;
// Adjust nonce if system time is in future (2026) vs real time (2025)
const systemTime = new Date().getTime();
const nonce = systemTime > 1767225600000 ? systemTime - ONE_YEAR_MS : systemTime;

const method = 'GET';
const requestPath = '/v3/balance/';
const body = '';

const dataToSign = nonce + method + requestPath + body;
// Try parsing secret as Hex!
// Try parsing secret as Hex!
const signature = CryptoJS.HmacSHA256(dataToSign, secret).toString(CryptoJS.enc.Hex);
const signatureHex = CryptoJS.HmacSHA256(dataToSign, CryptoJS.enc.Hex.parse(secret)).toString(CryptoJS.enc.Hex);

console.log('Trying Hex parsed secret...');
// Change to signatureHex to test
const finalSignature = signatureHex;

const authHeader = `Bitso ${key}:${nonce}:${finalSignature}`;

console.log('Testing Bitso API...');
console.log('Nonce:', nonce);
console.log('Signature:', signature);

fetch(`https://api.bitso.com/v3/balance/`, {
    method: 'GET',
    headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
    },
})
    .then(async res => {
        console.log('Status:', res.status);
        if (!res.ok) {
            console.log('Error Text:', await res.text());
            return;
        }
        const data = await res.json();
        console.log('Success:', data.success);
        if (data.payload && data.payload.balances) {
            const nonZero = data.payload.balances.filter((b: any) => parseFloat(b.total) > 0);
            console.log('Non-zero balances:', nonZero);
        } else {
            console.log('Payload:', data);
        }
    })
    .catch(err => console.error('Error:', err));
