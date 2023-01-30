const data = [
  {
    x: Date.parse("2021-05-20"),
    y: 1,
  },
  {
    x: Date.parse("2021-05-21"),
    y: 2,
  },
  {
    x: Date.parse("2021-05-22"),
    y: 3,
  },
  {
    x: Date.parse("2021-05-23"),
    y: 2,
  },
  {
    x: Date.parse("2021-05-24"),
    y: 3,
  },
];

export const sentMailsChartConfig = {
  type: "bar",
  data: {
    datasets: [
      {
        label: "Sent mails",
        data: data,
        backgroundColor: "#1E2B99",
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "time",
        time: {
          parser: "chartjs-adapter-date-fns",
          unit: "day",
        },
      },
      y: {
        title: {
          display: true,
          text: "value",
        },
      },
    },
  },
};
