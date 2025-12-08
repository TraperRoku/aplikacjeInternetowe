<?php

namespace App\Controller;

use App\Model\Movie;
use App\Service\Router;
use App\Service\Templating;

class MovieController
{

    public function indexAction(Templating $templating, Router $router): ?string
    {

        $movies = Movie::findAll();


        return $templating->render('movie/index.html.php', [
            'movies' => $movies,
            'router' => $router,
        ]);
    }


    public function showAction(int $id, Templating $templating, Router $router): ?string
    {
        $movie = Movie::find($id);
        if (!$movie) {
            http_response_code(404);
            return $templating->render('error/404.html.php', [
                'router' => $router,
            ]);
        }

        return $templating->render('movie/show.html.php', [
            'movie' => $movie,
            'router' => $router,
        ]);
    }


    public function createAction(?array $movieData, Templating $templating, Router $router): ?string
    {

        if ($movieData) {
            $movie = Movie::fromArray($movieData);
            $movie->save();
            $router->redirect($router->generatePath('movie-index'));
            return null;
        }


        return $templating->render('movie/create.html.php', [
            'router' => $router,
        ]);
    }


    public function editAction(int $id, ?array $movieData, Templating $templating, Router $router): ?string
    {
        $movie = Movie::find($id);
        if (!$movie) {
            http_response_code(404);
            return $templating->render('error/404.html.php', [
                'router' => $router,
            ]);
        }


        if ($movieData) {
            $movie->fill($movieData);
            $movie->save();
            $router->redirect($router->generatePath('movie-show', ['id' => $movie->getId()]));
            return null;
        }


        return $templating->render('movie/edit.html.php', [
            'movie' => $movie,
            'router' => $router,
        ]);
    }

    public function deleteAction(int $id, Router $router): ?string
    {
        $movie = Movie::find($id);
        if ($movie) {
            $movie->delete();
        }

        $router->redirect($router->generatePath('movie-index'));
        return null;
    }
}