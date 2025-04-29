import React from 'react'
import clsx from 'clsx'

import { ctaDetails } from '@/data/cta'

const WindowsButton = ({ dark }: { dark?: boolean }) => {
    return (
        <a href={ctaDetails.appStoreUrl}>
            <button
                type="button"
                className={clsx("flex items-center justify-center min-w-[205px] mt-3 px-6 h-14 rounded-full w-full sm:w-fit", { "text-white bg-foreground": dark, "text-foreground bg-white": !dark })}
            >
                <div className="mr-3">
                    <svg viewBox="0 0 512 512" width="30" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M0 0 H 243 V 243 H 0 Z M 269 0 H 512 V 243 H 269 Z M 0 269 H 243 V 512 H 0 Z M 269 269 H 512 V 512 H 269 Z"></path>
                    </svg>
                </div>
                <div>
                    <div className="text-xs">
                        Yuklab oling
                    </div>
                    <div className="-mt-1 font-sans text-xl font-semibold">
                        Windows uchun
                    </div>
                </div>
            </button>
        </a>
    )
}

export default WindowsButton