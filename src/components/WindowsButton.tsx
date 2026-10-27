import React from 'react'

import StoreButton from './ui/StoreButton'
import { ctaDetails } from '@/data/cta'

const WindowsButton = ({ dark }: { dark?: boolean }) => {
    return (
        <StoreButton
            href={ctaDetails.windowsUrl}
            label="Windows uçun"
            dark={dark}
            icon={
                <svg viewBox="0 0 512 512" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path fill="currentColor" d="M0 0 H 243 V 243 H 0 Z M 269 0 H 512 V 243 H 269 Z M 0 269 H 243 V 512 H 0 Z M 269 269 H 512 V 512 H 269 Z"></path>
                </svg>
            }
        />
    )
}

export default WindowsButton
