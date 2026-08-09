"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCcw, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/profile");
        return;
      }
      const res = await fetch("http://localhost:5000/api/customer/wallet", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setWallet(data.data.wallet);
        setTransactions(data.data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center px-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2 hover:bg-muted/50 rounded-full cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold flex-1">My Wallet</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchWalletData}
            className="rounded-full cursor-pointer"
          >
            <RefreshCcw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 border-none shadow-lg text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-sm font-medium opacity-90">Available Balance</span>
              {loading ? (
                <Skeleton className="h-10 w-32 bg-primary-foreground/20" />
              ) : (
                <span className="text-4xl font-bold tracking-tight flex items-center">
                  <span className="text-2xl mr-1">₹</span>
                  {wallet?.balance?.toFixed(2) || "0.00"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold px-1">Recent Transactions</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <HandCoins className="h-12 w-12 mb-2" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map(txn => (
                <Card key={txn._id} className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1 flex-1 pr-4">
                      <p className="font-medium text-sm line-clamp-1">{txn.description || "Wallet Transaction"}</p>
                      <p className="text-xs text-muted-foreground uppercase">{txn.type.replace("_", " ")}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`font-bold ${["order_refund", "order_cancellation", "store_earning", "rider_earning"].includes(txn.type) ? "text-green-500" : "text-destructive"}`}>
                        {["order_refund", "order_cancellation", "store_earning", "rider_earning"].includes(txn.type) ? "+" : "-"} ₹{txn.amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">{txn.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
