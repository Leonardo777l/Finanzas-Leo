import { useEffect } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { useAuth } from './useAuth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useFirestoreSync() {
    const { user } = useAuth();
    const { transactions, assets, goals, subscriptions, currency, importData } = useFinanceStore();

    // Load data from Firestore on login
    useEffect(() => {
        async function loadData() {
            if (!user) return;

            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // We can reuse importData or set state directly. 
                    // importData expects a JSON string, so let's stringify it.
                    importData(JSON.stringify(data));
                    console.log("Data loaded from Firestore");
                } else {
                    console.log("No data found in Firestore, starting fresh.");
                }
            } catch (error) {
                console.error("Error loading data from Firestore:", error);
            }
        }

        loadData();
    }, [user, importData]);

    // Sync data to Firestore on change
    useEffect(() => {
        if (!user) return;

        const saveData = async () => {
            try {
                const docRef = doc(db, 'users', user.uid);
                await setDoc(docRef, {
                    transactions,
                    assets,
                    goals,
                    subscriptions,
                    currency,
                    lastUpdated: new Date().toISOString()
                }, { merge: true });
                console.log("Data synced to Firestore");
            } catch (error) {
                console.error("Error syncing data to Firestore:", error);
            }
        };

        // Debounce could be added here, but for now we'll rely on React's batching 
        // and the fact that these change relatively infrequently.
        const timeoutId = setTimeout(saveData, 1000);

        return () => clearTimeout(timeoutId);
    }, [user, transactions, assets, goals, subscriptions, currency]);
}
