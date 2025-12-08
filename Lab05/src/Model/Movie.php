<?php
namespace App\Model;

use App\Service\Config;

class Movie
{
    private ?int $id = null;
    private ?string $title = null;
    private ?string $director = null;
    private ?int $release_year = null;

    // ... (gettery i settery bez zmian) ...

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): Movie { $this->id = $id; return $this; }
    public function getTitle(): ?string { return $this->title; }
    public function setTitle(?string $title): Movie { $this->title = $title; return $this; }
    public function getDirector(): ?string { return $this->director; }
    public function setDirector(?string $director): Movie { $this->director = $director; return $this; }
    public function getReleaseYear(): ?int { return $this->release_year; }
    public function setReleaseYear(?int $release_year): Movie { $this->release_year = $release_year; return $this; }

    public static function fromArray($array): Movie
    {
        $movie = new self();
        $movie->fill($array);
        return $movie;
    }

    public function fill($array): Movie
    {
        if (isset($array['id']) && !$this->getId()) { $this->setId($array['id']); }
        if (isset($array['title'])) { $this->setTitle($array['title']); }
        if (isset($array['director'])) { $this->setDirector($array['director']); }
        if (isset($array['release_year'])) { $this->setReleaseYear($array['release_year']); }
        return $this;
    }

    /**
     * Kluczowa zmiana: dodanie "static", aby pasowało do Post.php
     */
    public static function findAll(): array
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM movie';
        $statement = $pdo->prepare($sql);
        $statement->execute();

        $movies = [];
        $moviesArray = $statement->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($moviesArray as $movieArray) {
            $movies[] = self::fromArray($movieArray);
        }

        return $movies;
    }

    /**
     * Kluczowa zmiana: dodanie "static", aby pasowało do Post.php
     */
    public static function find($id): ?Movie
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM movie WHERE id = :id';
        $statement = $pdo->prepare($sql);
        $statement->execute(['id' => $id]);

        $movieArray = $statement->fetch(\PDO::FETCH_ASSOC);
        if (!$movieArray) {
            return null;
        }
        $movie = Movie::fromArray($movieArray);

        return $movie;
    }

    // Metody save() i delete() pozostają non-static, co jest OK
    public function save(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        if (!$this->getId()) {
            $sql = "INSERT INTO movie (title, director, release_year) VALUES (:title, :director, :release_year)";
            $statement = $pdo->prepare($sql);
            $statement->execute([
                'title' => $this->getTitle(),
                'director' => $this->getDirector(),
                'release_year' => $this->getReleaseYear(),
            ]);
            $this->setId($pdo->lastInsertId());
        } else {
            $sql = "UPDATE movie SET title = :title, director = :director, release_year = :release_year WHERE id = :id";
            $statement = $pdo->prepare($sql);
            $statement->execute([
                ':title' => $this->getTitle(),
                ':director' => $this->getDirector(),
                ':release_year' => $this->getReleaseYear(),
                ':id' => $this->getId(),
            ]);
        }
    }

    public function delete(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = "DELETE FROM movie WHERE id = :id";
        $statement = $pdo->prepare($sql);
        $statement->execute([':id' => $this->getId()]);

        $this->setId(null);
        $this->setTitle(null);
        $this->setDirector(null);
        $this->setReleaseYear(null);
    }
}