import DocsMobileNav from '@/components/docs/DocsMobileNav';
import DocsSidebar from '@/components/docs/DocsSidebar';

/** Qo'llanma: chapda bo'limlar, o'rtada matn, o'ngda (keng ekranda) mundarija. */
export default function QollanmaLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-5 pb-20 pt-28 md:pt-32">
            <div className="mx-auto flex max-w-7xl gap-10 xl:gap-14">
                <aside className="hidden w-60 shrink-0 lg:block">
                    <div className="sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pb-6">
                        <DocsSidebar />
                    </div>
                </aside>
                <div className="min-w-0 flex-1">
                    <DocsMobileNav />
                    {children}
                </div>
            </div>
        </div>
    );
}
