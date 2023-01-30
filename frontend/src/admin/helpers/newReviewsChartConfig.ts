const data = [
  {
    x: Date.parse("2021-05-20"),
    y: 20,
  },
  {
    x: Date.parse("2021-05-21"),
    y: 30,
  },
  {
    x: Date.parse("2021-05-22"),
    y: 15,
  },
  {
    x: Date.parse("2021-05-23"),
    y: 45,
  },
  {
    x: Date.parse("2021-05-24"),
    y: 51,
  },
];

export const newReviewsChartConfig = {
  type: "bar",
  data: {
    datasets: [
      {
        label: "Reviews",
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
