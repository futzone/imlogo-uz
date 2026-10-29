import React from 'react'
import { FaApple } from 'react-icons/fa'

import StoreButton from './ui/StoreButton'
import { ctaDetails } from '@/data/cta'

const MacButton = ({ dark }: { dark?: boolean }) => {
    return <StoreButton href={ctaDetails.macUrl} label="macOS uçun" dark={dark} icon={<FaApple size={26} aria-hidden />} />
}

export default MacButton
