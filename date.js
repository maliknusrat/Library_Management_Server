// function dateDifferenceInDays(date1, date2) {
//     // Parse the dates to ensure they are Date objects
//     const firstDate = new Date(date1);
//     const secondDate = new Date(date2);

//     // Calculate the difference in time
//     const timeDifference = Math.abs(secondDate - firstDate);

//     // Convert time difference from milliseconds to days
//     const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

//     return dayDifference;
// }

// // Example usage:
// const date1 = '2024-06-01';
// const date2 = '2024-05-09';

// console.log(`The difference between ${date1} and ${date2} is ${dateDifferenceInDays(date2, date1)} days.`);
// const bangladeshTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
// const formattedDate = new Date(bangladeshTime).toISOString().slice(0, 10); // Format to YYYY-MM-DD

// console.log(formattedDate);
const getCurrentBangladeshDateTime = () => {
    const utcDate = new Date();
    const bangladeshOffset = 6 * 60;
    const bangladeshDate = new Date(
      utcDate.getTime() + bangladeshOffset * 60000
    );
    return bangladeshDate;
  };

  const currentDate = getCurrentBangladeshDateTime();
  console.log(currentDate);
