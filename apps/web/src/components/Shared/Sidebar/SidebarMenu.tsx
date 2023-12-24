import { Menu } from '@headlessui/react';
import { Card } from '@hey/ui';
import cn from '@hey/ui/cn';
import { useRouter } from 'next/router';
import { type FC, type ReactNode, useState } from 'react';

import MenuTransition from '../MenuTransition';
import { NextLink } from '../Navbar/MenuItems';

interface SidebarProps {
  items: {
    active?: boolean;
    enabled?: boolean;
    icon: ReactNode;
    title: ReactNode;
    url: string;
  }[];
}

const SidebarMenu: FC<SidebarProps> = ({ items }) => {
  const { pathname } = useRouter();
  const menuItems = items.map((item) => ({
    ...item,
    enabled: item.enabled || true
  }));
  const [selectedItem, setSelectedItem] = useState(
    menuItems.find((item) => item.url === pathname) || menuItems[0]
  );

  return (
    <div className="mb-4 space-y-2">
      <Menu as="div" className="relative">
        {({ open }) => (
          <>
            <Menu.Button
              className={cn(
                'focus:border-brand-500 focus:ring-brand-400 w-full rounded-xl border border-gray-300 bg-white outline-none dark:border-gray-700 dark:bg-gray-800 text-left px-3 py-2 flex items-center space-x-2',
                {
                  'bg-gray-200 text-black dark:bg-gray-800 dark:text-white':
                    open,
                  'text-gray-700 hover:bg-gray-200 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white':
                    !open
                }
              )}
            >
              {selectedItem.icon}
              <div>{selectedItem.title}</div>
            </Menu.Button>
            <MenuTransition>
              <Menu.Items className="mt-2 absolute w-full z-10" static>
                <Card>
                  {menuItems.map((item) => (
                    <Menu.Item
                      as={NextLink}
                      className={({ active }: { active: boolean }) =>
                        cn(
                          {
                            'dropdown-active': active || selectedItem === item
                          },
                          'm-2 p-2 rounded-lg flex items-center space-x-2'
                        )
                      }
                      href={item.url}
                      key={item.url}
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.icon}
                      <div>{item.title}</div>
                    </Menu.Item>
                  ))}
                </Card>
              </Menu.Items>
            </MenuTransition>
          </>
        )}
      </Menu>
    </div>
  );
};

export default SidebarMenu;
