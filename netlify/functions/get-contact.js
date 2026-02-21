const axios = require('axios');

exports.handler = async (event) => {
    const { id } = event.queryStringParameters;
    const token = process.env.GITHUB_TOKEN;

    // DIAGNOSTIC 1: Check if Token exists in environment
    if (!token) {
        console.error("❌ ERROR: GITHUB_TOKEN is missing from Netlify Environment Variables.");
        return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error (Token Missing)." }) };
    }

    if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: "ID is required" }) };
    }

    try {
        // REPLACE THESE TWO LINES WITH YOUR ACTUAL INFO
        const REPO_OWNER = "YOUR_GITHUB_USERNAME"; 
        const REPO_NAME = "YOUR_PRIVATE_REPO_NAME";
        
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/contacts.json`;

        console.log(`📡 Attempting to fetch from: ${url}`);

        const response = await axios.get(url, {
            headers: { 
                Authorization: `token ${token}`,
                "Accept": "application/vnd.github.v3.raw"
            }
        });

        const data = response.data;
        const person = data[id];

        if (!person) {
            console.warn(`⚠️ ID Not Found: The ID "${id}" does not exist in the JSON file.`);
            return { statusCode: 404, body: JSON.stringify({ error: "Attendee not found" }) };
        }

        console.log(`✅ Success: Found data for ${person.name}`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(person),
        };

    } catch (error) {
        // DIAGNOSTIC 2: Detailed Error Reporting
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error(`❌ GITHUB API ERROR: ${error.response.status} - ${error.response.statusText}`);
            console.error("Check if your REPO_OWNER and REPO_NAME are exactly correct.");
        } else if (error.request) {
            // The request was made but no response was received
            console.error("❌ NETWORK ERROR: No response received from GitHub API.");
        } else {
            console.error("❌ FUNCTION ERROR:", error.message);
        }

        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Failed to access private directory", detail: error.message }) 
        };
    }
};
