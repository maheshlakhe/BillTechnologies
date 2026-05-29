import axios from 'axios';

async function test() {
    try {
        console.log('Testing login endpoint...');
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'support_healthcare@agbtechnologies.com',
            password: 'Shubham@143'
        });

        console.log('Login Response User Keys:', Object.keys(loginRes.data.user));
        console.log('Login Response Industry:', loginRes.data.user.industry);
        console.log('Login Response IndustryId:', loginRes.data.user.industryId);

        const token = loginRes.data.token;

        console.log('\nTesting profile endpoint...');
        const profileRes = await axios.get('http://localhost:5001/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Profile Response User Keys:', Object.keys(profileRes.data.user));
        console.log('Profile Response Industry:', profileRes.data.user.industry);
        console.log('Profile Response IndustryId:', profileRes.data.user.industryId);

    } catch (error: any) {
        console.error('Error testing endpoints:', error.response?.data || error.message);
    }
}

test();
