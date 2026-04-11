async function testFetch() {
    try {
        const email = "testing.society@example.com";
        const password = "password123";

        const loginRes = await fetch("http://localhost:8000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        const cookie = loginRes.headers.get("set-cookie");
        const token = cookie ? cookie.split(';')[0].split('=')[1] : loginData.data.accessToken;

        const headers = { Authorization: `Bearer ${token}` };

        const res = await fetch(`http://localhost:8000/api/users/${loginData.data.user._id}/societies`, { headers });
        const resData = await res.json();
        console.log("Societies response:", JSON.stringify(resData, null, 2));

        let socId = null;
        if (resData.data && resData.data.docs && resData.data.docs.length > 0) {
            socId = resData.data.docs[0]._id;
        } else if (resData.data && resData.data.length > 0) {
            socId = resData.data[0]._id || resData.data[0].id;
        }

        if (socId) {
            const stats = await fetch(`http://localhost:8000/api/societies/${socId}/stats`, { headers });
            const statsData = await stats.json();
            console.log("Stats response:", JSON.stringify(statsData, null, 2));
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

testFetch();
