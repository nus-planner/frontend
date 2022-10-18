import path from "path";
import * as fs from "fs";
import util from "util";
const packageLogFileDir = path.resolve(__dirname, "../", "logs/");
const packageLogFilePath = path.resolve(packageLogFileDir, "log");
export function log(...data: any) {
  console.log(
    util.inspect(data, { showHidden: false, depth: null, colors: false }),
  );
}

export function write(writeData: any, fileType: string = "txt") {
  let data = writeData;
  if (fileType === "txt" || fileType === "json") {
    data = JSON.stringify(writeData) + "\n";
  }
  return fs.appendFileSync(`${packageLogFilePath}.${fileType}`, data);
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: any, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export function writeLog(data: any) {
  write(util.inspect(data, { showHidden: false, depth: null }));
}
