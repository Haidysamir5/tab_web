/**
* DevExtreme (ui/validator.d.ts)
* Version: 19.1.5
* Build date: Tue Jul 30 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxValidator(): JQuery;
    dxValidator(options: "instance"): DevExpress.ui.dxValidator;
    dxValidator(options: string): any;
    dxValidator(options: string, ...params: any[]): any;
    dxValidator(options: DevExpress.ui.dxValidatorOptions): JQuery;
}
}
export default DevExpress.ui.dxValidator;
export type Options = DevExpress.ui.dxValidatorOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.ui.dxValidatorOptions;