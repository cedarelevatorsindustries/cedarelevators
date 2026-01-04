import LayoutWrapper from "@/modules/layout/components/layout-wrapper";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LayoutWrapper>
            {children}
        </LayoutWrapper>
    );
}

