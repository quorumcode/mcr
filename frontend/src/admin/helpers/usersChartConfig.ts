const dataTrialUsers = [
  {
    x: Date.parse("2021-05-20"),
    y: 10,
  },
  {
    x: Date.parse("2021-05-21"),
    y: 11,
  },
  {
    x: Date.parse("2021-05-22"),
    y: 13,
  },
  {
    x: Date.parse("2021-05-23"),
    y: 20,
  },
  {
    x: Date.parse("2021-05-24"),
    y: 28,
  },
];

const dataPaidUsers = [
  {
    x: Date.parse("2021-05-20"),
    y: 1,
  },
  {
    x: Date.parse("2021-05-21"),
    y: 1,
  },
  {
    x: Date.parse("2021-05-22"),
    y: 2,
  },
  {
    x: Date.parse("2021-05-23"),
    y: 2,
  },
  {
    x: Date.parse("2021-05-24"),
    y: 4,
  },
];

export const usersChartConfig = {
  type: "line",
  data: {
    datasets: [
      {
        label: "Trial users",
        data: dataTrialUsers,
        borderColor: "#1E2B99",
        backgroundColor: "#1E2B99",
      },
      {
        label: "Paid users",
        data: dataPaidUsers,
        borderColor: "#FFA800",
        backgroundColor: "#FFA800",
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
