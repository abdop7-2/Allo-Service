<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'nom',
        'icone'
    ];

    public function demandes() {
        return $this->hasMany(Demande::class);
    }

    public function prestataireProfiles() {
        return $this->hasMany(PrestataireProfile::class);
    }
}
