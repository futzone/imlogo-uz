/** Qidiruv tizimlari uchun schema.org tuzilmaviy ma'lumoti. */
const JsonLd: React.FC<{ data: Record<string, unknown> }> = ({ data }) => (
    <script
        type="application/ld+json"
        // "</script>" ketma-ketligi matn ichida sahifani buzmasligi uchun "<" qochiriladi.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
);

export default JsonLd;
