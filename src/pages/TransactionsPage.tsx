import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Receipt,
  ExternalLink,
  Coins,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { TransactionRecord } from '../../shared/types';
import { ALGORAND_TESTNET_CONFIG, GOPLAUSIBLE_CONFIG } from '../../shared/constants';

export const TransactionsPage: React.FC = () => {
  const { addToast } = useApp();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = () => {
    setLoading(true);
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions) setTransactions(data.transactions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-stone-800 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/30">
                ON-CHAIN SETTLEMENT LEDGER
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-mono">
                ALGORAND TESTNET
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Transaction History
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm">
              All cluster pool transactions and escrow settlements are recorded and verified on Algorand Testnet.
            </p>
          </div>

          <button
            onClick={fetchTransactions}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-stone-700 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Testnet Ledger</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="font-bold font-display text-lg text-stone-900">
              Verified Blockchain Records
            </h3>
            <p className="text-xs text-stone-500">
              Click any transaction ID to view cryptographic consensus on Algorand Lora Explorer
            </p>
          </div>

          <span className="text-xs font-mono bg-stone-100 text-stone-700 px-3 py-1 rounded-full">
            {transactions.length} Total Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 font-semibold">Service / Action</th>
                <th className="py-3 px-3 font-semibold">Amount</th>
                <th className="py-3 px-3 font-semibold">Sender (Farmer / Buyer)</th>
                <th className="py-3 px-3 font-semibold">Receiver (Merchant / Cluster)</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Explorer Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3 px-3 font-sans font-medium text-stone-900">
                    {tx.serviceName}
                  </td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">
                    {tx.amountUsdc} USDC
                  </td>
                  <td className="py-3 px-3 text-stone-600 truncate max-w-[120px]">
                    {tx.senderAddress.slice(0, 6)}...{tx.senderAddress.slice(-4)}
                  </td>
                  <td className="py-3 px-3 text-stone-600 truncate max-w-[120px]">
                    {tx.receiverAddress.slice(0, 6)}...{tx.receiverAddress.slice(-4)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <a
                      href={`${ALGORAND_TESTNET_CONFIG.explorerBaseUrl}${tx.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{tx.txId.slice(0, 8)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
