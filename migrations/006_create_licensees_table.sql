CREATE TABLE IF NOT EXISTS licensees (
    userId TEXT NOT NULL,
    email TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    PRIMARY KEY (userId)
);

CREATE INDEX IF NOT EXISTS idx_licensees_email ON licensees(email); 