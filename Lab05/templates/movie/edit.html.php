<?php

/** @var \App\Model\Movie $movie */
/** @var \App\Service\Router $router */

$title = 'Edytuj film: ' . htmlspecialchars($movie->getTitle());
$bodyClass = 'edit';

ob_start(); ?>
    <h1>Edytuj film: <?= htmlspecialchars($movie->getTitle()) ?></h1>

    <form action="<?= $router->generatePath('movie-edit', ['id' => $movie->getId()]) ?>" method="post" class="form">
        <input type="hidden" name="movie[id]" value="<?= htmlspecialchars($movie->getId()) ?>">

        <div class="form-group">
            <label for="title">Tytuł</label>
            <input type="text" id="title" name="movie[title]" value="<?= htmlspecialchars($movie->getTitle()) ?>" required class="form-control">
        </div>

        <div class="form-group">
            <label for="director">Reżyser</label>
            <input type="text" id="director" name="movie[director]" value="<?= htmlspecialchars($movie->getDirector()) ?>" required class="form-control">
        </div>

        <div class="form-group">
            <label for="release_year">Rok produkcji</label>
            <input type="number" id="release_year" name="movie[release_year]" value="<?= htmlspecialchars($movie->getReleaseYear()) ?>" required class="form-control">
        </div>

        <button type="submit" class="btn btn-success">Zapisz zmiany</button>
        <a href="<?= $router->generatePath('movie-show', ['id' => $movie->getId()]) ?>" class="btn btn-secondary">Anuluj</a>
    </form>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';