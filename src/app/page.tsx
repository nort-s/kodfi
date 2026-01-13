import Link from "next/link";
import {
  Wifi, Smartphone, TrendingUp, ShieldCheck,
  CheckCircle, XCircle, HelpCircle, ArrowRight,
  BarChart3, Users, Zap
} from "lucide-react";
import Button from "@/components/ui/button/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-brand-100 selection:text-brand-900">

      {/* 1. NAVBAR (Sticky & Glassmorphism) */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 p-2 rounded-lg text-white shadow-lg shadow-brand-200">
                <Wifi size={24} />
              </div>
              <span className="text-xl font-black tracking-tighter text-gray-900">Kodfi</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <Link href="#features" className="hover:text-brand-600 transition">Fonctionnalités</Link>
              <Link href="#how-it-works" className="hover:text-brand-600 transition">Comment ça marche</Link>
              <Link href="#pricing" className="hover:text-brand-600 transition">Tarifs</Link>
              <Link href="#faq" className="hover:text-brand-600 transition">FAQ</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/signin" className="text-sm font-bold text-gray-700 hover:text-brand-600 hidden sm:block">
                Connexion
              </Link>
              <Link href="/signin">
                <Button size="sm" variant="primary" className="shadow-md">
                  Ouvrir mon compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (Impact Majeur) */}
      <section className="pt-32 pb-20 lg:pt-36 lg:pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute top-20 right-0 -mr-20 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            className="lucide lucide-wifi">
            <path d="M12 20h.01"></path>
            <path d="M2 8.82a15 15 0 0 1 20 0"></path>
            <path d="M5 12.859a10 10 0 0 1 14 0"></path>
            <path d="M8.5 16.429a5 5 0 0 1 7 0"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          {/* <!-- Badge --> */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-brand-700 text-sm font-bold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
            </span>
            Nouveau au Bénin : le Wi-Fi qui vend tout seul
          </div>

          {/* <!-- Titre --> */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-gray-900 mb-8 leading-tight">
            Vendez vos codes Wi-Fi
            <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">
                même quand vous dormez
              </span>
          </h1>

          {/* <!-- Description --> */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Kodfi permet aux propriétaires de WiFi Zone de vendre des codes Wi-Fi automatiquement via Mobile Money.
            <br className="hidden sm:block"/>
            Plus besoin de tickets papier, de monnaie ou d’être présent toute la journée.
            Tout se gère depuis votre téléphone.
          </p>

          {/* <!-- CTA --> */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a className="w-full sm:w-auto" href="/signup">
              <button
                className="w-full px-8 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition shadow-xl shadow-brand-200 flex items-center justify-center gap-2">
                Commencer gratuitement
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  className="lucide lucide-arrow-right">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </a>

            <a className="w-full sm:w-auto" href="#how-it-works">
              <button
                className="w-full px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition">
                Voir la démo
              </button>
            </a>
          </div>

          {/* <!-- Trust --> */}
          <div className="mt-12 flex items-center justify-center gap-8 text-gray-400 grayscale opacity-70">
            <span className="font-bold text-xl">MTN MoMo</span>
            <span className="font-bold text-xl">Moov Money</span>
            <span className="font-bold text-xl">MikroTik</span>
          </div>

        </div>
      </section>


      {/* 3. LE COMPARATIF (Douleur vs Solution) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Pourquoi changer ?</h2>
            <p className="text-gray-500 mt-2">La méthode traditionnelle vous fait perdre de l'argent.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* AVANT (La Galère) */}
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
              <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
                <XCircle className="text-red-600" /> Gestion Manuelle
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-red-700">
                  <XCircle size={20} className="mt-0.5 shrink-0 opacity-70" />
                  Impression coûteuse des tickets papiers.
                </li>
                <li className="flex items-start gap-3 text-red-700">
                  <XCircle size={20} className="mt-0.5 shrink-0 opacity-70" />
                  Problèmes de monnaie constants (les pièces de 100F manquent).
                </li>
                <li className="flex items-start gap-3 text-red-700">
                  <XCircle size={20} className="mt-0.5 shrink-0 opacity-70" />
                  Comptabilité difficile (cahiers, erreurs, vols).
                </li>
                <li className="flex items-start gap-3 text-red-700">
                  <XCircle size={20} className="mt-0.5 shrink-0 opacity-70" />
                  Vous devez être présent physiquement pour vendre.
                </li>
              </ul>
            </div>

            {/* APRÈS (Kodfi) */}
            <div className="bg-brand-50 p-8 rounded-3xl border border-brand-100 shadow-lg relative">
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                Recommandé
              </div>
              <h3 className="text-xl font-bold text-brand-800 mb-6 flex items-center gap-2">
                <CheckCircle className="text-brand-600" /> Avec Kodfi
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-brand-900">
                  <CheckCircle size={20} className="mt-0.5 shrink-0 text-brand-600" />
                  0 papier, 0 impression. Tout est numérique.
                </li>
                <li className="flex items-start gap-3 text-brand-900">
                  <CheckCircle size={20} className="mt-0.5 shrink-0 text-brand-600" />
                  Paiement exact par MoMo. Plus de soucis de monnaie.
                </li>
                <li className="flex items-start gap-3 text-brand-900">
                  <CheckCircle size={20} className="mt-0.5 shrink-0 text-brand-600" />
                  Traçabilité totale : vous savez qui achète et quand.
                </li>
                <li className="flex items-start gap-3 text-brand-900">
                  <CheckCircle size={20} className="mt-0.5 shrink-0 text-brand-600" />
                  Vendez 24h/24, même quand vous n'êtes pas là.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMMENT ÇA MARCHE (Step by Step) */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Simple comme bonjour</h2>
            <p className="text-gray-500 mt-2">Installation en 5 minutes chrono.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>

            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-blue-200">
                1
              </div>
              <h3 className="text-lg font-bold mb-3">Créez votre Boutique</h3>
              <p className="text-gray-500 text-sm">Inscrivez-vous sur Kodfi et configurez vos tarifs (ex: 1H = 100F, Jour = 500F).</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-brand-200">
                2
              </div>
              <h3 className="text-lg font-bold mb-3">Importez vos Codes</h3>
              <p className="text-gray-500 text-sm">Copiez vos tickets depuis Mikrotik User Manager et collez-les dans Kodfi. Ils sont sécurisés.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-green-200">
                3
              </div>
              <h3 className="text-lg font-bold mb-3">Partagez le lien</h3>
              <p className="text-gray-500 text-sm">Affichez votre QR Code ou envoyez le lien sur WhatsApp. Les clients paient, vous encaissez.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FONCTIONNALITÉS CLÉS */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Tout pour gérer votre réseau</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center text-orange-600">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold">CRM Clients (WhatsApp)</h3>
              <p className="text-gray-500 leading-relaxed">
                Chaque client qui achète est enregistré. Vous avez son numéro pour le relancer sur WhatsApp avec des promos.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center text-indigo-600">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold">Comptabilité Temps Réel</h3>
              <p className="text-gray-500 leading-relaxed">
                Sachez exactement combien vous avez gagné aujourd'hui. Fini les calculs à la main le soir.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center text-green-600">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold">Livraison Instantanée</h3>
              <p className="text-gray-500 leading-relaxed">
                Le système fonctionne 24h/24. Vous pouvez dormir, vos clients continuent d'acheter des forfaits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ (Confiance) */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Questions Fréquentes</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-brand-500" />
                Est-ce que ça marche avec Mikrotik ?
              </h4>
              <p className="text-gray-600">Oui, absolument. Vous générez vos tickets sur Mikrotik comme d'habitude (via User Manager ou Terminal), et vous importez simplement la liste des codes dans Kodfi.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-brand-500" />
                Comment je reçois mon argent ?
              </h4>
              <p className="text-gray-600">Les paiements des clients arrivent sur votre compte marchand (Fedapay/Kkiapay) et vous pouvez retirer les fonds vers votre numéro MoMo personnel quand vous voulez.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                <HelpCircle size={18} className="text-brand-500" />
                Combien ça coûte ?
              </h4>
              <p className="text-gray-600">L'inscription est gratuite. Kodfi prend une petite commission uniquement sur les tickets vendus. Si vous ne vendez rien, vous ne payez rien.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="py-20 bg-brand-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          {/* Pattern de fond abstrait */}
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-black mb-6">Prêt à moderniser votre WiFi Zone ?</h2>
          <p className="text-xl text-brand-100 mb-10">
            Rejoignez les gérants qui ont arrêté de gérer la monnaie et les tickets papiers.
          </p>
          <Link href="/signin">
            <button className="px-10 py-5 bg-white text-brand-900 rounded-xl font-bold text-xl hover:bg-gray-100 transition shadow-2xl">
              Créer mon compte maintenant
            </button>
          </Link>
          <p className="mt-6 text-sm text-brand-300 opacity-80">
            Pas de carte bancaire requise • Installation en 5 minutes
          </p>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <Wifi size={20} />
              <span className="text-xl font-bold">Kodfi</span>
            </div>
            <p className="text-sm max-w-xs">
              La plateforme de référence pour l'automatisation des réseaux WiFi au Bénin et en Afrique de l'Ouest.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Fonctionnalités</Link></li>
              <li><Link href="#" className="hover:text-white">Intégrations</Link></li>
              <li><Link href="#" className="hover:text-white">Tarifs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Conditions d'utilisation</Link></li>
              <li><Link href="#" className="hover:text-white">Confidentialité</Link></li>
              <li><Link href="#" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
          © {new Date().getFullYear()} Kodfi Bénin. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}