
export default async function handler(req: any, res: any) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, queryId } = req.body;

    if (!token || !queryId) {
        return res.status(400).json({ error: 'Missing token or queryId' });
    }

    try {
        // Step 1: Request Report Generation
        const generateUrl = `https://www.interactivebrokers.com/Universal/servlet/FlexStatementService.SendRequest?t=${token}&q=${queryId}&v=3`;

        // Note: fetch is available in Vercel Node.js runtime (v18+)
        const genResponse = await fetch(generateUrl, {
            headers: { 'User-Agent': 'FinanceDashboard/1.0' }
        });
        const genXml = await genResponse.text();

        console.log('Generate Response:', genXml);

        if (!genXml.includes('<Status>Success</Status>')) {
            // Extract error message if possible
            const match = genXml.match(/<ErrorMessage>(.*?)<\/ErrorMessage>/);
            throw new Error(match ? match[1] : 'Failed to generate report');
        }

        const codeMatch = genXml.match(/<ReferenceCode>(.*?)<\/ReferenceCode>/);
        const urlMatch = genXml.match(/<Url>(.*?)<\/Url>/);

        if (!codeMatch || !urlMatch) {
            throw new Error('Reference code or URL not found in response');
        }

        const referenceCode = codeMatch[1];
        const baseUrl = urlMatch[1]; // Ideally use this, but standard is also fixed

        // Step 2: Retrieve Report
        // IBKR requires a small delay sometimes, but let's try immediately as per docs
        const retrieveUrl = `${baseUrl}?q=${referenceCode}&t=${token}&v=3`;

        const reportResponse = await fetch(retrieveUrl, {
            headers: { 'User-Agent': 'FinanceDashboard/1.0' }
        });

        if (!reportResponse.ok) {
            throw new Error(`Failed to retrieve report: ${reportResponse.status}`);
        }

        const reportXml = await reportResponse.text();

        // Return the raw XML (frontend will parse it with fast-xml-parser)
        // Or we could parse it here, but keeping backend simple is good.
        res.status(200).send(reportXml);

    } catch (error: any) {
        console.error('IBKR Proxy Error:', error);
        res.status(500).json({ error: error.message || 'Unknown error' });
    }
}
