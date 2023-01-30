const data = [
  {
    x: Date.parse("2021-05-20"),
    y: 0,
  },
  {
    x: Date.parse("2021-05-21"),
    y: 0,
  },
  {
    x: Date.parse("2021-05-22"),
    y: 1,
  },
  {
    x: Date.parse("2021-05-23"),
    y: 9,
  },
  {
    x: Date.parse("2021-05-24"),
    y: 1,
  },
];

export const paymentErrorsChartConfig = {
  type: "bar",
  data: {
    datasets: [
      {
        label: "Payment Errors",
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
