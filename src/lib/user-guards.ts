/**
 * گاردهای ایمنی عملیات روی کاربران پنل — قلم ۵ کتابچه.
 * دو خط قرمز: هیچ‌کس حق ندارد روی «حساب خود» عمل کند، و پنل نباید «بی‌مالک» شود.
 * در قلم ۴ برای حذف دائمی از بایگانی استفاده می‌شود؛ در قلم ۵ برای تنزل نقش،
 * غیرفعال‌سازی، بایگانی و دعوت مجدد.
 */
import { and, eq, isNull, ne } from 'drizzle-orm';
import { adminUsers } from '@/db/schema';
import type { AppDb } from '@/db/client';

export interface UserChangeOpts {
  /** بعد از این عمل، کاربر مالک می‌ماند؟ */
  wouldBeOwner: boolean;
  /** بعد از این عمل، کاربر فعال می‌ماند؟ */
  wouldBeActive: boolean;
  /** فعل فارسی برای پیام خطا، مثل «بایگانی» یا «تنزل نقش» */
  verb: string;
}

/**
 * اگر عملِ درخواستی روی کاربرِ targetId ناامن باشد، خطای فارسیِ روشن می‌اندازد.
 * ناامن یعنی: روی حساب خودِ عامل، یا حذفِ آخرین مالک فعال از پنل.
 */
export async function assertUserChangeAllowed(
  db: AppDb,
  targetId: string,
  actorEmail: string,
  opts: UserChangeOpts,
): Promise<void> {
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, targetId)).limit(1);
  const target = rows[0];
  if (!target) throw new Error('کاربر یافت نشد.');

  if (target.email.toLowerCase() === actorEmail.toLowerCase()) {
    throw new Error(`${opts.verb} حساب خودتان مجاز نیست.`);
  }

  const isActiveOwner = target.role === 'owner' && target.active && !target.deletedAt;
  const remainsActiveOwner = opts.wouldBeOwner && opts.wouldBeActive;
  if (isActiveOwner && !remainsActiveOwner) {
    const others = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(
        and(
          eq(adminUsers.role, 'owner'),
          eq(adminUsers.active, true),
          isNull(adminUsers.deletedAt),
          ne(adminUsers.id, targetId),
        ),
      )
      .limit(1);
    if (others.length === 0) {
      throw new Error(
        `این کاربر آخرین مالک فعال پنل است؛ ${opts.verb} او پنل را قفل می‌کند. اول کاربر دیگری را مالک کنید.`,
      );
    }
  }
}
