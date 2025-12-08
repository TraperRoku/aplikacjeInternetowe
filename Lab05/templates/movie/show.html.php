<?php

/** @var \App\Model\Movie $movie */
/** @var \App\Service\Router $router */

$title = htmlspecialchars($movie->getTitle());
$bodyClass = 'show';

ob_start(); ?>
    <h1><?= htmlspecialchars($movie->getTitle()) ?></h1>

    <p>
        <strong>Reżyser:</strong> <?= htmlspecialchars($movie->getDirector()) ?><br>
        <strong>Rok produkcji:</strong> <?= htmlspecialchars($movie->getReleaseYear()) ?><br>
        <strong>ID:</strong> <?= htmlspecialchars($movie->getId()) ?>
    </p>

    <ul class="action-list">
        <li>
            <a href="<?= $router->generatePath('movie-edit', ['id' => $movie->getId()]) ?>">Edytuj film</a>
        </li>
        <li>
            <a href="<?= $router->generatePath('movie-delete', ['id' => $movie->getId()]) ?>" onclick="return confirm('Czy na pewno chcesz usunąć ten film?')">Usuń film</a>
        </li>
        <li>
            <a href="<?= $router->generatePath('movie-index') ?>">Powrót do listy</a>
        </li>
    </ul>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';