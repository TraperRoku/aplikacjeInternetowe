<?php

/** @var \App\Model\Movie[] $movies */
/** @var \App\Service\Router $router */

$title = 'Lista Filmów';
$bodyClass = 'index';

ob_start(); ?>
    <h1>Lista Filmów</h1>

    <a href="<?= $router->generatePath('movie-create') ?>">Dodaj nowy film</a>

    <ul class="index-list">
        <?php foreach ($movies as $movie): ?>
            <li><h3><?= htmlspecialchars($movie->getTitle()) ?> (<?= htmlspecialchars($movie->getReleaseYear()) ?>)</h3>
                <ul class="action-list">
                    <li>Reżyser: <?= htmlspecialchars($movie->getDirector()) ?></li>
                    <li><a href="<?= $router->generatePath('movie-show', ['id' => $movie->getId()]) ?>">Szczegóły</a></li>
                    <li><a href="<?= $router->generatePath('movie-edit', ['id' => $movie->getId()]) ?>">Edytuj</a></li>
                    <li><a href="<?= $router->generatePath('movie-delete', ['id' => $movie->getId()]) ?>" onclick="return confirm('Czy na pewno chcesz usunąć ten film?')">Usuń</a></li>
                </ul>
            </li>
        <?php endforeach; ?>
    </ul>

    <hr>
    <a href="<?= $router->generatePath('post-index') ?>">Powrót do Postów</a>

<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';