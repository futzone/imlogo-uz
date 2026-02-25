import DocsSidebar from '@/components/docs/DocsSidebar';

export default function QollanmaLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="pt-24 md:pt-32 pb-16 px-5">
            <div className="max-w-7xl mx-auto flex gap-8">
                {/* Sidebar - desktop */}
                <aside className="hidden lg:block w-56 shrink-0">
                    <div className="sticky top-32">
                        <DocsSidebar />
                    </div>
                </aside>

                {/* Mobile sidebar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-4 py-2">
                    <div className="flex gap-2 overflow-x-auto">
                        <DocsSidebar />
                    </div>
                </div>

                {/* Main content area */}
                {children}
            </div>
        </div>
    );
}
