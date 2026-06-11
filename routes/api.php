<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\OffreController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\PrestataireController;
use App\Models\Category;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SocialAuthController;

// ─── Public ───────────────────────────────────
Route::get('/categories', fn() => response()->json(Category::all()));

// ─── Auth (public) ────────────────────────────
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Google OAuth (browser redirect flow)
Route::get('/auth/google',          [SocialAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [SocialAuthController::class, 'callback']);

// ─── Routes protégées (token requis) ──────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',             [AuthController::class, 'logout']);
    Route::get('/me',                  [AuthController::class, 'me']);

    // User profile
    Route::put('/user/profile',        [UserController::class, 'updateProfile']);
    Route::put('/user/password',       [UserController::class, 'updatePassword']);

    // Notifications
    Route::get('/notifications',       [NotificationController::class, 'index']);

    // Demandes
    Route::get('/demandes',           [DemandeController::class, 'index']);
    Route::post('/demandes',          [DemandeController::class, 'store']);
    Route::get('/demandes/{id}',      [DemandeController::class, 'show']);
    Route::put('/demandes/{id}',      [DemandeController::class, 'update']);
    Route::delete('/demandes/{id}',   [DemandeController::class, 'destroy']);

    // Offres
    Route::post('/offres',                        [OffreController::class, 'store']);
    Route::put('/offres/{id}/statut',             [OffreController::class, 'updateStatut']);
    Route::delete('/offres/{id}',                 [OffreController::class, 'destroy']);
    Route::get('/offres/mes-offres',              [OffreController::class, 'myOffres']);
    Route::get('/demandes/{id}/offres',           [OffreController::class, 'offresByDemande']);

    // Avis
    Route::post('/avis',                          [AvisController::class, 'store']);
    Route::get('/prestataires/{id}/avis',         [AvisController::class, 'avisByPrestataire']);

    // Prestataires
    Route::get('/prestataires',                   [PrestataireController::class, 'index']);
    Route::get('/prestataires/{id}/stats',        [PrestataireController::class, 'stats']);
    Route::get('/prestataires/{id}',              [PrestataireController::class, 'show']);
    Route::match(['post', 'put'], '/prestataires/profile', [PrestataireController::class, 'updateProfile']);

});