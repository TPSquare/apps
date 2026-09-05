const SCHEDULE = await fetch("./configs/schedule.json").then((res) => res.json());
const DATA = await fetch(`./data.json?t=${Date.now()}`).then((res) => res.json());

const START_DATE_TEXT = await fetch("./configs/start-date.json").then((res) => res.json());
const START_DATE = new Date(START_DATE_TEXT);

let active = false;
let lockActive = false;

for (const week in DATA.timetable) {
  const weekRange = (() => {
    const startDate = new Date(START_DATE);
    startDate.setDate(startDate.getDate() + (week - 1) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    return [startDate, endDate];
  })();
  const format = { day: "2-digit", month: "2-digit", year: "numeric" };
  const weekRangeText = weekRange.map((e) => e.toLocaleDateString("vi-VN", format)).join(" - ");

  const wrapperElement = document.createElement("div");
  wrapperElement.id = `week_${week}`;
  wrapperElement.className = "week";
  document.body.appendChild(wrapperElement);

  const titleElement = document.createElement("div");
  titleElement.className = "title";
  titleElement.innerHTML = `<span>Thời khóa biểu - Tuần ${week}</span> <i>(${weekRangeText})</i>`;
  wrapperElement.appendChild(titleElement);

  const timetableElement = document.createElement("table");
  const headers = ["Thứ", "Tiết học", "Thời gian", "Phòng học", "Môn học", "Giảng viên"];
  const headerCells = headers.map((e) => `<th>${e}</th>`).join("");
  timetableElement.innerHTML += `<tr>` + headerCells + `</tr>`;
  wrapperElement.appendChild(timetableElement);

  for (const day in DATA.timetable[week]) {
    const dayData = DATA.timetable[week][day];

    const date = new Date(weekRange[0]);
    date.setDate(date.getDate() + (day - 2));
    const formattedDate = date
      .toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      .replaceAll("-", "/");

    if (!active) {
      const lastLessonTime = SCHEDULE[dayData[dayData.length - 1].lessons[1] - 1][1];
      const [hour, minute] = lastLessonTime.split("h").map((e) => (e ? Number(e) : 0));
      date.setHours(hour);
      date.setMinutes(minute);
      if (Date.now() < date.getTime()) active = true;
    }

    const dayCellHTML = `<td rowspan="${dayData.length}">Thứ ${day}<br><i>(${formattedDate})</i></td>`;
    const firstLessonsHTML = getTableLessons(dayData[0]);
    let rows = `<tr>${dayCellHTML}${firstLessonsHTML}</tr>`;
    for (let i = 1; i < dayData.length; i++) rows += `<tr>${getTableLessons(dayData[i])}</tr>`;
    timetableElement.innerHTML += rows;

    if (!active) document.body.querySelector("tbody:last-child").className = "overcome";
    if (active && !lockActive) {
      lockActive = true;
      document.body.querySelector("tbody:last-child").className = "active";
    }
  }
}
function getTableLessons(data) {
  const information = DATA.courseInformation[data.courseOrder];
  return (
    `<td>${data.lessons.join(" - ")}</td>` +
    `<td>${data.lessons.map((e, i) => SCHEDULE[e - 1][i]).join(" - ")}</td>` +
    `<td>${data.place}</td>` +
    `<td>${information.courseName}</td>` +
    `<td>${information.lecturer}</td>`
  );
}

document.body.querySelector(".active").scrollIntoView({ block: "center" });
