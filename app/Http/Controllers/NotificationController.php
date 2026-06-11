<?php
namespace App\Http\Controllers;

use App\Models\Offre;
use App\Models\Demande;

class NotificationController extends Controller
{
    public function index()
    {
        $user = $this->currentUser();
        $notifications = [];

        if ($user->isClient()) {
            // New offers received on open demandes
            $newOffres = Offre::with('demande')
                ->whereHas('demande', fn($q) => $q->where('client_id', $user->id))
                ->where('statut', 'en_attente')
                ->latest()
                ->take(20)
                ->get();

            foreach ($newOffres as $offre) {
                $notifications[] = [
                    'type'    => 'new_offre',
                    'message' => "Nouvelle offre reçue sur \"{$offre->demande->title}\"",
                    'date'    => $offre->created_at,
                    'link_id' => $offre->demande_id,
                ];
            }

            // Accepted / refused offers
            $updatedOffres = Offre::with('demande')
                ->whereHas('demande', fn($q) => $q->where('client_id', $user->id))
                ->whereIn('statut', ['acceptee', 'refusee'])
                ->latest()
                ->take(20)
                ->get();

            foreach ($updatedOffres as $offre) {
                $label = $offre->statut === 'acceptee' ? 'acceptée' : 'refusée';
                $notifications[] = [
                    'type'    => 'offre_' . $offre->statut,
                    'message' => "Votre offre sur \"{$offre->demande->title}\" a été {$label}",
                    'date'    => $offre->updated_at,
                    'link_id' => $offre->demande_id,
                ];
            }
        }

        if ($user->isPrestataire()) {
            // Offers accepted, refused or under negotiation
            $myOffres = Offre::with('demande')
                ->where('prestataire_id', $user->id)
                ->whereIn('statut', ['acceptee', 'refusee', 'negociation'])
                ->latest()
                ->take(20)
                ->get();

            foreach ($myOffres as $offre) {
                if ($offre->statut === 'negociation') {
                    $notifications[] = [
                        'type'    => 'offre_negociation',
                        'message' => "Le client propose " . number_format($offre->counter_devis, 0, ',', ' ') . " MAD pour \"{$offre->demande->title}\"",
                        'date'    => $offre->updated_at,
                        'link_id' => $offre->demande_id,
                    ];
                    continue;
                }
                $label = $offre->statut === 'acceptee' ? 'acceptée ✓' : 'refusée';
                $notifications[] = [
                    'type'    => 'offre_' . $offre->statut,
                    'message' => "Votre offre sur \"{$offre->demande->title}\" a été {$label}",
                    'date'    => $offre->updated_at,
                    'link_id' => $offre->demande_id,
                ];
            }

            // Demandes addressed directly to this prestataire
            $directes = Demande::with('client')
                ->where('prestataire_id', $user->id)
                ->where('statut', 'ouverte')
                ->latest()
                ->take(10)
                ->get();

            foreach ($directes as $demande) {
                $notifications[] = [
                    'type'    => 'demande_directe',
                    'message' => ($demande->client->name ?? 'Un client') . " vous a adressé une demande : \"{$demande->title}\"",
                    'date'    => $demande->created_at,
                    'link_id' => $demande->id,
                ];
            }

            // New open public demandes in their category
            $profile = $user->prestataireProfile;
            if ($profile) {
                $newDemandes = Demande::where('category_id', $profile->category_id)
                    ->whereNull('prestataire_id')
                    ->where('statut', 'ouverte')
                    ->latest()
                    ->take(10)
                    ->get();

                foreach ($newDemandes as $demande) {
                    $notifications[] = [
                        'type'    => 'new_demande',
                        'message' => "Nouvelle demande dans votre catégorie : \"{$demande->title}\"",
                        'date'    => $demande->created_at,
                        'link_id' => $demande->id,
                    ];
                }
            }
        }

        // Sort by date desc
        usort($notifications, fn($a, $b) => strtotime($b['date']) - strtotime($a['date']));

        return response()->json(array_slice($notifications, 0, 20));
    }
}
