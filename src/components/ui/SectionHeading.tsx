import clsx from 'clsx';
import Badge from './Badge';

interface Props {
    eyebrow?: string;
    title: string;
    /** Sarlavhaning gradient bilan ajratiladigan oxirgi qismi */
    accent?: string;
    description?: string;
    align?: 'left' | 'center';
    as?: 'h2' | 'h3';
    className?: string;
}

const SectionHeading: React.FC<Props> = ({
    eyebrow,
    title,
    accent,
    description,
    align = 'center',
    as: Tag = 'h2',
    className,
}) => {
    return (
        <div
            className={clsx(
                'flex flex-col gap-4',
                align === 'center' ? 'items-center text-center' : 'items-center text-center lg:items-start lg:text-left',
                className
            )}
        >
            {eyebrow && <Badge>{eyebrow}</Badge>}
            <Tag className="text-3xl font-bold text-balance md:text-4xl lg:text-5xl">
                {title}
                {accent && (
                    <>
                        {' '}
                        <span className="text-gradient">{accent}</span>
                    </>
                )}
            </Tag>
            {description && (
                <p className="max-w-2xl text-muted">{description}</p>
            )}
        </div>
    );
};

export default SectionHeading;
