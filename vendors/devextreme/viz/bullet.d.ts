/**
* DevExtreme (viz/bullet.d.ts)
* Version: 19.1.5
* Build date: Tue Jul 30 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxBullet(): JQuery;
    dxBullet(options: "instance"): DevExpress.viz.dxBullet;
    dxBullet(options: string): any;
    dxBullet(options: string, ...params: any[]): any;
    dxBullet(options: DevExpress.viz.dxBulletOptions): JQuery;
}
}
export default DevExpress.viz.dxBullet;
export type Options = DevExpress.viz.dxBulletOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.viz.dxBulletOptions;