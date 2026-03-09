// Quick test to check if leaderboard API is working correctly
const axios = require('axios');

async function testLeaderboardAPI() {
  try {
    console.log("Testing leaderboard API...");
    
    // Test without filters (should return all students)
    console.log("\n1. Testing without filters:");
    const allStudents = await axios.get('http://localhost:5000/api/auth/leaderboard', {
      headers: {
        Authorization: 'Bearer test-token' // You'll need a real token
      }
    });
    console.log(`Found ${allStudents.data.length} students total`);
    console.log('Sample students:', allStudents.data.slice(0, 3).map(s => ({
      name: s.name,
      year: s.year,
      section: s.section,
      points: s.totalPoints
    })));

    // Test with year filter (III)
    console.log("\n2. Testing with year=III filter:");
    const thirdYearStudents = await axios.get('http://localhost:5000/api/auth/leaderboard?year=III', {
      headers: {
        Authorization: 'Bearer test-token' // You'll need a real token
      }
    });
    console.log(`Found ${thirdYearStudents.data.length} III year students`);
    console.log('Sample III year students:', thirdYearStudents.data.slice(0, 3).map(s => ({
      name: s.name,
      year: s.year,
      section: s.section,
      points: s.totalPoints
    })));

  } catch (error) {
    console.error('API Test failed:', error.response?.data || error.message);
  }
}

testLeaderboardAPI();