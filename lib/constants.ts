const phoneNumbers = process.env.PHONE_NUMBERS?.split(',');

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
});

const dates = [23];

const humanFormattedDates = dates.map(date =>
  dateFormatter.format(new Date(2020, 11, date))
);

const lastDay = new Date(2020, 11, dates[dates.length - 1]);
const firstDay = new Date(2020, 11, dates[0]);

const listFormatter = new Intl.ListFormat('en', {
  style: 'long',
  type: 'disjunction',
});

export {
  dateFormatter,
  dates,
  firstDay,
  humanFormattedDates,
  lastDay,
  listFormatter,
  phoneNumbers,
};
