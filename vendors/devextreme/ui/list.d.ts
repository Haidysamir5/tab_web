/**
* DevExtreme (ui/list.d.ts)
* Version: 19.1.5
* Build date: Tue Jul 30 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxList(): JQuery;
    dxList(options: "instance"): DevExpress.ui.dxList;
    dxList(options: string): any;
    dxList(options: string, ...params: any[]): any;
    dxList(options: DevExpress.ui.dxListOptions): JQuery;
}
}
export default DevExpress.ui.dxList;
export type Options = DevExpress.ui.dxListOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxListOptions;