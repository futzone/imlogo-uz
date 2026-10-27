import { redirect } from 'next/navigation';

import { defaultDirection } from '@/lib/translit/directions';

export default function TranslatorIndexPage() {
    redirect(`/app/translator/${defaultDirection.slug}`);
}
