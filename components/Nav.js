'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  ['/', 'Real-time Tracking'],
  ['/summary', 'List Unit Parkir'],
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav>
      {items.map(([href, label]) => (
        <Link key={href} href={href} className={'navbtn' + (path === href ? ' on' : '')} aria-current={path === href ? 'page' : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
