export class ClimateData {
    constructor(public datetime: Date, public temperature: number, public humidity: number) { }
}

/**
 * 一日分の気温・湿度データ
 */
export class ClimateLog {
    constructor(public data: ClimateData[]) { }
}