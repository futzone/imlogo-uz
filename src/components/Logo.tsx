import clsx from 'clsx';

interface Props {
    className?: string;
    /** To'q fon ustida "GO" qismi oq rangda chiziladi */
    onDark?: boolean;
}

/**
 * Imlo Go logotipi (public/images/logo.svg bilan bir xil). Fredoka shrifti
 * `layout.tsx` da `--font-logo` o'zgaruvchisi orqali ulanadi, shuning uchun
 * SVG sahifa ichiga joylanadi — <img> orqali ochilganda tashqi shrift yuklanmaydi.
 */
const Logo: React.FC<Props> = ({ className, onDark }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 415 78"
            role="img"
            aria-label="Imlo Go"
            className={clsx('h-7 w-auto', className)}
        >
            <text
                x="0"
                y="74"
                fontSize="100"
                fontWeight="700"
                style={{ fontFamily: "var(--font-logo), 'Fredoka', 'Nunito', 'Arial Rounded MT Bold', sans-serif" }}
            >
                <tspan fill="#AF6EFF">IMLO</tspan>
                <tspan fill={onDark ? '#FFFFFF' : '#000000'}>GO</tspan>
            </text>
        </svg>
    );
};

export default Logo;
