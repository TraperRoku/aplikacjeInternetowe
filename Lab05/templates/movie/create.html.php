<?php

/** @var \App\Service\Router $router */

$title = 'Dodaj nowy film';
$bodyClass = 'create';

ob_start(); ?>
    <h1>Dodaj nowy film</h1>

    <form action="<?= $router->generatePath('movie-create') ?>" method="post" class="form">
        <div class="form-group">
            <label for="title">Tytuł</label>
            <input type="text" id="title" name="movie[title]" required class="form-control">
        </div>

        <div class="form-group">
            <label for="director">Reżyser</label>
            <input type="text" id="director" name="movie[director]" required class="form-control">
        </div>

        <div class="form-group">
            <label for="release_year">Rok produkcji</label>
            <input type="number" id="release_year" name="movie[release_year]" required class="form-control">
        </div>

        <button type="submit" class="btn btn-success">Zapisz film</button>
        <a href="<?= $router->generatePath('movie-index') ?>" class="btn btn-secondary">Anuluj</a>
    </form>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';