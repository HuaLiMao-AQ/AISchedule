/**
 * 时间配置函数，此为入口函数，不要改动函数名
 */
async function scheduleTimer({
  providerRes,
  parserRes
} = {}) {
  /* 安庆师大教务系统网址 */
  const jwxtUrl = "https://jwxt.aqnu.edu.cn";

  /* 需要用到的API */
  const currentWeek = "/student/home/get-current-teach-week";
  const courseTable= "/student/for-std/course-table";
  const allData = "/student/for-std/course-table/get-data?bizTypeId=2&semesterId=";
  const timeTable = "/student/ws/schedule-table/timetable-layout";

  /* 当前学期信息 */
  let currentSemesterInfo = {
    id: '',
    startDate: '',
    totalWeek: 0,
    timeTableLayoutId: 0,
    sections: []
  }

  /* 获取当前学期ID */
  // 获取当前学期
  const getCurrentSemesterFetch = await fetch(jwxtUrl + currentWeek, {
    method: "GET",
    headers: {
      "Content-type": "application/json;charset=UTF-8"
    }
  });
  const currentSemesterJson = await getCurrentSemesterFetch.json();
  let currentSemester = currentSemesterJson.currentSemester;
  // 获取课表id
  const getCourseTableFetch = await fetch(jwxtUrl + courseTable, {
    method: "GET",
    headers: {
      "Content-type": "application/json;charset=UTF-8"
    }
  });
  const courseTableText = await getCourseTableFetch.text();
  const courseTableHtml = Document.parseHTMLUnsafe(courseTableText);
  let allSemestersHtml = courseTableHtml.getElementById("allSemesters");
  let allOptions = allSemestersHtml.getElementsByTagName("option");
  for (let i = 0; i < allOptions.length; i++)
  {
    if (allOptions[i].innerText == currentSemester)
    {
      currentSemesterInfo.id = allOptions[i].attributes.value.value;
      break;
    }
  }

  /* 获取起始时间 */
  const allDataFetch = await fetch(jwxtUrl + allData + currentSemesterInfo.id, {
    method: "GET"
  });
  const allDataJson = await allDataFetch.json();
  let startDateText = allDataJson.lessons[0].semester.startDate;
  let startDateTmp = new Date(startDateText);
  currentSemesterInfo.startDate = startDateTmp.getTime().toString();

  /* 获取课表ID和总周数 */
  currentSemesterInfo.totalWeek = allDataJson.weekIndices.length;

  /* 获取详细课表 */
  currentSemesterInfo.timeTableLayoutId = allDataJson.lessons[0].timeTableLayout.id;
  const timeTableFetch = await fetch(jwxtUrl + timeTable, {
    method: "POST",
    body: JSON.stringify({
      timeTableLayoutId: currentSemesterInfo.timeTableLayoutId
    }),
    headers: {
      "Content-type": "application/json;charset=UTF-8"
    }
  });
  const timeTableJson = await timeTableFetch.json();
  timeTableJson.result.courseUnitList.forEach((courseNode) => {
    currentSemesterInfo.sections.push({
      section: courseNode.indexNo,
      startTime: courseNode.startTimeText,
      endTime: courseNode.endTimeText
    })
  });

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