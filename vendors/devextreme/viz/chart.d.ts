/**
* DevExtreme (viz/chart.d.ts)
* Version: 19.1.5
* Build date: Tue Jul 30 2019
*
* Copyright (c) 2012 - 2019 Developer Express Inc. ALL RIGHTS RESERVED
* Read about DevExtreme licensing here: https://js.devexpress.com/Licensing/
*/
import DevExpress from '../bundles/dx.all';

declare global {
interface JQuery {
    dxChart(): JQuery;
    dxChart(options: "instance"): DevExpress.viz.dxChart;
    dxChart(options: string): any;
    dxChart(options: string, ...params: any[]): any;
    dxChart(options: DevExpress.viz.dxChartOptions): JQuery;
}
}
export default DevExpress.viz.dxChart;
export type Options = DevExpress.viz.dxChartOptions;

/** @deprecated use Options instead */
export type IOptions = DevExpress.viz.dxChartOptions;