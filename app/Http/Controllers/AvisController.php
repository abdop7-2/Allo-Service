<?php
namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\Offre;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    public function store(Request $request)
    {
        if (!$this->currentUser()->isClient()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'offre_id'    => 'required|exists:offres,id',
            'note'        => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string',
        ]);

        $offre = Offre::with('demande')->findOrFail($request->offre_id);

        if ($offre->statut !== 'acceptee') {
            return response()->json([
                'message' => 'Impossible de laisser un avis sur une offre non acceptée'
            ], 400);
        }

        if ($offre->demande->client_id !== $this->currentUser()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (Avis::where('offre_id', $request->offre_id)->exists()) {
            return response()->json(['message' => 'Un avis a déjà été soumis pour cette offre'], 422);
        }

        $avis = Avis::create([
            'client_id'      => $this->currentUser()->id,
            'prestataire_id' => $offre->prestataire_id,
            'offre_id'       => $request->offre_id,
            'note'           => $request->note,
            'commentaire'    => $request->commentaire,
        ]);

        $avg = Avis::where('prestataire_id', $offre->prestataire_id)->avg('note');
        optional($offre->prestataire->prestataireProfile)->update(['rating_avg' => $avg]);

        return response()->json($avis, 201);
    }

    public function avisByPrestataire(int $prestataire_id)
    {
        $avis = Avis::with('client')
            ->where('prestataire_id', $prestataire_id)
            ->get();

        return response()->json($avis);
    }
}
