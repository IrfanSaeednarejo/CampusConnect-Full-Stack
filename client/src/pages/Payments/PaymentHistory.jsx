import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyPaymentsThunk,
  selectPayments,
  selectPaymentLoading,
} from '../../redux/slices/paymentSlice';
import CircularProgress from '../../components/common/CircularProgress';
import StatCard from '../../components/common/StatCard';

export default function PaymentHistory() {
  const dispatch = useDispatch();
  const payments = useSelector(selectPayments);
  const loading = useSelector(selectPaymentLoading);

  useEffect(() => {
    dispatch(fetchMyPaymentsThunk());
  }, [dispatch]);

  const totalSpent = payments.reduce((acc, p) => acc + (p.status === 'succeeded' ? p.amount : 0), 0);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0d1117] text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-gray-400 mt-1">Review your transactions, event registrations, and mentoring session payments.</p>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Transactions" value={payments.length} icon="receipt_long" color="blue" />
          <StatCard title="Total Amount Spent" value={`$${(totalSpent / 100).toFixed(2)}`} icon="payments" color="green" />
          <StatCard title="Pending Verifications" value={payments.filter(p => p.status === 'pending').length} icon="hourglass_empty" color="orange" />
        </div>

        {/* Transaction Table */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
          {loading && payments.length === 0 ? (
            <div className="flex justify-center py-20">
              <CircularProgress />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0d1117] border-b border-[#30363d]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Transaction ID</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Service / Item</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-400">{payment._id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{payment.description || (payment.type === 'event_registration' ? 'Event Registration' : 'Mentoring Session')}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        ${(payment.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          payment.status === 'succeeded' ? 'bg-green-900/20 text-green-500' : 
                          payment.status === 'pending' ? 'bg-orange-900/20 text-orange-500' : 'bg-red-900/20 text-red-500'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {payments.length === 0 && (
                <div className="py-20 text-center text-gray-500">
                  <span className="material-symbols-outlined text-4xl mb-4">account_balance_wallet</span>
                  <p>You haven't made any transactions yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500">
           <span className="material-symbols-outlined text-sm">security</span>
           All transactions are encrypted and processed securely via Stripe.
        </div>
      </div>
    </div>
  );
}
