/**
 * 时间配置函数，此为入口函数，不要改动函数名
 */
async function scheduleTimer({
  providerRes,
  parserRes
} = {}) {
  /* 获取provider的解析结果 */
  let currentSemesterInfo = JSON.parse(providerRes).currentSemesterInfo;

  return {
    totalWeek: currentSemesterInfo.totalWeek, // 总周数：[1, 30]之间的整数
    startSemester: currentSemesterInfo.startDate, // 开学时间：时间戳，13位长度字符串，推荐用代码生成
    startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
    showWeekend: true, // 是否显示周末
    forenoon: 4, // 上午课程节数：[1, 10]之间的整数
    afternoon: 5, // 下午课程节数：[0, 10]之间的整数
    night: 3, // 晚间课程节数：[0, 10]之间的整数
    sections: currentSemesterInfo.sections, // 课程时间表，注意：总长度要和上边配置的节数加和对齐
  };
}