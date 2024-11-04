select * from libary_database.users where StdID = "190144" and ResgisterType = "Student";

select * from libary_database.approveBooks;
select * from libary_database.offlineBooks where UUID = '2a572553-9f6e-493d-97cf-2f4c1fb016ef';
select * from libary_database.users;
select * from libary_database.books;
select * from libary_database.offlineBooks;


ALTER TABLE libary_database.approvebooks
DROP COLUMN Id;

SET GLOBAL log_bin_trust_function_creators = 1;

ALTER TABLE libary_database.books
ADD COLUMN UUID VARCHAR(36) NOT null;


UPDATE libary_database.offlineBooks
SET UUID = 0
WHERE Penalty = 145;

UPDATE libary_database.books
SET UUID = UUID()
WHERE UUID = '';

CURDATE();
SELECT CURDATE();

ALTER TABLE  libary_database.offlineBooks
MODIFY COLUMN Penalty INT;


UPDATE offlineBooks ob JOIN users u ON ob.StdResId = u.StdID JOIN approveBooks ab ON ab.Email = u.Email SET ob.ReturnDate = ? WHERE ob.UUID = ?

SELECT * FROM libary_database.approveBooks ab JOIN libary_database.users u ON ab.Email = u.Email JOIN libary_database.books b ON ab.BookId = b.ID WHERE StdID = '190144';


SELECT ab.UUID, ab.Email, ab.BookId, u.StdID, b.BookName
FROM libary_database.approveBooks ab 
JOIN libary_database.users u ON ab.Email = u.Email 
JOIN libary_database.books b ON ab.BookId = b.ID 
WHERE u.StdID = '190144'
GROUP BY ab.UUID, ab.Email, ab.BookId, u.StdID, b.BookName;
