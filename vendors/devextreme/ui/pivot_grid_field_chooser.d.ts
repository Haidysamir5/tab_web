/**
* DevExtreme (ui/pivot_grid_field_chooser.d.ts)
* Version: 19.1.5
* Build date: Tue Jul 30 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxPivotGridFieldChooser(): JQuery;
    dxPivotGridFieldChooser(options: "instance"): DevExpress.ui.dxPivotGridFieldChooser;
    dxPivotGridFieldChooser(options: string): any;
    dxPivotGridFieldChooser(options: string, ...params: any[]): any;
    dxPivotGridFieldChooser(options: DevExpress.ui.dxPivotGridFieldChooserOptions): JQuery;
}
}
export default DevExpress.ui.dxPivotGridFieldChooser;
export type Options = DevExpress.ui.dxPivotGridFieldChooserOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxPivotGridFieldChooserOptions;