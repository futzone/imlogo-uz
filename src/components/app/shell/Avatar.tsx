import clsx from 'clsx';

/** Foydalanuvchi rasmi yoki ismining bosh harfi. */
const Avatar: React.FC<{ account: { name: string; avatarUrl?: string | null }; className?: string }> = ({
    account,
    className,
}) =>
    account.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- rasm PocketBase serveridan, o'lchami kichik
        <img
            src={account.avatarUrl}
            alt=""
            className={clsx('h-10 w-10 shrink-0 rounded-full border border-line object-cover', className)}
        />
    ) : (
        <span
            aria-hidden
            className={clsx(
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-heading text-base font-bold uppercase text-white',
                className
            )}
        >
            {account.name.trim().charAt(0) || '?'}
        </span>
    );

export default Avatar;
