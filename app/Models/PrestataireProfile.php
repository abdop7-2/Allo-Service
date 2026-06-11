<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrestataireProfile extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'bio',
        'availability',
        'rating_avg'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }
}
