import GlobalBackground from "@/components/ui/GlobalBackground";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardMain from "./DashboardMain";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-[#030014] text-white overflow-hidden font-sans selection:bg-cyan-500/30">
            <GlobalBackground />
            <DashboardSidebar />
            <main className="flex-1 relative z-10 flex flex-col h-full overflow-hidden">
                <DashboardHeader />
                <DashboardMain>
                    {children}
                </DashboardMain>
            </main>
        </div>
    );
}
