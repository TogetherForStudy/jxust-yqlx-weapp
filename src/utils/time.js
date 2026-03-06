export function formatDateTime(date, format = 'yyyy-MM-dd HH:mm') {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return ''
  }

  const o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
    "H+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
    a: date.getHours() < 12 ? "上午" : "下午",
    A: date.getHours() < 12 ? "AM" : "PM",
  };
  if (/(y+)/.test(format)) {
    format = format.replace(
      RegExp.$1,
      (date.getFullYear() + "").substring(4 - RegExp.$1.length)
    );
  }
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substring(("" + o[k]).length)
      );
    }
  }
  return format;
}
