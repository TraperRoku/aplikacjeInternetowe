
CREATE TABLE movie (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       title VARCHAR(255) NOT NULL,
                       director VARCHAR(255) NOT NULL,
                       release_year INTEGER
);


INSERT INTO movie (title, director, release_year) VALUES ('Diuna: Część druga', 'Denis Villeneuve', 2024);
INSERT INTO movie (title, director, release_year) VALUES ('Incepcja', 'Christopher Nolan', 2010);
INSERT INTO movie (title, director, release_year) VALUES ('Władca Pierścieni: Drużyna Pierścienia', 'Peter Jackson', 2001);