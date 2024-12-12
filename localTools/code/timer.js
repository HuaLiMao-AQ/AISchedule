/**
 * 时间配置函数，此为入口函数，不要改动函数名
 */
async function scheduleTimer({
  providerRes,
  parserRes
} = {}) {
  let res = {
    totalWeek: 0, // 总周数：[1, 30]之间的整数
    startSemester: '', // 开学时间：时间戳，13位长度字符串，推荐用代码生成
    startWithSunday: false, // 是否是周日为起始日，该选项为true时，会开启显示周末选项
    showWeekend: true, // 是否显示周末
    forenoon: 4, // 上午课程节数：[1, 10]之间的整数
    afternoon: 5, // 下午课程节数：[0, 10]之间的整数
    night: 3, // 晚间课程节数：[0, 10]之间的整数
    sections: [], // 课程时间表，注意：总长度要和上边配置的节数加和对齐
  };
  
  /* 获取起始时间 */
  var startDateText = document.getElementById("startDate").innerText
  var startDate = new Date(startDateText);
  res.startSemester = startDate.getTime().toString();

  /* 获取课表ID和总周数 */
  const nowSemesterId = document.getElementById("allSemesters")[0].value;
  const allDataApi = "https://jwxt.aqnu.edu.cn/student/for-std/course-table/get-data?bizTypeId=2&semesterId=" + nowSemesterId;

  const allData = await fetch(allDataApi, {method: "GET"});
  const allDataJson = await allData.json();
  res.totalWeek = allDataJson.weekIndices.length;

  /* 获取详细课表 */
  const timeTableApi = "https://jwxt.aqnu.edu.cn/student/ws/schedule-table/timetable-layout";
  let options = {
    method: "POST",
    body: JSON.stringify({
      timeTableLayoutId: allDataJson.lessons[0].timeTableLayout.id
    }),
    headers: {
      "Content-type": "application/json;charset=UTF-8"
    }
  }
  const timeTable = await fetch(timeTableApi, options);
  const timeTableJson = await timeTable.json();
  timeTableJson.result.courseUnitList.forEach((courseNode) => {
    res.sections.push({
      section: courseNode.indexNo,
      startTime: courseNode.startTimeText,
      endTime: courseNode.endTimeText
    })
  });

  return res.length==0?{}:res;
}