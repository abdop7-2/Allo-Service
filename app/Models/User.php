<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token'
    ];

    public function isClient() {
        return $this->role === 'client';
    }

    public function isPrestataire() {
        return $this->role === 'prestataire';
    }

    public function prestataireProfile() {
        return $this->hasOne(PrestataireProfile::class);
    }

    public function demandes() {
        return $this->hasMany(Demande::class, 'client_id');
    }

    public function offres() {
        return $this->hasMany(Offre::class, 'prestataire_id');
    }

    public function avis() {
        return $this->hasMany(Avis::class, 'client_id');
    }
}
