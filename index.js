const express = require("express");
const expireDate = require("./expireDate");
const dateDifferenceInDays = require("./dateDifferenceInDays");
const differenceInMinutes = require("./differenceInMinutes");
const formatTime = require("./formatTime");
const { uuid } = require("uuidv4");

const cors = require("cors");
var mysql = require("mysql");
var cron = require("node-cron");

const app = express();

app.use(express.json());
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "190144Mnn#",
  database: "libary_database",
});

module.exports = db;

//7 days calculating

//Get Current Time in 12 Hour Format
let currentTime = new Date();

let requestTime = formatTime(currentTime);
let oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);

let expireTime = formatTime(oneHourLater);

// Get current date
// const currentDate = new Date();

const getCurrentBangladeshDateTime = () => {
  const utcDate = new Date();
  const bangladeshOffset = 6 * 60;
  const bangladeshDate = new Date(utcDate.getTime() + bangladeshOffset * 60000);
  return bangladeshDate;
};

const currentDate = getCurrentBangladeshDateTime();

// Get date 7 days from now
const sevenDaysLater = new Date();
sevenDaysLater.setDate(currentDate.getDate() + 7);

// Format dates as strings (optional)
const formattedCurrentDate = currentDate.toISOString().split("T")[0];
console.log(formattedCurrentDate);

const formattedSevenDaysLater = sevenDaysLater.toISOString().split("T")[0]; // yyyy-mm-dd

// Date difference Calculations

//get all books
//ok
app.get("/", (req, res) => {
  const sql = "SELECT * FROM books";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

// cron.schedule('* * * * *', () => {
//   console.log('running a task every minute');
// });

// POST
//ok
app.post("/books", (req, res) => {
  const sql =
    "INSERT INTO books (`ID`, `BookName`, `BookCopies`, `AuthorName`,`Date`,`CallNumber`,`AccessionNumber`,`Barcode`,`Image`) VALUES(?)";
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
  ];
  db.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

//Users info POST
//ok
app.post("/students", (req, res) => {
  const sql =
    "INSERT INTO users (`Name`, `Email`, `Image`,`ResgisterType`, `StdID`, `StdRes`,`PhoneNumber`) VALUES(?)";
  const values = [
    req.body.Name,
    req.body.eMail,
    req.body.image,
    req.body.type,
    req.body.Id,
    req.body.regNmbr,
    req.body.phnNmbr,
  ];
  // console.log(values);
  db.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    // console.log(data);
    return res.json(data);
  });
});

//Post Request Books
//ok
app.post("/requestBook", (req, res) => {
  const sql =
    "INSERT INTO requestBooks (`BookId`, `Email`, `CurrentRequestTime`,`ExpireIssueTime`,`Statuss`) VALUES(?)";
  // console.log(req.body);
  const values = [
    req.body.id,
    req.body.email,
    requestTime,
    expireTime,
    req.body.status,
  ];
  db.query(sql, [values], (err, data) => {
    console.log(err);
    if (err) return res.json("Error");

    return res.json(data);
  });
});

//Issue Online Book UPDATE
//Processing
app.put("/updateBook/:id", (req, res) => {
  const bookCopiesUpdate =
    "UPDATE books SET `BookCopies` = `BookCopies`-1 WHERE ID = ?";
  const bookrequestStatusUpdate =
    "UPDATE requestBooks SET `statuss` = 'Approve' WHERE BookId = ?";
  const insertApprovedBooks =
    "INSERT INTO approveBooks (`BookId`,`Email`,`ApproveDate`,`LastReturnDate`,`ReturnDate`,`Penalty`) VALUES(?)";

  const values = [
    req.body.id,
    req.body.email,
    formattedCurrentDate,
    formattedSevenDaysLater,
    "null",
    req.body.penalty,
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
      return res.json("Error");
    }
    return res.json({ success: true });
  });
});

//Get Online Approved books
//ok
app.get("/onlinepproveBooks", (req, res) => {
  const sql =
    "SELECT approveBooks.BookId, approveBooks.Email, users.StdID,approveBooks.ApproveDate,approveBooks.LastReturnDate,approveBooks.ReturnDate, approveBooks.Penalty FROM users JOIN approveBooks ON users.Email = approveBooks.Email";

  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

//Get Online Issue Books by id
//ok
app.get("/onlinepproveBooks/:id", (req, res) => {
  const BookId = req.params.id;
  console.log(BookId);

  const sql = "select * from approveBooks where BookId = ?";
  db.query(sql, [BookId], (err, result) => {
    if (err) {
      console.log("Error fetching book details:", err);
      res.status(500).json({ error: "Error fetching book details" });
    } else {
      if (result.length > 0) {
        // Book found
        const bookDetails = result[0];
        console.log(bookDetails);
        res.json({
          id: bookDetails.BookId,
          email: bookDetails.Email,
          approveDate: bookDetails.ApproveDate,
          expiredate: bookDetails.LastReturnDate,
          returnDate: bookDetails.ReturnDate,
          penalty: bookDetails.Penalty,
        });
      } else {
        // Book not found
        res.status(404).json({ error: "Book not found" });
      }
    }
  });
});

// Update Online Issue Books
app.put("/updateOnlineIssue/:id", (req, res) => {
  const sql = "update approveBooks set `ReturnDate` = ? where `BookId` =  ?";
  const bookCopiesUpdate =
    "UPDATE books SET `BookCopies` = `BookCopies`+1 WHERE ID = ?";
  const values = [req.body.returnDate];
  const id = req.params.id;

  db.query(sql, [...values, id], (err, data) => {
    if (err) {
      console.error(err);
      return res.json("Error");
    }
    return res.json({ success: true });
  });

  db.query(bookCopiesUpdate, [id], (err, data) => {
    if (err) {
      console.log(err);
    }
  });
});

// ____________________________________ofline Books______________________________________
//Post Offline Issue Books
app.post("/offlineRequestBook/:id", (req, res) => {
  let a = expireDate();
  const sql =
    "INSERT INTO offlineBooks (`BookId`, `BookName`,`CallNumber`, `Barcode`,`ExpireDate`,`StdResId`,`Penalty`,`IssueDate`,`ReturnDate`,`UUID`) VALUES(?)";
  const bookCopiesUpdate =
    "UPDATE books SET `BookCopies` = `BookCopies`-1 WHERE ID = ?";
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
    uuid(),
  ];
  let id = req.params.id;
  console.log("id", id);
  db.query(bookCopiesUpdate, [id], (err, data) => {
    console.log("data", data);
    if (err) {
      console.error("Error", err);
    }
  });
  db.query(sql, [values], (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

//Offline Issue Books Get
app.get("/offlineIssueBooks", (req, res) => {
  const sql = "select * from offlineBooks";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

//Offline Issue Books Get by id
app.get("/offlineIssueBooks/:id", (req, res) => {
  const BookId = req.params.id;
  console.log(BookId);

  const sql = "select * from offlineBooks where BookId = ?";
  db.query(sql, [BookId], (err, result) => {
    if (err) {
      console.log("Error fetching book details:", err);
      res.status(500).json({ error: "Error fetching book details" });
    } else {
      if (result.length > 0) {
        // Book found
        const bookDetails = result[0];
        console.log(bookDetails);
        res.json({
          id: bookDetails.BookID,
          bookName: bookDetails.BookName,
          callNumber: bookDetails.CallNumber,
          barcode: bookDetails.Barcode,
          expiredate: bookDetails.ExpireDate,
          stdId: bookDetails.StdResId,
          penalty: bookDetails.Penalty,
          issueDate: bookDetails.IssueDate,
          returnDate: bookDetails.ReturnDate,
        });
      } else {
        // Book not found
        res.status(404).json({ error: "Book not found" });
      }
    }
  });
});

// Update Offline Issue Books
app.put("/updateOfflineIssue/:id", (req, res) => {
  const sql = "update offlineBooks set `ReturnDate` = ? where `BookId` =  ?";
  const bookCopiesUpdate =
    "UPDATE books SET `BookCopies` = `BookCopies`+1 WHERE ID = ?";
  const values = [req.body.returnDate];
  const id = req.params.id;

  db.query(sql, [...values, id], (err, data) => {
    if (err) {
      console.error(err);
      return res.json("Error");
    }
    return res.json({ success: true });
  });

  db.query(bookCopiesUpdate, [id], (err, data) => {
    if (err) {
      console.log(err);
    }
  });
});

// Update return date for multiple offline issue books
app.put("/updateMultipleOfflineIssues/:id/:bookId", (req, res) => {
  const uuid = req.params.id;
  // console.log(uuid);
  const bookId = req.params.bookId;
  // console.log(bookId);
  const sqlCheck = "select * from approveBooks where  UUID = ?";

  db.query(sqlCheck, [uuid], (err, data) => {
    console.log("data1", data);
    if (err) {
      console.error(err);
      return res.json("Error");
    }
    if (data.length > 0) {
      const sql = "update approveBooks set `ReturnDate` = ? where `UUID` =  ?";

      db.query(sql, [formattedCurrentDate, uuid], (err, data) => {
        if (err) {
          console.error(err);
          return res.json("Error updating book copies");
        }
        if (data) {
          const bookCopiesUpdate =
            "UPDATE books SET `BookCopies` = `BookCopies` + 1 WHERE ID IN (?)";
          db.query(bookCopiesUpdate, [bookId], (err, data) => {
            if (err) {
              console.error(err);
              return res.json("Error updating book copies");
            }
            if (data) {
              return res.json("Success");
            }
          });
        }
      });
    } else {
      const sql = "update offlineBooks set `ReturnDate` = ? where `UUID` =  ?";
      db.query(sql, [formattedCurrentDate, uuid], (err, data) => {
        // console.log("data2", data);
        if (err) {
          console.error(err);
          return res.json("Error updating book copies");
        }
        if (data) {
          const bookCopiesUpdate =
            "UPDATE books SET `BookCopies` = `BookCopies` + 1 WHERE ID IN (?)";
          db.query(bookCopiesUpdate, [bookId], (err, data) => {
            if (err) {
              console.error(err);
              return res.json("Error updating book copies");
            }
            if (data) {
              return res.json("Success");
            }
          });
        }
      });
    }

    // db.query(bookCopiesUpdate, [uuid], (err, data) => {
    //   if (err) {
    //     console.error(err);
    //     return res.json("Error updating book copies");
    //   }

    //   return res.json({ success: true });
    // });
  });
});

// ____________________________________ofline Books______________________________________

//User GET
app.get("/users/:email", (req, res) => {
  const mail = req.params.email;
  // console.log(mail);

  const sql = "select * from users WHERE Email = ?";
  db.query(sql, [mail], (err, result) => {
    if (err) {
      // console.log('Error fetching user details:', err);
      res.status(500).json({ error: "Error fetching user details" });
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
        res.status(404).json({ error: "User not found" });
      }
    }
  });
});

//Single User Get
app.get("/singleUser/:email", (req, res) => {
  const mail = req.params.email;
  const sql = "select * from users WHERE Email = ?";
  db.query(sql, [mail], (err, result) => {
    if (err) {
      // console.log('Error fetching user details:', err);
      res.status(500).json({ error: "Error fetching user details" });
    } else {
      return res.json(result);
    }
  });
});

//Staff Get
app.get("/staff", (req, res) => {
  const sql = 'SELECT * FROM users WHERE ResgisterType = "Staff"';
  db.query(sql, (err, data) => {
    if (err) return res.json("Error");
    return res.json(data);
  });
});

//all Users Info Get
app.get("/allusers", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    // console.log(err);
    if (err) return res.json("Error");
    return res.json(data);
  });
});

//Get Approve Request books list
app.get("/borrowbooks/:email", (req, res) => {
  const mail = req.params.email;
  const sql = "SELECT * FROM approveBooks where Email = ? ";
  db.query(sql, [mail], (err, result) => {
    if (err) {
      // console.log('Error fetching user details:', err);
      res.status(500).json({ error: "Error fetching user details" });
    } else {
      return res.json(result);
    }
  });
});

//Testing Books Getting to Issue
app.get("/issueBooks", (req, res) => {
  const sql =
    "SELECT books.BookName, books.Barcode, requestBooks.BookId,users.Email,users.StdID,users.StdRes,requestBooks.CurrentRequestTime,requestBooks.ExpireIssueTime,requestBooks.statuss FROM books join requestBooks ON books.ID = requestBooks.BookID Join users ON requestBooks.Email = users.Email";
  db.query(sql, (err, result) => {
    if (err) {
      console.log("Error fetching user details:", err);
      res.status(500).json({ error: "Error fetching user details" });
    } else {
      // console.log("result",result);
      return res.json(result);
    }
  });
});

//get Student info
app.get("/studentInfo/:id", async (req, res) => {
  const id = req.params.id;

  const sql =
    "select * from libary_database.users where  ResgisterType = 'Student' and StdID = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Error fetching user details" });
    } else {
      return res.json(result);
    }
  });
});

//______________________Book Summary_____________________
app.get("/booksummary/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "ID parameter is required" });
  }

  const offlineBooksQuery = "SELECT * FROM offlineBooks WHERE StdResId = ?";
  const onlineBooksQuery =
    "SELECT ab.UUID, ab.Email, ab.BookId, u.StdID, b.BookName, ab.ApproveDate, ab.LastReturnDate, ab.ReturnDate, ab.Penalty FROM approveBooks ab JOIN users u ON ab.Email = u.Email JOIN books b ON ab.BookId = b.ID WHERE u.StdID = ? GROUP BY ab.UUID, ab.Email, ab.BookId, u.StdID, b.BookName, ab.ApproveDate, ab.LastReturnDate, ab.ReturnDate, ab.Penalty";

  const offlineBooksPromise = new Promise((resolve, reject) => {
    db.query(offlineBooksQuery, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });

  const onlineBooksPromise = new Promise((resolve, reject) => {
    db.query(onlineBooksQuery, [id], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });

  try {
    const [offlineBooks, onlineBooks] = await Promise.all([
      offlineBooksPromise,
      onlineBooksPromise,
    ]);

    const bookIssue = [...offlineBooks, ...onlineBooks];
    const bookSummary = bookIssue.map((book) => ({
      UUID: book.UUID,
      BookId: book.BookId,
      BookName: book.BookName,
      IssueDate: book.IssueDate || book.ApproveDate,
      ExpireDate: book.ExpireDate || book.LastReturnDate,
      ReturnDate: book.ReturnDate,
      Penalty: book.Penalty,
    }));

    bookSummary.sort((a, b) => new Date(b.IssueDate) - new Date(a.IssueDate));
    sortBookSummary = bookSummary.filter((i) => i.ReturnDate == "null");
    res.json(sortBookSummary);
  } catch (error) {
    console.error("Error fetching book summary:", error);
    res.status(500).json({ error: "Error fetching book summary" });
  }
});

//______________________Book Summary_____________________

//Book Collection time Expire time
cron.schedule("59 * * * *", async () => {
  try {
    const requestBooks = await new Promise((resolve, reject) => {
      const sql = "SELECT * FROM requestBooks";
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    for (let index = 0; index < requestBooks.length; index++) {
      const id = requestBooks[index].BookId;
      const requestTime = requestBooks[index].CurrentRequestTime;
      const cancelTime = requestBooks[index].ExpireIssueTime;
      const Status = requestBooks[index].statuss;
      console.log("Status:", Status);
      const status =
        'UPDATE requestBooks SET `statuss` = "Cancel" WHERE BookId = ?';

      if (Status === "Pending") {
        const dif = differenceInMinutes(requestTime, cancelTime);
        if (dif === 60) {
          await new Promise((resolve, reject) => {
            db.query(status, [id], (err, data) => {
              if (err) return reject(err);
              resolve(data);
            });
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

// Penalty Calculation
cron.schedule("* * * * * *", async () => {
  // console.log('hit')
  try {
    // console.log('object');
      const approveBooks = await new Promise((resolve, reject) => {
        const approveBook = "SELECT * FROM approveBooks";
        db.query(approveBook, (err, results) => {
          // console.log(results);
          if (err) return reject(err);
          // resolve(results);
        });
      });

      // const offlineBooks = await new Promise((resolve, reject)=>{
      //   const offlineBook = "SELECT * FROM offlineBooks";
      //   db.query(offlineBook, (err,results)=>{
      //     if (err) return reject(err); 
      //     // resolve(results);
      //   })
      // })

      console.log("sanmlk");

      for (let index = 0; index < approveBooks.length; index++) {
        console.log(object);
        const id = approveBooks[index].UUID;
        const expireDate = approveBooks[index].LastReturnDate;
        const issueDate = approveBooks[index].ApproveDate;
        const returnDate = approveBooks[index].ReturnDate;
        // const diff = approveBooks[index].dateDiff;

        let dif = dateDifferenceInDays(formattedCurrentDate, issueDate);

        console.log(dif, issueDate, formattedCurrentDate);

        if (dif > 7 && returnDate == "null") {
          const penaltyAmount = dif * 5;
          const penaltyQuery =
            "UPDATE approveBooks SET Penalty = ? WHERE UUID = ?";
          db.query(penaltyQuery, [penaltyAmount, id], (err, data) => {
            if (err) {
              console.error("Error updating penalty:", err);
              return reject(err);
            }
            console.log("Update approveBooks successful. Affected rows:", data.affectedRows);
            // resolve(data);
          });
        }
      };
      
      // for (let i = 0; i < offlineBooks.length; i++) {
      //   console.log("wdesfr");
      //   const id = offlineBooks[i].UUID;
      //   const expireDate = offlineBooks[i].ExpireDate;
      //   const issueDate =offlineBooks[i].IssueDate;
      //   const returnDate = offlineBooks[i].ReturnDate;

      //   let dif = dateDifferenceInDays(formattedCurrentDate, issueDate);
      //   console.log(dif, issueDate, formattedCurrentDate);

      //   if (dif > 7 && returnDate == "null") {
      //     const penaltyAmount = dif * 5;
      //     const penaltyQuery ="UPDATE offlineBooks SET Penalty = ? WHERE UUID = ?";
      //     db.query(penaltyQuery, [penaltyAmount, id], (err, data) => {
      //       if (err) {
      //         console.error("Error updating penalty:", err);
      //         return reject(err);
      //       }
      //       console.log("Update offlineBooks successful . Affected rows:", data.affectedRows);
      //       // resolve(data);
      //     });
      //   }
      // };
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

//Online Penalty Calculation

app.get("/updatePenaltys", async (req, res) => {
  const approveBooks = await new Promise((resolve, reject) => {
    const approveBook = "SELECT * FROM approveBooks";
    db.query(approveBook, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

  for (let index = 0; index < approveBooks.length; index++) {
    const id = approveBooks[index].UUID;
    const expireDate = approveBooks[index].LastReturnDate;
    const issueDate = approveBooks[index].ApproveDate;
    const returnDate = approveBooks[index].ReturnDate;
    // const diff = approveBooks[index].dateDiff;

    let dif = dateDifferenceInDays(formattedCurrentDate, issueDate);

    console.log(dif, issueDate, formattedCurrentDate);

    if (dif > 7 && returnDate == "null") {
      const penaltyAmount = dif * 5;
      const penaltyQuery = "UPDATE approveBooks SET Penalty = ? WHERE UUID = ?";
      db.query(penaltyQuery, [penaltyAmount, id], (err, data) => {
        if (err) {
          console.error("Error updating penalty:", err);
          return reject(err);
        }
        console.log("Update successful. Affected rows:", data.affectedRows);
        // resolve(data);
      });
    }
  }
  res.send("Update");
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

app.get("/books/:id", async (req, res) => {
  const bookId = req.params.id;
  console.log(bookId);

  const sql = "SELECT * FROM books WHERE ID = ?";
  db.query(sql, [bookId], (err, result) => {
    if (err) {
      console.log("Error fetching book details:", err);
      res.status(500).json({ error: "Error fetching book details" });
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
          image: bookDetails.image,
          UUID: bookDetails.UUID,
        });
      } else {
        // Book not found
        res.status(404).json({ error: "Book not found" });
      }
    }
  });
});

//UPDATE
app.put("/update/:id", (req, res) => {
  const sql =
    "UPDATE books SET `BookName` = ?, `BookCopies` = ?, `AuthorName` = ?,`Date` = ?,`CallNumber` = ?,`AccessionNumber` = ?,`Barcode` = ? WHERE ID = ?";
  const values = [
    req.body.bookName,
    req.body.price,
    req.body.Author,
    req.body.date,
    req.body.callNumber,
    req.body.accessionNumber,
    req.body.barcode,
  ];
  const id = req.params.id;

  db.query(sql, [...values, id], (err, data) => {
    if (err) {
      console.error(err);
      return res.json("Error");
    }
    return res.json({ success: true });
  });
});

//DELETE
app.delete("/deleteBook/:id", (req, res) => {
  const sql = "DELETE FROM books WHERE ID = ?";
  const id = req.params.id;

  db.query(sql, [id], (err, data) => {
    if (err) {
      // console.error(err);
      console.log("error");
      return res.json("Error");
    }
    console.log("not error");
    return res.json(data);
  });
});

app.listen(5000, () => {
  console.log("Libary Server is Running");
  db.connect(function (err) {
    if (err) throw err;
    console.log("Databse is Connected");
  });
});
