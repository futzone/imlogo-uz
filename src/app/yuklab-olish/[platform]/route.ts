import { NextResponse } from 'next/server';

import { BASE_URL } from '@/lib/app/pocketbase';

/**
 * Kompyuter ilovasini yuklab olish: oxirgi reliz havolasi PocketBase'dagi
 * `app_releases` dan olinadi (uni CI yangilaydi), fayl GitHub Releases'da.
 * Server javob bermasa yoki reliz hali bo'lmasa — zaxira havola.
 */
const fallbacks: Record<string, string> = {
    windows: 'https://jvqhqinpulczyhgckgbb.supabase.co/storage/v1/object/public/imlogo-audios/apps/Imlogo.exe',
    macos: 'https://github.com/futzone/imlogo/releases/latest',
};

export const revalidate = 300;

export async function GET(_request: Request, { params }: { params: { platform: string } }) {
    const fallback = fallbacks[params.platform];
    if (!fallback) return new NextResponse('Topilmadi', { status: 404 });

    try {
        const filter = encodeURIComponent(`platform = '${params.platform}'`);
        const response = await fetch(`${BASE_URL}/api/collections/app_releases/records?filter=${filter}&perPage=1&skipTotal=1`, {
            next: { revalidate },
        });
        if (response.ok) {
            const { items } = (await response.json()) as { items: { url?: string }[] };
            const url = items[0]?.url;
            if (url?.startsWith('https://github.com/futzone/imlogo/releases/download/')) return NextResponse.redirect(url, 302);
        }
    } catch {
        // Zaxira havolaga o'tiladi.
    }
    return NextResponse.redirect(fallback, 302);
}
