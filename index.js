const express = require('express');
const cors = require('cors');
var mysql = require('mysql');
var cron = require('node-cron');


const app = express();

app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'] // Add Content-Type to allowed headers
};

app.use(cors(corsOptions));


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '190144Mnn#',
  database: 'libary_database'
});

module.exports = db;

//7 days calculating
function expireDate(){
  // Get the current date
let currentDate = new Date();

// Calculate the date 7 days from the current date
let futureDate = new Date();
futureDate.setDate(currentDate.getDate() + 7);

// Format the date as needed, for example: YYYY-MM-DD
let year = futureDate.getFullYear();
let month = ('0' + (futureDate.getMonth() + 1)).slice(-2); // Months are zero-based
let day = ('0' + futureDate.getDate()).slice(-2);

let formattedDate = `${year}-${month}-${day}`;
return formattedDate;
}

//Get Current Time in 12 Hour Format
let currentTime = new Date();

let requestTime = formatTime(currentTime);
let oneHourLater = new Date(currentTime.getTime() + (60 * 60 * 1000));

let expireTime = formatTime(oneHourLater);

function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight (0 hours)
  return hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + ampm;
}

function defferenceInMinutes(requestTime, cancelTime) {
  // Function to convert time from 12-hour format to 24-hour format
  function convertTo24HourFormat(time12h) {
    // Extract hours, minutes, and AM/PM from the time string
    const [time, modifier] = time12h.split(' ');
    const [hours, minutes] = time.split(':').map(str => parseInt(str));

    // Convert hours to 24-hour format
    let hours24;
    if (hours === 12) {
      hours24 = modifier === 'AM' ? 0 : 12;
    } else {
      hours24 = modifier === 'AM' ? hours : hours + 12;
    }

    // Format hours and minutes to have leading zeros if needed
    const formattedHours = String(hours24).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    // Return time in 24-hour format
    return `${formattedHours}:${formattedMinutes}`;
  }

  // Function to parse time strings and return total minutes
  function getTimeInMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(str => parseInt(str));
    return hours * 60 + minutes;
  }

  // Given times in 12-hour format
  const currentRequestTime = requestTime;
  const expireIssueTime = cancelTime;

  // Convert times to 24-hour format
  const currentRequestTime24h = convertTo24HourFormat(currentRequestTime);
  const expireIssueTime24h = convertTo24HourFormat(expireIssueTime);

  // Parse times to minutes
  const currentMinutes = getTimeInMinutes(currentRequestTime24h);
  const expireMinutes = getTimeInMinutes(expireIssueTime24h);

  // Calculate the difference in minutes
  let timeDifference = expireMinutes - currentMinutes;

  // If the difference is negative, it means the expire time is on the next day
  if (timeDifference < 0) {
    timeDifference += 24 * 60; // Add 24 hours in minutes
  }

  // Convert difference to hours and minutes
  const hoursDifference = Math.floor(timeDifference / 60);
  const minutesDifference = timeDifference % 60;

  return minutesDifference

}

// Get current date
const currentDate = new Date();

// Get date 7 days from now
const sevenDaysLater = new Date();
sevenDaysLater.setDate(currentDate.getDate() + 7);

// Format dates as strings (optional)
const formattedCurrentDate = currentDate.toISOString().split('T')[0]; // yyyy-mm-dd
const formattedSevenDaysLater = sevenDaysLater.toISOString().split('T')[0]; // yyyy-mm-dd


//get all books 
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM books';
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  })
});


// POST

app.post('/books', (req, res) => {
  const sql = "INSERT INTO books (`ID`, `BookName`, `BookCopies`, `AuthorName`,`Date`,`CallNumber`,`AccessionNumber`,`Barcode`,`Image`) VALUES(?)";
  const values = [
    req.body.bookId,
    req.body.bookName,
    req.body.price,
    req.body.Author,
    req.body.date,
    req.body.callNumber,
    req.body.accessionNumber,
    req.body.barcode,
    req.body.image,
    
  ]
  db.query(sql, [values], (err, data) => {
    if (err) return res.json('Error');
    return res.json(data);
  })
})

//Users info POST
app.post('/students', (req, res) => {
  const sql = "INSERT INTO users (`Name`, `Email`, `Image`,`ResgisterType`, `StdID`, `StdRes`,`PhoneNumber`) VALUES(?)";
  const values = [
    req.body.Name,
    req.body.eMail,
    req.body.image,
    req.body.type,
    req.body.Id,
    req.body.regNmbr,
    req.body.phnNmbr,
  ]
  // console.log(values);
  db.query(sql, [values], (err, data) => {
    if (err) return res.json('Error');
    // console.log(data);
    return res.json(data);
  })
})


//Post Request BOoks
app.post('/requestBook', (req, res) => {
  const sql = "INSERT INTO requestBooks (`BookId`, `Email`, `CurrentRequestTime`,`ExpireIssueTime`,`Statuss`) VALUES(?)";
  // console.log(req.body);
  const values = [
    req.body.id,
    req.body.email,
    requestTime,
    expireTime,
    req.body.status,
  ]
  db.query(sql, [values], (err, data) => {
    console.log(err);
    if (err) return res.json('Error');

    return res.json(data);
  })
})

//Post Offline Issue Books
app.post('/offlineRequestBook/:id', (req, res) => {
  let a =  expireDate();
  const sql = "INSERT INTO offlineBooks (`BookId`, `BookName`,`CallNumber`, `Barcode`,`ExpireDate`,`StdResId`,`Penalty`,`IssueDate`,`ReturnDate`) VALUES(?)";
  const bookCopiesUpdate = "UPDATE books SET `BookCopies` = `BookCopies`-1 WHERE ID = ?";
  // console.log(req.body);
  const values = [
    req.body.id,
    req.body.bookName,
    req.body.callNumber,
    req.body.barcode,
    a,
    req.body.stdId,
    req.body.Penalty,
    req.body.today,
    req.body.returnDate,
  ]
  let id =  req.params.id
  console.log("id",id);
  db.query(bookCopiesUpdate, [id], (err, data) => {
    console.log("data",data);
    if (err) {
      console.error("Error",err);
    }
  });
  db.query(sql, [values], (err, data) => {
    if (err) return res.json('Error');
    return res.json(data);
  })
})


//Offline Issue Books Get
app.get('/offlineIssueBooks', (req, res) => {

  const sql = 'select * from offlineBooks';
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    console.log(data);
    return res.json(data);
  })
});



//User GET
app.get('/users/:email', (req, res) => {
  const mail = req.params.email;
  // console.log(mail);

  const sql = 'select * from users WHERE Email = ?';
  db.query(sql, [mail], (err, result) => {
    if (err) {
      // console.log('Error fetching user details:', err);
      res.status(500).json({ error: 'Error fetching user details' });
    } else {
      if (result.length > 0) {
        // Book found
        const userDetails = result[0];
        // console.log(userDetails);
        res.json({
          name: userDetails.Name,
          email: userDetails.Email,
          type: userDetails.ResgisterType,
        });
      } else {
        // user not found
        res.status(404).json({ error: 'User not found' });
      }
    }

  });
});

//Single User Get
app.get('/singleUser/:email', (req, res) => {
  const mail = req.params.email;
  const sql = 'select * from users WHERE Email = ?';
  db.query(sql, [mail], (err, result) => {
    if (err) {
      // console.log('Error fetching user details:', err);
      res.status(500).json({ error: 'Error fetching user details' });
    } else {

      return res.json(result);;
    }

  });
});


//Staff Get
app.get('/staff', (req, res) => {
  const sql = 'SELECT * FROM users WHERE ResgisterType = "Staff"';
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  })
});

//all Users Info Get
app.get('/allusers', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, data) => {
    // console.log(err);
    if (err) return res.json("Error");
    return res.json(data);
  })
});

//Get Approve Request books list
app.get('/borrowbooks/:email', (req, res) => {
  const mail = req.params.email;
  const sql = 'SELECT * FROM approveBooks where Email = ? ';
  db.query(sql, [mail], (err, result) => {
    if (err) {
      // console.log('Error fetching user details:', err);
      res.status(500).json({ error: 'Error fetching user details' });
    } else {

      return res.json(result);;
    }

  });
});

//Testing Books Getting to Issue
app.get('/issueBooks', (req, res) => {
  const sql = 'SELECT books.BookName, books.Barcode, requestBooks.BookId,users.Email,users.StdID,users.StdRes,requestBooks.CurrentRequestTime,requestBooks.ExpireIssueTime,requestBooks.statuss FROM books join requestBooks ON books.ID = requestBooks.BookID Join users ON requestBooks.Email = users.Email'
  db.query(sql,(err, result) => {
    if (err) {
      console.log('Error fetching user details:', err);
      res.status(500).json({ error: 'Error fetching user details' });
    } else {
      // console.log("result",result);
      return res.json(result); 
    }

  });
});


cron.schedule('15 * * * * *', async () => {
  const requestBooks = await new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM requestBooks';
    db.query(sql, (err, requestBooks) => {
      // console.log(requestBooks);
      if (err) return reject(err);
      resolve(requestBooks);
    });
  });
  for (let index = 0; index < requestBooks.length; index++) {
    const obj = {};
    const id = requestBooks[index].BookId;
    const requestTime = requestBooks[index].CurrentRequestTime;
    const cancelTime = requestBooks[index].ExpireIssueTime;

    const dif = defferenceInMinutes(requestTime, cancelTime);

    if(dif==60){
      
    }

    const bookInformation = await new Promise((resolve, reject) => {
      const BookInfo = 'SELECT * FROM books WHERE ID = ?';
      db.query(BookInfo, [id], (err, bookInformation) => {
        if (err) return reject(err);
        resolve(bookInformation);
      });
    });

    obj['barcode'] = bookInformation[0].Barcode;
    obj['bookName'] = bookInformation[0].BookName;

    result.push(obj);
    // console.log(result);
  }
});


//Books Getting to Issue
// app.get('/issueBooks', async (req, res) => {
//   try {
//     const result = [];
//     const requestBooks = await new Promise((resolve, reject) => {
//       const sql = 'SELECT * FROM requestBooks';
//       db.query(sql, (err, requestBooks) => {
//         if (err) return reject(err);
//         resolve(requestBooks);
//       });
//     });

//     for (let index = 0; index < requestBooks.length; index++) {
//       const obj = {};
//       const id = requestBooks[index].BookId;
//       const email = requestBooks[index].Email;


//       const userInformation = await new Promise((resolve, reject) => {
//         const userInfo = 'SELECT * FROM users WHERE Email = ?';
//         db.query(userInfo, [email], (err, userInformation) => {
//           console.log("userInfo",userInformation[0]);
//           if (err) return reject(err);
//           resolve(userInformation);
//         });
//       });

//       obj['studentId'] = userInformation[0].StdID;
//       obj['studentReg'] = userInformation[0].StdRes;
//       obj['requestTime'] = requestBooks[index].CurrentRequestTime;
//       obj['issueTime'] = requestBooks[index].ExpireIssueTime;
//       obj['bookId'] = requestBooks[index].BookId;
//       obj['email'] = requestBooks[index].Email;
//       obj['status'] = requestBooks[index].statuss;

//       const bookInformation = await new Promise((resolve, reject) => {
//         const BookInfo = 'SELECT * FROM books WHERE ID = ?';
//         db.query(BookInfo, [id], (err, bookInformation) => {
//           if (err) return reject(err);
//           resolve(bookInformation);
//         });
//       });

//       obj['barcode'] = bookInformation.Barcode;
//       obj['bookName'] = bookInformation.BookName;
//       console.log("obj",obj);

//       result.push(obj);
//       // console.log(result);
//     }

//     return res.json(result);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: 'Error retrieving data from database' });
//   }
// });


// GET
app.get('/books/:id', (req, res) => {
  const bookId = req.params.id;
  console.log(bookId);

  const sql = 'SELECT * FROM books WHERE ID = ?';
  db.query(sql, [bookId], (err, result) => {
    if (err) {
      console.log('Error fetching book details:', err);
      res.status(500).json({ error: 'Error fetching book details' });
    } else {
      if (result.length > 0) {
        // Book found
        const bookDetails = result[0];
        // console.log(bookDetails);
        res.json({
          id: bookDetails.ID,
          bookName: bookDetails.BookName,
          price: bookDetails.BookCopies,
          author: bookDetails.AuthorName,
          date: bookDetails.Date,
          callNumber: bookDetails.CallNumber,
          accessionNumber: bookDetails.AccessionNumber,
          barcode: bookDetails.Barcode,
          image: bookDetails.image
        });
      } else {
        // Book not found
        res.status(404).json({ error: 'Book not found' });
      }
    }
  });
});


//UPDATE
app.put('/update/:id', (req, res) => {
  const sql = "UPDATE books SET `BookName` = ?, `BookCopies` = ?, `AuthorName` = ?,`Date` = ?,`CallNumber` = ?,`AccessionNumber` = ?,`Barcode` = ? WHERE ID = ?";
  const values = [
   req.body.bookName,
    req.body.price,
    req.body.Author,
    req.body.date,
    req.body.callNumber,
    req.body.accessionNumber,
    req.body.barcode
  ];
  const id = req.params.id;

  db.query(sql, [...values, id], (err, data) => {
    if (err) {
      console.error(err);
      return res.json('Error');
    }
    return res.json({ success: true });
  });
});


//Issue Book UPDATE
app.put('/updateBook/:id', (req, res) => {
  const bookCopiesUpdate = "UPDATE books SET `BookCopies` = `BookCopies`-1 WHERE ID = ?";
  const bookrequestStatusUpdate = "UPDATE requestBooks SET `statuss` = 'Approve' WHERE BookId = ?";
  const insertApprovedBooks = "INSERT INTO approveBooks (`BookId`,`Email`,`ApproveDate`,`LastReturnDate`,`ReturnDate`,`Penalty`) VALUES(?)";

  const values = [
    req.body.id,
    req.body.email,
    formattedCurrentDate,
    formattedSevenDaysLater,
    'null',
    req.body.penalty
  ];
  const id = req.params.id;

  db.query(bookCopiesUpdate, [id], (err, data) => {
    if (err) {
      console.error(err);
    }

  });

  db.query(bookrequestStatusUpdate, [id], (err, data) => {
    if (err) {
      console.error(err);
    }

  });
  db.query(insertApprovedBooks, [values], (err, data) => {
    if (err) {
      console.error(err);
      return res.json('Error');
    }
    return res.json({ success: true });
  });
});


//DELETE
app.delete('/deleteBook/:id', (req, res) => {
  const sql = "DELETE FROM books WHERE ID = ?";
  const id = req.params.id;

  db.query(sql, [id], (err, data) => {
    if (err) {
      // console.error(err);
      console.log('error');
      return res.json('Error');
    }
    console.log('not error');
    return res.json(data);

  });
});



app.listen(5000, () => {
  console.log('Libary Server is Running');
  db.connect(function (err) {
    if (err) throw err;
    console.log('Databse is Connected');
  })
});