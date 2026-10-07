import Image from 'next/image';
import clsx from 'clsx';

/** Telefon skrinshoti: orqasida yumshoq binafsha yorug'lik bilan */
const PhoneShot: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    return (
        <div className={clsx('relative mx-auto w-fit', className)}>
            <div aria-hidden className="absolute inset-[12%] -z-10 rounded-full bg-primary opacity-25 blur-[90px]" />
            <div aria-hidden className="absolute -right-6 top-10 -z-10 h-40 w-40 rounded-full bg-tertiary opacity-60 blur-[70px]" />
            <Image
                src={src}
                alt={alt}
                width={384}
                height={762}
                quality={100}
                className="h-auto w-[280px] animate-float-slow sm:w-[340px] lg:w-[384px]"
            />
        </div>
    );
};

export default PhoneShot;
