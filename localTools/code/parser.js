function parseDetaildInfo(courseInfo) {
  const weekMap = {
    "周一": 1,
    "周二": 2,
    "周三": 3,
    "周四": 4,
    "周五": 5,
    "周六": 6,
    "周日": 7
  };
  const sectionMap = {
    "一": 1, "二": 2, "三": 3, "四": 4,
    "五": 5, "六": 6, "七": 7, "八": 8, "九": 9,
    "十": 10, "十一": 11, "十二": 12
  };
  let courseInfoMap = [];
  console.log(courseInfo);
  courseInfo.split('; \n').forEach((course) => {
    course = course.replace('\n','');
    course = course.replace(';', '');
    courseInfoMap.push(course);
  })

  let schedule = [];

  let len = courseInfoMap.length;
  console.log(courseInfoMap);
  courseInfoMap.forEach((course) => {
    /* 去除特殊字符 */
    course = course.replace(/#(\d+) |#(\d+)/g, "");
    let nowCourse = course.split(' ');
    //while (nowCourse.length != 6) nowCourse.push('');
    console.log("课程信息" + course);

    /* 周数 */
    let weeks = [];
    let weeksRange = nowCourse[0].split(',');
    console.log(weeksRange);
    weeksRange.forEach((week) => {
      if (week.includes("(双)"))
      {
        let rangeTmp = week.split("~");
        let range = [];
        rangeTmp.forEach((tmp) => {
          range.push(Number(tmp.replace("(双)周","")));
        })
        if (range[0]%2==1) range[0]+=1;
        for (let i = range[0]; i <= range[1];i+=2) weeks.push(i);
      } else if (week.includes("(单)"))
      {
        let rangeTmp = week.split("~");
        let range = [];
        rangeTmp.forEach((tmp) => {
          range.push(Number(tmp.replace("(单)周","")));
        })
        if (range[0]%2==0) range[0]+=1;
        for (let i = range[0]; i <= range[1];i+=2) weeks.push(i);
      } else {
        let rangeTmp = week.split("~");
        let range = [];
        rangeTmp.forEach((tmp) => {
          range.push(Number(tmp.replace("周","")));
        })
        if (range.length > 1) 
        {
          for (let i = range[0]; i <= range[1]; i++) weeks.push(i);
        } else {
          weeks.push(range[0]);
        }
      }
    })
    console.log("周数信息" + weeks);

    /* 周几 */
    const weekMap = {
      "周一": 1,
      "周二": 2,
      "周三": 3,
      "周四": 4,
      "周五": 5,
      "周六": 6,
      "周日": 7
    }
    let day = weekMap[nowCourse[1]];

    console.log("周几" + day);

    /* 节数 */
    const sectionMap = {
      "一": 1,
      "二": 2,
      "三": 3,
      "四": 4,
      "五": 5,
      "六": 6,
      "七": 7,
      "八": 8,
      "九": 9,
      "十": 10,
      "十一": 11,
      "十二": 12,
    }
    let rangeSection = nowCourse[2].match(/(十一|十二)|[一二三四五六七八九十]/g);
    let sections = [];
    if (rangeSection.length == 1)
    {
      sections.push(sectionMap[rangeSection[0]]);
    } else {
      for (let i = sectionMap[rangeSection[0]]; i <= sectionMap[rangeSection[1]];i++)
      {
        sections.push(i);
      }
    }

    /* 教室及老师信息 */
    let positionAndTeacher = {
      position: "",
      teacher: ""
    }
    if (nowCourse.length == 6)
    {
      console.log("有上课地点");
      positionAndTeacher.position = nowCourse[4];
      console.log("教室" + positionAndTeacher.position);

      positionAndTeacher.teacher = nowCourse[5];
      console.log("老师"+positionAndTeacher.teacher);
    } else {
      console.log("无上课地点");

      positionAndTeacher.teacher = nowCourse[nowCourse.length-1];
      console.log(positionAndTeacher.teacher);
    }
    schedule.push({
      weeks: weeks,
      day: day,
      sections: sections,
      position: positionAndTeacher.position,
      teacher: positionAndTeacher.teacher
    })
  })
  return schedule;
}

function scheduleHtmlParser(html) {
  //除函数名外都可编辑
  //传入的参数为上一步函数获取到的html
  //可使用正则匹配
  //可使用解析dom匹配，工具内置了$，跟jquery使用方法一样，直接用就可以了，参考：https://cnodejs.org/topic/5203a71844e76d216a727d2e
  let allCourseJson = JSON.parse(html);
  let timeTable = allCourseJson.courseUnitList;
  let scheduleTableDatumResult = allCourseJson.scheduleTableDatumResult;
  
  /* 匹配课程名称 */
  let courseName = {};
  scheduleTableDatumResult.lessonList.forEach((courseInfo) => {
    courseName[courseInfo.id] = courseInfo.courseName;
  })

  /* 匹配课程信息 */
  let totalCourseInfo = [];
  scheduleTableDatumResult.scheduleList.forEach((courseInfo) => {
    let course = {};
    course["name"] = courseName[courseInfo.lessonId];
    course["position"] = courseInfo.room == null ? "" : courseInfo.room.nameZh;
    course["teacher"] = courseInfo.personName;
    course["day"] = courseInfo.weekday;
    course["weeks"] = [courseInfo.weekIndex];
    timeTable.forEach((section) => {
      if (courseInfo.startTime == section.startTime)
      {
        course["start"] = section.indexNo;
        return;
      }
    })
    timeTable.forEach((section) => {
      if (courseInfo.endTime == section.endTime)
      {
        course["end"] = section.indexNo;
        return;
      }
    })
    console.log(course["start"] + " " + course["end"])
    course["sections"] = [];
    for (let i = course["start"]; i <= course["end"]; i++) course["sections"].push(i);

    totalCourseInfo.push({
      name: course.name,
      position: course.position,
      teacher: course.teacher,
      weeks: course.weeks,
      day: course.day,
      sections: course.sections
    });
  })

  return totalCourseInfo;
}