/** تزریق JSON-LD در سمت سرور — خروجی در HTML اولیه برای خزنده‌ها
 *
 * SEC-02: داده از دیتابیس می‌آید (عنوان/توضیح تور، FAQ راهنما)؛ بدون escape
 * کردن `<`، مقدار مخربی مثل `</script><script src=...>` اسکریپت را می‌شکست و
 * XSS ذخیره‌شده می‌ساخت. `\u003c` همان الگوی امن ExhibitionDetailPage است.
 */
export default function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
