"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { LuChevronDown } from "react-icons/lu";

import Reveal from "./ui/Reveal";
import SectionHeading from "./ui/SectionHeading";
import { faqs } from "@/data/faq";

/** Savol-javoblar. Qidiruv tizimlari uchun FAQPage tuzilmaviy ma'lumoti `page.tsx` da qo'shiladi. */
const FAQ: React.FC = () => (
    <section id="savollar" className="bg-surface py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-5">
            <Reveal>
                <SectionHeading
                    eyebrow="Savol-javoblar"
                    title="Köp beriladigan"
                    accent="savollar"
                    description="Javob topa olmadingizmi? Telegram kanalimizga yozing yoki ilovadagi «Murojaat qoldiriş» tugmasidan foydalaning."
                />
            </Reveal>

            <div className="mt-12 flex flex-col gap-3">
                {faqs.map(faq => (
                    <Disclosure key={faq.question} as="div" className="rounded-2xl border border-line bg-white">
                        <DisclosureButton className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                            <h3 className="font-heading text-[17px] font-semibold leading-snug">{faq.question}</h3>
                            <LuChevronDown
                                size={20}
                                aria-hidden
                                className="shrink-0 text-primary transition-transform duration-200 group-data-[open]:rotate-180"
                            />
                        </DisclosureButton>
                        <DisclosurePanel className="px-5 pb-5 text-[15px] leading-relaxed text-muted">
                            {faq.answer}
                        </DisclosurePanel>
                    </Disclosure>
                ))}
            </div>
        </div>
    </section>
);

export default FAQ;
