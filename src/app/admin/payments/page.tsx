"use client";

import { useEffect, useState } from "react";
import { Search, CreditCard } from "lucide-react";

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/payments?page=${page}`);
            if (res.ok) {
                const data = await res.json();
                setPayments(data.payments || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">결제 관리</h1>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-white/80">
                    <thead className="bg-white/5 text-white/40 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">결제 정보</th>
                            <th className="px-6 py-4">유저</th>
                            <th className="px-6 py-4">금액</th>
                            <th className="px-6 py-4">상태</th>
                            <th className="px-6 py-4">일시</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40">로딩 중...</td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40">결제 내역이 없습니다.</td></tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white">{payment.merchant_uid}</span>
                                            <span className="text-xs text-white/40">{payment.imp_uid}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white">{payment.users?.nickname || "Unknown"}</span>
                                            <span className="text-xs text-white/40">{payment.users?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">
                                        {payment.amount.toLocaleString()}원
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${payment.status === 'paid' ? "bg-green-500/20 text-green-400" :
                                                payment.status === 'cancelled' ? "bg-red-500/20 text-red-400" :
                                                    "bg-white/10 text-white/40"
                                            }`}>
                                            {payment.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/60">
                                        {new Date(payment.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg bg-white/5 disabled:opacity-50 text-sm"
                >
                    이전
                </button>
                <span className="px-4 py-2 text-sm text-white/60">{page}</span>
                <button
                    disabled={payments.length < 20}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg bg-white/5 disabled:opacity-50 text-sm"
                >
                    다음
                </button>
            </div>
        </div>
    );
}
