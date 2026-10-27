import { ImageResponse } from 'next/og';

export const alt = 'Imlo Go — özbek tili imlosi uçun bepul platforma';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Ijtimoiy tarmoqlarda havola ulashilganda chiqadigan rasm (1200×630).
 * Standart shriftda ʻ belgisi yo'q, shuning uchun oddiy apostrof ishlatiladi.
 */
export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 72,
                    background: 'linear-gradient(135deg, #14101f 0%, #2a1d57 55%, #304fff 130%)',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>
                    <span style={{ color: '#AF6EFF' }}>IMLO</span>
                    <span>GO</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.1, maxWidth: 980 }}>
                        {"Özbek tili imlosi uçun bepul platforma"}
                    </div>
                    <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.75)' }}>
                        Audio diktant · Tez yoziş · Kirill, lotin va yangi alifbo translatori
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 30 }}>
                    {['O\' → Ö', 'G\' → Ğ', 'Sh → Ş', 'Ch → Ç'].map(change => (
                        <div
                            key={change}
                            style={{
                                display: 'flex',
                                padding: '10px 22px',
                                borderRadius: 16,
                                border: '2px solid rgba(255,255,255,0.25)',
                                background: 'rgba(255,255,255,0.08)',
                            }}
                        >
                            {change}
                        </div>
                    ))}
                    <div style={{ display: 'flex', marginLeft: 'auto', alignItems: 'center', color: 'rgba(255,255,255,0.7)' }}>
                        imlogo.uz
                    </div>
                </div>
            </div>
        ),
        size
    );
}
