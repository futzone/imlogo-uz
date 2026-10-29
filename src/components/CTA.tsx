import { ctaDetails } from "@/data/cta"

import AppStoreButton from "./AppStoreButton"
import PlayStoreButton from "./PlayStoreButton"
import WindowsButton from "./WindowsButton"
import MacButton from "./MacButton"
import Reveal from "./ui/Reveal"

const CTA: React.FC = () => {
    return (
        <section id="cta" className="bg-background px-5 py-20 md:py-24">
            <Reveal className="mx-auto max-w-7xl">
                <div className="relative overflow-hidden rounded-3xl bg-[#14101f] px-5 py-16 text-center text-white shadow-glow-card sm:py-20">
                    {/* Katak naqsh va binafsha yorug'lik */}
                    <div
                        aria-hidden
                        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_100%)]"
                    />
                    <div aria-hidden className="absolute -bottom-40 left-1/2 h-80 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-primary opacity-60 blur-[120px]" />
                    <div aria-hidden className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-secondary opacity-30 blur-[120px]" />

                    <div className="relative flex flex-col items-center">
                        <h2 className="max-w-2xl text-3xl font-bold text-balance md:text-5xl">{ctaDetails.heading}</h2>

                        <p className="mx-auto mt-4 max-w-xl text-white/70">{ctaDetails.subheading}</p>

                        <div className="mt-8 flex w-full max-w-xs flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                            <AppStoreButton />
                            <PlayStoreButton />
                            <WindowsButton />
                            <MacButton />
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    )
}

export default CTA
