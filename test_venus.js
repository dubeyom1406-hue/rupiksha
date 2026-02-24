import axios from 'axios';

const test = async () => {
    try {
        const res = await axios.post(
            'https://api.venusrecharge.com/V2/api/recharge/transaction',
            {
                mobileNo: '9999999999',
                operatorCode: 'ATL',
                serviceType: 'MR',
                amount: 10,
                merchantRefNo: 'TEST' + Date.now()
            },
            {
                headers: {
                    authkey: '10092',
                    authpass: 'RUPIKSHA@816',
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        console.log('Success:', res.data);
    } catch (err) {
        console.log('Error Message:', err.message);
        console.log('Error Data:', err.response?.data);
    }
};

test();
