/**
* DevExtreme (ui/button_group.d.ts)
* Version: 19.1.5
* Build date: Tue Jul 30 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxButtonGroup(): JQuery;
    dxButtonGroup(options: "instance"): DevExpress.ui.dxButtonGroup;
    dxButtonGroup(options: string): any;
    dxButtonGroup(options: string, ...params: any[]): any;
    dxButtonGroup(options: DevExpress.ui.dxButtonGroupOptions): JQuery;
}
}
export default DevExpress.ui.dxButtonGroup;
export type Options = DevExpress.ui.dxButtonGroupOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxButtonGroupOptions;