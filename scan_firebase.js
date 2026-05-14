const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAzNaCsi3Yw5-6879_F1p0b1j0viyKThN4",
    authDomain: "eclipse-store-001.firebaseapp.com",
    projectId: "eclipse-store-001",
    storageBucket: "eclipse-store-001.firebasestorage.app",
    messagingSenderId: "42097707466",
    appId: "1:42097707466:web:21d84f904dbdd1c0872733"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function scan() {
    const collections = ['orders', 'eclipse_orders', 'prev_orders', 'leads', 'messages', 'users'];
    console.log("Scanning collections...");
    
    for (const coll of collections) {
        try {
            const snap = await db.collection(coll).get();
            console.log(`Collection '${coll}': ${snap.size} documents found.`);
            if (snap.size > 0) {
                let count = 0;
                snap.forEach(doc => {
                    if (count < 2) {
                        console.log(`  Sample [${doc.id}]:`, JSON.stringify(doc.data()).substring(0, 100) + "...");
                    }
                    count++;
                });
            }
        } catch (e) {
            console.log(`Collection '${coll}': ERROR (${e.code || e.message})`);
        }
    }
    process.exit();
}

scan();
