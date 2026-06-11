<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect(Request $request)
    {
        // stateless flow: carry the chosen role through the OAuth state param
        $role = $request->query('role') === 'prestataire' ? 'prestataire' : 'client';

        return Socialite::driver('google')
            ->stateless()
            ->with(['state' => $role])
            ->redirect();
    }

    public function callback(Request $request)
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect("{$frontendUrl}/login?error=google_failed");
        }

        $role = $request->query('state') === 'prestataire' ? 'prestataire' : 'client';

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name'     => $googleUser->getName(),
                'password' => Hash::make(Str::random(24)),
                'role'     => $role,
                'avatar'   => $googleUser->getAvatar(),
            ]
        );

        // refresh avatar for returning users who never set one
        if (!$user->avatar && $googleUser->getAvatar()) {
            $user->update(['avatar' => $googleUser->getAvatar()]);
        }

        $token = $user->createToken('google_token')->plainTextToken;

        return redirect("{$frontendUrl}/auth/callback?token={$token}&user=" . urlencode(json_encode([
            'id'     => $user->id,
            'name'   => $user->name,
            'email'  => $user->email,
            'role'   => $user->role,
            'avatar' => $user->avatar,
            'phone'  => $user->phone,
        ])));
    }
}
