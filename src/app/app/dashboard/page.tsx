"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { WalletAddress } from "@/components/ui/WalletAddress";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatBalance = (balance: string | undefined) => {
    if (!balance) return "$0.00";
    const num = parseFloat(balance);
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Sistema retorna 0 para usuarios nuevos (no hardcode)
  const activeProjects = 0; // TODO: Obtener del backend cuando esté disponible
  const pendingProposals = 0; // TODO: Obtener del backend cuando esté disponible

  const stats = [
    { label: "Active Projects", value: String(activeProjects), icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { label: "Pending Proposals", value: String(pendingProposals), icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "Reserved Balance", value: mounted ? formatBalance(user?.balance?.reserved) : "...", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    { label: "Available Balance", value: mounted ? formatBalance(user?.balance?.available) : "...", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div
        className={cn(
          "flex items-center w-full px-4 py-3 rounded-2xl",
          "bg-white",
          "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
        )}
      >
        <svg className="w-5 h-5 text-text-secondary mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search projects, proposals, messages..."
          className="w-full bg-transparent text-sm text-text-primary placeholder-text-secondary outline-none"
        />
      </div>

      {/* Welcome Section */}
      <div
        className={cn(
          "p-6 rounded-2xl",
          "bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Welcome back{mounted && user?.username ? `, ${user.username}` : ""}!
        </h1>
        <p className="text-text-secondary">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          {mounted && user?.type && (
            <span className={cn(
              "inline-block px-3 py-1 rounded-full text-xs font-medium",
              "bg-primary/10 text-primary"
            )}>
              {user.type === "BOTH" ? "Buyer & Seller" : user.type === "BUYER" ? "Buyer" : "Seller"}
            </span>
          )}
          {mounted && user?.wallet?.publicKey && (
            <WalletAddress address={user.wallet.publicKey} />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "p-5 rounded-2xl",
              "bg-white",
              "shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]"
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  "bg-primary/10"
                )}
              >
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <div
        className={cn(
          "p-6 rounded-2xl",
          "bg-white",
          "shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]"
        )}
      >
        <h2 className="text-lg font-bold text-text-primary mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "New proposal received", project: "E-commerce Website", time: "2 hours ago" },
            { action: "Message from client", project: "Mobile App Design", time: "5 hours ago" },
            { action: "Project milestone completed", project: "Dashboard UI", time: "1 day ago" },
          ].map((activity, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl",
                "bg-background",
                "shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
              )}
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{activity.action}</p>
                <p className="text-xs text-text-secondary">{activity.project}</p>
              </div>
              <span className="text-xs text-text-secondary">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
