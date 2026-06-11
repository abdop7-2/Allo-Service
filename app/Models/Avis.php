<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    protected $fillable = [
        'client_id',
        'prestataire_id',
        'offre_id',
        'note',
        'commentaire'
    ];

    public function client() {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function prestataire() {
        return $this->belongsTo(User::class, 'prestataire_id');
    }

    public function offre() {
        return $this->belongsTo(Offre::class);
    }
}
