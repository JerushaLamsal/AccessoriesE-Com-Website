import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Verify payment endpoint
app.post('/verify-payment', async (req, res) => {
    const { oid, amt, refId } = req.body;

    try {
        const response = await axios.get('https://uat.esewa.com.np/epay/transrec', {
            params: {
                amt: amt,
                scd: 'EPAYTEST',
                pid: oid,
                rid: refId
            }
        });

        if (response.data.includes('<response_code>Success</response_code>')) {
            return res.json({ status: 'success' });
        } else {
            return res.json({ status: 'failed' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Verification failed' });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));
