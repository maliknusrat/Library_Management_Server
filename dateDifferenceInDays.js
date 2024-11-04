function dateDifferenceInDays(date1, date2) {
    // Parse the dates to ensure they are Date objects
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
  
    // Calculate the difference in time
    const timeDifference = Math.abs(secondDate - firstDate);
  
    // Convert time difference from milliseconds to days
    const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  
    return dayDifference;
  }
  module.exports= dateDifferenceInDays