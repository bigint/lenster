import clsx from 'clsx';
import { For } from 'million/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FC, ReactNode } from 'react';

interface MenuProps {
  children: ReactNode;
  current: boolean;
  url: string;
}

const Menu: FC<MenuProps> = ({ children, current, url }) => (
  <Link
    href={url}
    className={clsx(
      { 'bg-brand-100 dark:bg-brand-300/20 text-brand font-bold': current },
      'hover:bg-brand-100/80 dark:hover:bg-brand-300/30',
      'flex items-center space-x-2 rounded-lg px-3 py-2'
    )}
  >
    {children}
  </Link>
);

interface SidebarProps {
  items: {
    title: ReactNode;
    icon: ReactNode;
    url: string;
    active?: boolean;
    enabled?: boolean;
  }[];
}

const Sidebar: FC<SidebarProps> = ({ items }) => {
  const { pathname } = useRouter();
  const menuItems = items.map((item) => ({
    ...item,
    enabled: item.enabled ?? true
  }));
  const filteredMenuItems = menuItems.filter((i) => i.enabled);

  return (
    <div className="mb-4 px-3 sm:px-0 [&>*]:space-y-1.5">
      {filteredMenuItems ? (
        <For each={filteredMenuItems} as="div">
          {(item: any) => (
            <Menu
              url={item.url}
              key={item.title}
              current={pathname === item.url || item.active}
            >
              {item.icon}
              <div>{item.title}</div>
            </Menu>
          )}
        </For>
      ) : null}
    </div>
  );
};

export default Sidebar;
