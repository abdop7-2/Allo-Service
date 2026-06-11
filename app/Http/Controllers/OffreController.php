<?php
namespace App\Http\Controllers;

use App\Models\Offre;
use Illuminate\Http\Request;

class OffreController extends Controller
{
    public function store(Request $request)
    {
        if (!$this->currentUser()->isPrestataire()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'demande_id' => 'required|exists:demandes,id',
            'devis'      => 'required|numeric|min:1|max:999999',
            'message'    => 'required|string|max:1000',
        ]);

        $demande = \App\Models\Demande::findOrFail($request->demande_id);

        if ($demande->client_id === $this->currentUser()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas soumettre une offre sur votre propre demande'], 403);
        }

        if ($demande->statut !== 'ouverte') {
            return response()->json(['message' => 'Cette demande n\'accepte plus d\'offres'], 422);
        }

        $offre = Offre::create([
            'demande_id'     => $request->demande_id,
            'prestataire_id' => $this->currentUser()->id,
            'devis'          => $request->devis,
            'message'        => $request->message,
            'statut'         => 'en_attente',
        ]);

        return response()->json($offre, 201);
    }

    public function updateStatut(Request $request, int $id)
    {
        $offre = Offre::with('demande')->findOrFail($id);

        if ($this->currentUser()->id !== $offre->demande->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'statut' => 'required|in:acceptee,refusee',
        ]);

        $offre->update(['statut' => $request->statut]);

        if ($request->statut === 'acceptee') {
            $offre->demande->update(['statut' => 'en_cours']);
        }

        return response()->json($offre);
    }

    public function myOffres()
    {
        $offres = Offre::with('demande')
            ->where('prestataire_id', $this->currentUser()->id)
            ->latest()
            ->get();

        return response()->json($offres);
    }

    // negotiation: the prestataire can revise his devis while it's still pending
    public function update(Request $request, int $id)
    {
        $offre = Offre::findOrFail($id);

        if ($this->currentUser()->id !== $offre->prestataire_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($offre->statut !== 'en_attente') {
            return response()->json(['message' => 'Seules les offres en attente peuvent être modifiées'], 422);
        }

        $request->validate([
            'devis'   => 'required|numeric|min:1|max:999999',
            'message' => 'required|string|max:1000',
        ]);

        $offre->update($request->only(['devis', 'message']));

        return response()->json($offre);
    }

    public function destroy(int $id)
    {
        $offre = Offre::findOrFail($id);

        if ($this->currentUser()->id !== $offre->prestataire_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($offre->statut !== 'en_attente') {
            return response()->json(['message' => 'Seules les offres en attente peuvent être retirées'], 422);
        }

        $offre->delete();

        return response()->json(['message' => 'Offre retirée avec succès']);
    }

    public function offresByDemande(int $demande_id)
    {
        $demande = \App\Models\Demande::findOrFail($demande_id);

        if ($this->currentUser()->id !== $demande->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $offres = Offre::with('prestataire')
            ->where('demande_id', $demande_id)
            ->get();

        return response()->json($offres);
    }
}
