const a = `${new Date().getFullYear()}-${
  new Date().getMonth() < 10 ? ('0' + new Date().getMonth()).slice(-2) : new Date().getMonth()
}-${new Date().getDate() < 10 ? ('0' + new Date().getDate()).slice(-2) : new Date().getDate()}`

console.log(a)
const b = new Date().getm
const today = new Date()
const todayForComparison = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
  0,
  -today.getTimezoneOffset(),
)
console.log(todayForComparison)
console.log(new Date('2019-10-06') >= todayForComparison)
// kendala
// github sign in
// error handler custom
// cant akses req.params di middleware
// onchange update status todo
