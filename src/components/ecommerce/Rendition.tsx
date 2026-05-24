interface RenditionProgressItem {
    cod_rnd: number;
    num_rnd: string;
    monto_rendido: number;
    reintegro: number;
    porcentaje: number;
    sobrante: number;
}

interface Props {
    renditions?: RenditionProgressItem[];
}

export default function RendicionesDashboard({ renditions = [] }: Props) {
    const sorted = [...renditions].sort((a, b) => Number(a.num_rnd) - Number(b.num_rnd));
    const fmt = (val: string | number) => {
        const num = Number(val) || 0;
        return "Bs. " + num.toLocaleString("es-VE", { minimumFractionDigits: 2 });
    };

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-xl shadow-gray-100 dark:shadow-none">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="text-base font-black text-gray-800 dark:text-white">Rendiciones de la Orden de Pago</h3>
                <p className="text-xs font-medium text-gray-500 mt-1">Progreso y acumulado financiero por rendición</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Rendición</th>
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Monto Rendido</th>
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Reintegro</th>
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Porcentaje</th>
                            <th className="p-4 text-left text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Sobrante</th>
                            <th className="p-4 text-center text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renditions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-gray-400 font-medium">
                                    No hay rendiciones registradas para esta orden de pago.
                                </td>
                            </tr>
                        ) : (
                            sorted.map((item, i) => (
                                <tr key={item.cod_rnd || i} className="border-b border-gray-100 dark:border-gray-800/80 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="p-4">
                                        <span className="font-semibold text-gray-800 dark:text-white/90">Rendición #{item.num_rnd}</span>
                                    </td>
                                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                                        {fmt(item.monto_rendido)}
                                    </td>
                                    <td className="p-4">
                                        {item.reintegro > 0 ? (
                                            <span className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/30">
                                                {fmt(item.reintegro)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500 font-medium">Bs. 0,00</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                                        {item.porcentaje}%
                                    </td>
                                    <td className="p-4 font-bold text-gray-500 dark:text-gray-400">
                                        {fmt(item.sobrante)}
                                    </td>
                                    <td className="p-4 text-center">
                                        {item.porcentaje >= 100 ? (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/30">
                                                Completado
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-950/30">
                                                En Progreso
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}