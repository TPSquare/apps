window.GET_TIMETABLE_DATA = (input) => {
  const htmlWrapper = document.createElement("div");
  htmlWrapper.innerHTML = input;
  const courseInformation = {};
  const timetable = {};

  const rows = htmlWrapper.querySelectorAll(".GridRow:not(.kctHeader)");
  for (const row of rows) {
    const cells = row.querySelectorAll(".GridCell");
    const courseOrder = cells[0].textContent;
    const courseCode = cells[1].textContent;
    const courseName = cells[2].textContent;
    const lecturer = cells[6].textContent;
    const rawTimetable = cells[7].textContent;
    const rawWeeks = cells[8].textContent;

    courseInformation[courseOrder] = { courseCode, courseName, lecturer };

    const days = {};
    const rawDaysTimetable = rawTimetable.split("; ");
    for (const rawDayTimetable of rawDaysTimetable) {
      const [rawDay, lessons, place] = rawDayTimetable.split(",");
      const day = Number(rawDay.replace("Thứ ", ""));
      const [start, end] = lessons.split("-").map((e) => Number(e));
      days[day] = { courseOrder, lessons: [start, end], place };
    }

    const weeksGroups = rawWeeks.split(";");
    for (const weeksGroup of weeksGroups) {
      const [start, end] = weeksGroup.split("-").map((e) => Number(e));
      for (let week = start; week <= end; week++) {
        if (!timetable[week]) timetable[week] = {};
        for (const day in days) {
          if (!timetable[week][day]) timetable[week][day] = [];
          timetable[week][day].push(days[day]);
        }
      }
    }
  }

  for (const week in timetable) {
    const daysEntries = Object.entries(timetable[week]).sort((a, b) => a[0] - b[0]);
    timetable[week] = Object.fromEntries(daysEntries);
    for (const day in timetable[week]) {
      timetable[week][day] = timetable[week][day].sort((a, b) => a.lessons[0] - b.lessons[0]);
    }
  }
  const timetableEntries = Object.entries(timetable).sort((a, b) => a[0] - b[0]);
  const sortedTimetable = Object.fromEntries(timetableEntries);
  return JSON.stringify({ courseInformation, timetable: sortedTimetable });
};
