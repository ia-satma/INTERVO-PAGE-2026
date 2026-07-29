type StructuredDataProps = {
  id: string;
  data: Record<string, unknown>;
};

/** JSON-LD with `<` escaped so editable CMS text cannot terminate the script. */
export default function StructuredData({ id, data }: StructuredDataProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script id={id} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
