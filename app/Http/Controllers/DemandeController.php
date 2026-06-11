<?php
namespace App\Http\Controllers;

use App\Models\Demande;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    public function index(Request $request)
    {
        $user = $this->currentUser();
        $query = Demande::with(['client', 'category']);

        if ($user->isClient()) {
            $query->where('client_id', $user->id);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        if (!$this->currentUser()->isClient()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title'          => 'required|string|max:150',
            'description'    => 'required|string|max:2000',
            'category_id'    => 'required|exists:categories,id',
            'budget'         => 'nullable|numeric|min:1|max:999999',
            'city'           => 'nullable|string|max:100',
            'date_souhaitee' => 'required|date|after:today',
        ]);

        $demande = Demande::create([
            'client_id'      => $this->currentUser()->id,
            'category_id'    => $request->category_id,
            'title'          => $request->title,
            'description'    => $request->description,
            'budget'         => $request->budget,
            'city'           => $request->city,
            'date_souhaitee' => $request->date_souhaitee,
            'statut'         => 'ouverte',
        ]);

        return response()->json($demande, 201);
    }

    public function show(int $id)
    {
        $demande = Demande::with(['client', 'category', 'offres'])
            ->findOrFail($id);
        return response()->json($demande);
    }

    public function update(Request $request, int $id)
    {
        $demande = Demande::findOrFail($id);

        if ($this->currentUser()->id !== $demande->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (in_array($demande->statut, ['en_cours', 'terminee', 'annulee'])) {
            return response()->json(['message' => 'Cette demande ne peut plus être modifiée'], 422);
        }

        $request->validate([
            'title'          => 'sometimes|string|max:150',
            'description'    => 'sometimes|string|max:2000',
            'budget'         => 'sometimes|numeric|min:1|max:999999',
            'city'           => 'sometimes|nullable|string|max:100',
            'date_souhaitee' => 'sometimes|date|after:today',
            'statut'         => 'sometimes|in:ouverte,annulee',
        ]);

        $demande->update($request->only([
            'title', 'description', 'budget', 'city', 'date_souhaitee', 'statut'
        ]));

        return response()->json($demande);
    }

    public function destroy(int $id)
    {
        $demande = Demande::findOrFail($id);

        if ($this->currentUser()->id !== $demande->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $demande->delete();

        return response()->json(['message' => 'Demande supprimée']);
    }
}
