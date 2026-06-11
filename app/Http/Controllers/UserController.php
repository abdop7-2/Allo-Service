<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
}
