const axios = require('axios');

exports.handler = async (event) => {
    // 1. Get the ID from the URL (e.g., ?id=AC26-X7R1-9Z2P)
    const { id } = event.queryStringParameters;
    const token = process.env.GITHUB_TOKEN;

    // Security: If no ID is provided, don't even try to fetch
    if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: "ID is required" }) };
    }

    try {
        // 2. Fetch the master file from your PRIVATE GitHub Repository
        // Replace YOUR_USER and YOUR_PRIVATE_REPO with your actual GitHub details
        const url = `https://api.github.com/repos/YOUR_USER/YOUR_PRIVATE_REPO/contents/contacts.json`;
        
        const response = await axios.get(url, {
            headers: { 
                Authorization: `token ${token}`,
                "Accept": "application/vnd.github.v3.raw" // Get raw JSON directly
            }
        });

        const data = response.data;

        // 3. Find the specific attendee by their Secure ID
        const person = data[id];

        if (!person) {
            return { 
                statusCode: 404, 
                body: JSON.stringify({ error: "Attendee not found" }) 
            };
        }

        // 4. Return only the individual's data
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=300" // Cache for 5 mins to save API hits
            },
            body: JSON.stringify(person),
        };

    } catch (error) {
        console.error("GitHub API Error:", error.message);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to access private directory" }) 
        };
    }
};