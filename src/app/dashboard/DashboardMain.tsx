"use client";

import { usePathname } from "next/navigation";

export default function DashboardMain({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isCommunityPage = pathname === "/dashboard/community";

    return (
        <div
            className={`
                flex-1 relative
                ${isCommunityPage
                    ? "overflow-hidden p-0"
                    : "p-8 overflow-y-auto custom-scrollbar"
                }
            `}
        >
            {children}
        </div>
    );
}
