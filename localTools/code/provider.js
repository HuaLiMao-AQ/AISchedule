async function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    await loadTool('AIScheduleTools')

    /* 提示信息 */
    await AIScheduleAlert('请务必在课表界面导入');

    const tablePath = "/student/for-std/course-table";
    let pathname = window.location.pathname;
    if (tablePath!=pathname)
    {
        await AIScheduleAlert('当前不处于课表页面！！');
        await AIScheduleAlert('请重新导入!!!');
    }

    /* 获取详细课表信息 */
    const nowSemesterId = dom.getElementById("allSemesters")[0].value;
    const allDataApi = "https://jwxt.aqnu.edu.cn/student/for-std/course-table/get-data?bizTypeId=2&semesterId=" + nowSemesterId;
    const allData = await fetch(allDataApi, {method: "GET"});
    const allDataJson = await allData.json();

    let allCourse = [];
    allDataJson.lessons.forEach((lesson) => {
        if (lesson.scheduleText.dateTimePlaceText.text != null) {
            let courseInfo = {
                name: '',
                info: ''
            }
            courseInfo.name = lesson.course.nameZh;
            //courseInfo.teacher = lesson.teacherAssignmentList[0].person.nameZh;
            courseInfo.info = lesson.scheduleText.dateTimePlacePersonText.textZh;
            allCourse.push(courseInfo);
        }
    });

    return JSON.stringify(allCourse);
}