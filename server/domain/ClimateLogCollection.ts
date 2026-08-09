import { format, startOfHour } from "date-fns";
import { ClimateLog } from "./dto/ClimateLog.ts";

/**
 * CSVデータをパースしてClimateLogを作成する
 * データ例：
 * Date,Temperature_Celsius(℃),Relative_Humidity(%),DPT(℃),VPD(kPa),Abs Humidity(g/m³)
 * 2026-07-21 17:02,29.2,52,18.3,1.94,15.10
 * 2026-07-21 17:03,29.4,49,17.5,2.08,14.34
 */
export class ClimateLogCollection {
    constructor(logs: ClimateLog[]) {}

public create(csvText: string): ClimateLog[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  // ヘッダー行を除外
  const dataLines = lines.slice(1);

  const logs: ClimateLog[] = [];
  const seenHours = new Set<string>();

  for (const line of dataLines) {
    if (!line.trim()) continue;

    const columns = line.split(',');
    
    // カラムの抽出
    const dateStr = columns[0].trim();
    const temperature = parseFloat(columns[1]);
    const humidity = parseFloat(columns[2]);

    // 日時オブジェクトの生成 ("YYYY-MM-DD HH:mm" -> ISO形式に変換してパース)
    const date = new Date(dateStr.replace(' ', 'T'));

    // date-fns の format 関数で 1時間単位の識別キーを作成 (例: "2026-07-21-17")
    const hourKey = format(date, 'yyyy-MM-dd-HH');

    // その時間帯（1h）でまだ登録されていない場合のみ配列に追加
    if (!seenHours.has(hourKey)) {
      seenHours.add(hourKey);
      logs.push(new ClimateLog(startOfHour(date), temperature, humidity));
    }
  }

  return logs;
}

}