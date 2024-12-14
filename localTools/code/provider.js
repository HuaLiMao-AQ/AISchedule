async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    /* 安庆师大教务系统网址 */
    const jwxtUrl = "https://jwxt.aqnu.edu.cn";

    /* 需要用到的API */
    const currentWeek = "/student/home/get-current-teach-week";
    const courseTable= "/student/for-std/course-table";
    const allData = "/student/for-std/course-table/get-data?bizTypeId=2&semesterId=";
    const scheduleTableDatum = "/student/ws/schedule-table/datum";
    const timeTable = "/student/ws/schedule-table/timetable-layout";

    /* 获取当前学期ID */
    // 获取当前学期
    let studentInfo = {
        currentSemesterId: 0,
        lessonIds: []
    };
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
        studentInfo["currentSemesterId"] = allOptions[i].attributes.value.value;
        break;
        }
    }

    /* 获取学生ID */
    let stdPerson = courseTableText.match(/data\['stdPersonId'\]\s*=\s*(\d+);/);
    if (stdPerson.length != 0)
    {
        studentInfo["stdPersonId"] = stdPerson[1];
    }

    /* 获取详细课表信息 */
    const allDataFetch = await fetch(jwxtUrl + allData + studentInfo.currentSemesterId, {method: "GET"});
    const allDataJson = await allDataFetch.json();

    /* 获取学生课程ID */
    studentInfo["lessonIds"] = allDataJson.lessonIds;

    /* 获取所有课程上课信息 */
    const scheduleTableDatumFetch = await fetch(jwxtUrl + scheduleTableDatum, {
        method: "POST",
        body: JSON.stringify({
            lessonIds: studentInfo.lessonIds,
            stdPersonId: studentInfo.stdPersonId,
            studentId: null,
            weekIndex: null
        }),
        headers: {
            "Content-type": "application/json;charset=UTF-8"
        }
    })
    const scheduleTableDatumJson = await scheduleTableDatumFetch.json();

    /* 获取时间表 */
    let currentSemesterInfo = {
        startDate: '',
        totalWeek: 0,
        timeTableLayoutId: 0,
        sections: []
    }

    /* 获取起始时间 */
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

    return JSON.stringify({
        scheduleTableDatumResult: scheduleTableDatumJson.result,
        currentSemesterInfo: currentSemesterInfo,
        courseUnitList: timeTableJson.result.courseUnitList
    });
}