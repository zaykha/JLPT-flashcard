/**
* Returns today's date in JST as YYYY-MM-DD.
*/
export function jstTodayISO(date = new Date()): string {
// JST = UTC+9; shift to JST by adding 9 hours
const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
return jst.toISOString().slice(0, 10);
}