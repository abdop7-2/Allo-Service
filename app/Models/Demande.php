<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    protected $fillable = [
        'client_id',
        'category_id',
        'prestataire_id',
        'title',
        'description',
        'budget',
        'city',
        'date_souhaitee',
        'statut',
    ];

    public function client() {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function prestataire() {
        return $this->belongsTo(User::class, 'prestataire_id');
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function offres() {
        return $this->hasMany(Offre::class);
    }
}
