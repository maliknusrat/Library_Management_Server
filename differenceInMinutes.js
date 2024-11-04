 function differenceInMinutes(requestTime, cancelTime) {
    // Function to convert time from 12-hour format to 24-hour format
    function convertTo24HourFormat(time12h) {
      const [time, modifier] = time12h.split(" ");
      let [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
  
      if (hours === 12) {
        hours = modifier === "AM" ? 0 : 12;
      } else if (modifier === "PM") {
        hours += 12;
      }
  
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    }
  
    // Function to parse time strings and return total minutes
    function getTimeInMinutes(timeString) {
      const [hours, minutes] = timeString
        .split(":")
        .map((str) => parseInt(str, 10));
      return hours * 60 + minutes;
    }
  
    // Convert times to 24-hour format
    const currentRequestTime24h = convertTo24HourFormat(requestTime);
    const expireIssueTime24h = convertTo24HourFormat(cancelTime);
  
    // Parse times to minutes
    const currentMinutes = getTimeInMinutes(currentRequestTime24h);
    const expireMinutes = getTimeInMinutes(expireIssueTime24h);
  
    // Calculate the difference in minutes
    let timeDifference = expireMinutes - currentMinutes;
    if (timeDifference < 0) {
      timeDifference += 24 * 60;
    }
  
    return timeDifference;
  }
  module.exports= differenceInMinutes