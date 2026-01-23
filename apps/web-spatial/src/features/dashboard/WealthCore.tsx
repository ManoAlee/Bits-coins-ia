'use client';

import { useState } from 'react';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Plus, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function WealthCore() {
    // Mock Data for "What Every Human Needs" - Money Management
    const [balance] = useState(12450.00);
    const [transactions] = useState([
        { id: 1, to: 'Uber Technologies', amount: -45.90, date: 'Today, 14:30', cat: 'Transport' },
        { id: 2, to: 'Spotify Premium', amount: -21.90, date: 'Yesterday', cat: 'Subscription' },
        { id: 3, to: 'Salary Deposit', amount: 4500.00, date: '21 Jan', cat: 'Income', type: 'in' },
        { id: 4, to: 'Supermercado Extra', amount: -450.23, date: '20 Jan', cat: 'Groceries' },
    ]);

    const allocation = [
        { name: 'Crypto', value: 400, color: '#06b6d4' }, // Cyan
        { name: 'Stocks', value: 300, color: '#10b981' }, // Emerald
        { name: 'Cash', value: 300, color: '#64748b' },   // Slate
        { name: 'Gold', value: 200, color: '#eab308' },   // Yellow
    ];

    return (
        <div className="h-full flex gap-8">
            {/* Left Column: Wealth Overview */}
            <div className="w-1/3 flex flex-col gap-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-cyan-950 to-black border border-cyan-500/30 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Wallet size={64} className="text-cyan-500" />
                    </div>

                    <h3 className="text-cyan-500/70 text-sm font-mono tracking-widest mb-1">TOTAL NET WORTH</h3>
                    <div className="text-4xl font-black text-white font-mono tracking-tighter mb-4">
                        <span className="text-2xl text-gray-500 align-top mr-1">R$</span>
                        {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    <div className="flex gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold border border-emerald-500/20">
                            <ArrowUpRight size={10} /> +12.5% MTD
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded font-bold border border-white/10">
                            LAST UPDATED: JUST NOW
                        </span>
                    </div>
                </div>

                {/* Asset Allocation */}
                <div className="flex-1 bg-black/20 border border-white/5 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <PieIcon size={14} /> Allocation
                    </h3>
                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocation}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {allocation.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-xs text-gray-500">ASSETS</span>
                            <span className="text-xl font-bold text-white">4</span>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4">
                        {allocation.map(item => (
                            <div key={item.name} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] text-gray-400 uppercase">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Transactions & Actions */}
            <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-8 flex flex-col backdrop-blur-sm">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all">
                        <Plus size={14} /> NEW ENTRY
                    </button>
                </div>

                <div className="flex-1 overflow-auto pr-2 space-y-2">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-gray-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400'}`}>
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-200 group-hover:text-white">{tx.to}</div>
                                    <div className="text-[10px] text-gray-500 font-mono uppercase">{tx.cat} • {tx.date}</div>
                                </div>
                            </div>
                            <div className={`font-mono font-bold ${tx.type === 'in' ? 'text-emerald-400' : 'text-gray-300'}`}>
                                {tx.type === 'in' ? '+' : ''} R$ {Math.abs(tx.amount).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
