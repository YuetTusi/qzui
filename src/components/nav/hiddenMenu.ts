import { remote, MenuItemConstructorOptions } from 'electron';

const hiddenMenu = (cfg: MenuItemConstructorOptions[]) => {
    const { Menu, MenuItem } = remote;
    const menu = new Menu();

    cfg.forEach(menuItem => {
        menu.append(new MenuItem({ ...menuItem }));
    });

    return menu;
};

export { hiddenMenu };