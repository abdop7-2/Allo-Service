<?php
namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\Demande;
use App\Models\Offre;
use App\Models\PrestataireProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function updateProfile(Request $request)
    {
        $user = $this->currentUser();

        $request->validate([
            'name'   => 'sometimes|string|max:100',
            'phone'  => 'sometimes|nullable|string|max:20',
            'avatar' => 'sometimes|nullable|url|max:500',
        ]);

        $user->update($request->only(['name', 'phone', 'avatar']));

        return response()->json($user);
    }

    public function updatePassword(Request $request)
    {
        $user = $this->currentUser();

        $request->validate([
            'current_password' => 'required',
            'new_password'     => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Mot de passe mis à jour avec succès']);
    }

    public function destroy()
    {
        $user = $this->currentUser();

        // explicit ordered cleanup so FK constraints can't block the delete
        DB::transaction(function () use ($user) {
            $user->tokens()->delete();

            Avis::where('client_id', $user->id)
                ->orWhere('prestataire_id', $user->id)
                ->delete();

            $demandeIds = Demande::where('client_id', $user->id)->pluck('id');
            Offre::whereIn('demande_id', $demandeIds)->delete();
            Offre::where('prestataire_id', $user->id)->delete();
            Demande::whereIn('id', $demandeIds)->delete();

            PrestataireProfile::where('user_id', $user->id)->delete();

            $user->delete();
        });

        return response()->json(['message' => 'Compte supprimé définitivement']);
    }
}
