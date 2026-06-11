<?php
namespace App\Http\Controllers;

use App\Models\PrestataireProfile;
use App\Models\Offre;
use App\Models\Avis;
use App\Models\User;
use Illuminate\Http\Request;

class PrestataireController extends Controller
{
    public function index(Request $request)
    {
        // accepted-offers count per prestataire (used for ranking + display)
        $accepted = Offre::selectRaw('count(*)')
            ->whereColumn('offres.prestataire_id', 'prestataire_profiles.user_id')
            ->where('offres.statut', 'acceptee');

        $query = PrestataireProfile::query()
            ->join('users', 'users.id', '=', 'prestataire_profiles.user_id')
            ->select(
                'prestataire_profiles.*',
                'users.name',
                'users.avatar',
                'users.created_at as user_created_at'
            )
            ->selectSub($accepted, 'accepted_count')
            ->with('category');

        if ($request->category_id) {
            $query->where('prestataire_profiles.category_id', $request->category_id);
        }

        if ($request->has('availability')) {
            $query->where('prestataire_profiles.availability', $request->availability);
        }

        // Ranking: best rated first, then the most accepted missions
        $query->orderByDesc('prestataire_profiles.rating_avg')
              ->orderByDesc('accepted_count');

        return response()->json($query->paginate(15));
    }

    public function show(int $id)
    {
        $profile = PrestataireProfile::with(['user', 'category'])
            ->where('user_id', $id)
            ->firstOrFail();

        return response()->json($profile);
    }

    public function stats(int $id)
    {
        return response()->json($this->computeStats($id));
    }

    public function updateProfile(Request $request)
    {
        if (!$this->currentUser()->isPrestataire()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'category_id'  => 'required|exists:categories,id',
            'bio'          => 'nullable|string|max:1000',
            'availability' => 'boolean',
        ]);

        $profile = PrestataireProfile::updateOrCreate(
            ['user_id' => $this->currentUser()->id],
            [
                'category_id'  => $request->category_id,
                'bio'          => $request->bio,
                'availability' => $request->availability ?? true,
            ]
        );

        return response()->json($profile);
    }

    private function computeStats(int $userId): array
    {
        $offresTotal     = Offre::where('prestataire_id', $userId)->count();
        $offresAcceptees = Offre::where('prestataire_id', $userId)->where('statut', 'acceptee')->count();

        $missions = Offre::where('prestataire_id', $userId)
            ->where('statut', 'acceptee')
            ->whereHas('demande', fn($q) => $q->where('statut', 'terminee'))
            ->count();

        $avisCount = Avis::where('prestataire_id', $userId)->count();
        $note      = Avis::where('prestataire_id', $userId)->avg('note');

        $user = User::find($userId);

        return [
            'offres_total'       => $offresTotal,
            'offres_acceptees'   => $offresAcceptees,
            'missions_terminees' => $missions,
            'taux_acceptation'   => $offresTotal ? (int) round($offresAcceptees / $offresTotal * 100) : 0,
            'note'               => $note ? round($note, 1) : null,
            'avis_count'         => $avisCount,
            'member_since'       => $user?->created_at,
        ];
    }
}
