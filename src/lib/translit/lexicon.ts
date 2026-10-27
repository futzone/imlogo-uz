import { Lexicon, parseLexicon } from './core';

let request: Promise<Lexicon> | null = null;

/** Istisnolar lug'atini bir marta yuklaydi (~27 KB, gzip). Xatolikda keyingi chaqiruv qayta urinadi. */
export const loadLexicon = (): Promise<Lexicon> => {
    request ??= fetch('/translit/lexicon.txt')
        .then(response => {
            if (!response.ok) throw new Error(`Lug'at yuklanmadi (${response.status})`);
            return response.text();
        })
        .then(parseLexicon)
        .catch(error => {
            request = null;
            throw error;
        });
    return request;
};
