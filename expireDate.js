 function expireDate() {
    // Get the current date
    let currentDate = new Date();
  
    // Calculate the date 7 days from the current date
    let futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 7);
  
    // Format the date as needed, for example: YYYY-MM-DD
    let year = futureDate.getFullYear();
    let month = ("0" + (futureDate.getMonth() + 1)).slice(-2); // Months are zero-based
    let day = ("0" + futureDate.getDate()).slice(-2);
  
    let formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  }

  module.exports= expireDate