import RouteView from './RouteView';

export const metadata = {
  title: 'صفحه مورد نظر پیدا نشد | ریوان سفر',
  description:
    'صفحه مورد نظر پیدا نشد. به صفحه اصلی یا فهرست تورها بازگردید.',
  robots: 'noindex,nofollow',
};

/** صفحه 404 واقعی — با استاتوس HTTP 404 از سمت سرور */
export default function NotFound() {
  return <RouteView type="not_found" params={{}} />;
}
