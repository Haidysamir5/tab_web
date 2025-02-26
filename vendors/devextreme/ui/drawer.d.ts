/**
* DevExtreme (ui/drawer.d.ts)
* Version: 19.1.5
* Build date: Tue Jul 30 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxDrawer(): JQuery;
    dxDrawer(options: "instance"): DevExpress.ui.dxDrawer;
    dxDrawer(options: string): any;
    dxDrawer(options: string, ...params: any[]): any;
    dxDrawer(options: DevExpress.ui.dxDrawerOptions): JQuery;
}
}
export default DevExpress.ui.dxDrawer;
export type Options = DevExpress.ui.dxDrawerOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxDrawerOptions;