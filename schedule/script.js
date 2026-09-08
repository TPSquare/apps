const SCHEDULE = await fetch("./configs/schedule.json").then((res) => res.json());

const START_DATE_TEXT = await fetch("./configs/start-date.json").then((res) => res.json());
const START_DATE = new Date(START_DATE_TEXT);

const DUTTimetableAPI = `./data/dut-timetable.json?t=${Date.now()}`;
const DUTTimetable = await fetch(DUTTimetableAPI).then((res) => res.json());
const personalScheduleAPI = `./data/personal-schedule.json?t=${Date.now()}`;
const personallySchedule = await fetch(personalScheduleAPI).then((res) => res.json());

let active = false;
let lockActive = false;

for (const week in DUTTimetable.timetable) {
  for (const day in personallySchedule)
    for (const dayData of personallySchedule[day]) {
      const find = ({ lessons }) => lessons[0] > dayData.lessons[0];
      const insertIndex = DUTTimetable.timetable[week][day].findIndex(find);
      if (insertIndex === -1) DUTTimetable.timetable[week][day].push(dayData);
      else DUTTimetable.timetable[week][day].splice(insertIndex, 0, dayData);
    }

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

  const titleElement = document.createElement("div");
  titleElement.className = "title";
  titleElement.innerHTML = `<span>Thời khóa biểu - Tuần ${week}</span> <i>(${weekRangeText})</i>`;
  wrapperElement.appendChild(titleElement);

  const timetableElement = document.createElement("table");
  const headers = ["Thứ", "Thời gian", "Môn học", "Phòng học", "Giảng viên"];
  const headerClasses = ["day", "time", "subject", "place", "lecturer"];
  const headerCells = headers.map((e, i) => `<th class="${headerClasses[i]}">${e}</th>`).join("");
  timetableElement.innerHTML += `<tr>` + headerCells + `</tr>`;
  wrapperElement.appendChild(timetableElement);

  for (const day in DUTTimetable.timetable[week]) {
    const dayData = DUTTimetable.timetable[week][day];

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

    const dayCellHTML = `<td rowspan="${dayData.length}" class="day">Thứ ${day}<br><i>(${formattedDate})</i></td>`;
    const firstLessonsHTML = getTableLessons(dayData[0]);
    let rows = `<tr class="${getRowTag(dayData[0])}">${dayCellHTML}${firstLessonsHTML}</tr>`;
    for (let i = 1; i < dayData.length; i++) {
      rows += `<tr class="${getRowTag(dayData[i])}">${getTableLessons(dayData[i])}</tr>`;
    }

    let className = "future";
    if (!active) className = "overcome";
    if (active && !lockActive) {
      lockActive = true;
      className = "active";
    }
    timetableElement.innerHTML += `<tbody class="${className}">${rows}</tbody>`;
  }

  if (wrapperElement.querySelector(".active")) document.body.appendChild(wrapperElement);
}
function getTableLessons(data) {
  data = Object.assign(data, DUTTimetable.courseInformation[data.courseOrder] || {});
  const lecturerRegular = data.lecturer ? "" : "regular";
  return (
    `<td class="time">${data.lessons.map((e, i) => SCHEDULE[e - 1][i]).join(" - ")}</td>` +
    `<td>${data.courseName || data.content}</td>` +
    `<td class="place">${data.place || ""}</td>` +
    `<td class="${lecturerRegular}">${data.lecturer || "Tự học"}</td>`
  );
}
function getRowTag(daytData) {
  return daytData.courseOrder ? "dut" : "personally";
}
