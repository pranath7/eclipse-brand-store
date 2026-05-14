const firebase = require('firebase/app');
require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAzNaCsi3Yw5-6879_F1p0b1j0viyKThN4",
    authDomain: "eclipse-store-001.firebaseapp.com",
    projectId: "eclipse-store-001",
    storageBucket: "eclipse-store-001.firebasestorage.app",
    messagingSenderId: "42097707466",
    appId: "1:42097707466:web:21d84f904dbdd1c0872733"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function checkOrders() {
    console.log("Fetching orders...");
    try {
        const snap = await db.collection('orders').get();
        console.log(`Found ${snap.size} orders.`);
        snap.forEach(doc => {
            console.log(`Order ID: ${doc.id}, Data:`, JSON.stringify(doc.data(), null, 2));
        });
        
        const leadsSnap = await db.collection('leads').get();
        console.log(`Found ${leadsSnap.size} leads.`);
        
        const usersSnap = await db.collection('users').get();
        console.log(`Found ${usersSnap.size} users.`);
        
    } catch (e) {
        console.error("Error fetching data:", e);
    } finally {
        process.exit();
    }
}

checkOrders();
