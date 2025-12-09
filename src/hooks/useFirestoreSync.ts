import { useEffect, useState } from 'react';
import { useFinanceStore } from '../store/financeStore';
import { useAuth } from './useAuth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useFirestoreSync() {
    const { user } = useAuth();
    const { transactions, assets, goals, subscriptions, currency, importData, setSyncStatus } = useFinanceStore();
    const [isInitialized, setIsInitialized] = useState(false);

    // Load data from Firestore on login
    useEffect(() => {
        async function loadData() {
            if (!user) {
                setIsInitialized(false);
                setSyncStatus('offline');
                return;
            }

            setSyncStatus('syncing');
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    importData(JSON.stringify(data));
                    console.log("Data loaded from Firestore");
                } else {
                    console.log("No data found in Firestore, starting fresh.");
                }
                setSyncStatus('synced');
            } catch (error: any) {
                console.error("Error loading data from Firestore:", error);
                if (error.code === 'permission-denied') {
                    setSyncStatus('error', 'Permiso denegado: Revisa las reglas de Firestore.');
                } else {
                    setSyncStatus('error', 'Error al cargar datos.');
                }
            } finally {
                setIsInitialized(true);
            }
        }

        loadData();
    }, [user, importData, setSyncStatus]);

    // Sync data to Firestore on change
    useEffect(() => {
        if (!user || !isInitialized) return;

        const saveData = async () => {
            setSyncStatus('syncing');
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
                setSyncStatus('synced');
            } catch (error: any) {
                console.error("Error syncing data to Firestore:", error);
                if (error.code === 'permission-denied') {
                    setSyncStatus('error', 'Permiso denegado: Revisa las reglas de Firestore.');
                } else {
                    setSyncStatus('error', 'Error al guardar datos.');
                }
            }
        };

        const timeoutId = setTimeout(saveData, 1000);

        return () => clearTimeout(timeoutId);
    }, [user, isInitialized, transactions, assets, goals, subscriptions, currency, setSyncStatus]);
}
