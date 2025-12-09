import { generateCSVTemplate, parseCSV } from '../lib/csvUtils';
import { FileText, Download, Upload, Trash } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { GlassCard } from '../components/ui/GlassCard';
import { CashFlowChart } from '../components/CashFlowChart';

export function CashFlow() {
    const { transactions, exportData, importData, resetData, addTransactions } = useFinanceStore();

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    importData(event.target.result as string);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const parsed = parseCSV(event.target.result as string);
                    if (parsed.length > 0) {
                        // Cast to any to bypass strict Partial<Transaction> vs Omit<Transaction, 'id'> mismatch for now
                        // In a real app we'd validate more strictly
                        addTransactions(parsed as any);
                        alert(`Se importaron ${parsed.length} transacciones exitosamente.`);
                    }
                }
            };
            reader.readAsText(file);
        }
    };

    const handleDownloadTemplate = () => {
        const template = generateCSVTemplate();
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla-transacciones.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos? Esto no se puede deshacer.')) {
            resetData();
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Flujo de Caja y Proyecciones
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                        title="Descargar plantilla CSV"
                    >
                        <FileText size={16} />
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-white/10">
                        <Upload size={16} />
                        CSV
                        <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-white/10">
                        <Upload size={16} />
                        JSON
                        <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                    </label>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <Download size={16} />
                        Exportar
                    </button>
                </div>
            </div>

            <GlassCard className="min-h-[500px]" delay={0.1}>
                <h3 className="text-lg font-semibold mb-6">Análisis de Flujo de Caja</h3>
                <div className="h-[400px]">
                    <CashFlowChart transactions={transactions} />
                </div>
            </GlassCard>

            <GlassCard className="border-rose-500/20" delay={0.2}>
                <h3 className="text-xl font-semibold mb-4 text-rose-400">Zona de Peligro</h3>
                <p className="text-muted-foreground mb-4">
                    Reiniciar tus datos eliminará todas las transacciones y activos. Asegúrate de exportar tus datos primero.
                </p>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-colors"
                >
                    <Trash size={16} />
                    Reiniciar Todos los Datos
                </button>
            </GlassCard>
        </div>
    );
}
