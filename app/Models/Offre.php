<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Offre extends Model
{
    protected $fillable = [
        'demande_id',
        'prestataire_id',
        'devis',
        'counter_devis',
        'message',
        'statut'
    ];

    public function demande() {
        return $this->belongsTo(Demande::class);
    }

    public function prestataire() {
        return $this->belongsTo(User::class, 'prestataire_id');
    }

    public function avis() {
        return $this->hasOne(Avis::class);
    }
}
