"use client";

import Link from "next/link";

import { motion } from "framer-motion";

import { Wifi, Smartphone, TrendingUp, ShieldCheck, CheckCircle, XCircle, HelpCircle, ArrowRight, BarChart3, Users, Zap, Settings, DollarSign, Activity, Phone } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Tabs, Tab } from "@/components/landing/tabs/Tabs";
import KodfiInAction from "@/components/landing/KodfiInAction";
import { useState } from "react";



export default function LandingPage() {
  const [dailySales, setDailySales] = useState(145);
  const avgTicket = 200
  const monthlyRevenue = dailySales * 30 * 200 * 0.9;

  function FAQItem({ question, answer }: { question: string, answer: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:border-brand-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-6 flex justify-between items-center text-left"
        >
          <span className="font-bold text-lg text-gray-900">{question}</span>
          <div className={`p-2 rounded-full bg-gray-50 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-brand-50 text-brand-600' : ''}`}>
            <HelpCircle size={20} />
          </div>
        </button>
        <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 pt-0 text-gray-600 border-t border-gray-50 leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    );
  }

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

      {/* 2.  HERO SECTION 2.0 */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-6 border border-brand-100 uppercase tracking-widest">
                🚀 L'unique solution automatisée au Bénin
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
                Votre WiFi devient une <span className="text-brand-600">banque.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                Kodfi transforme votre routeur MikroTik en un automate de vente 24h/24.
                Encaissez via MoMo & Flooz sans bouger de votre canapé.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="md" className="rounded-full px-8 shadow-2xl shadow-brand-500/20">
                  Démarrer gratuitement
                </Button>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      KF
                    </div>
                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-300" />)}
                  </div>
                  +450 gérants nous font confiance
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-900 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
  ⚡ 127 gérants ont créé leur compte cette semaine
</div>
            </div> */}
            <div className="flex-1 text-left">
              {/* Badge avec urgence */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
                  🚀 L'unique solution automatisée au Bénin
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 uppercase tracking-widest">
                  🔥 Installation -60% : 2000 FCFA au lieu de 5000 FCFA
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 flex items-center gap-2">
                ⏰ <span className="font-semibold text-amber-900">Plus que 23 places</span>
                à ce tarif pour les early adopters
              </p>

              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
                Votre WiFi devient une <span className="text-brand-600">banque.</span>
              </h1>

              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                Kodfi transforme votre routeur MikroTik en un automate de vente 24h/24.
                <strong>Encaissez</strong> via MoMo & Flooz sans bouger de votre canapé.
              </p>

              {/* Témoignage court */}
              <div className="bg-slate-50 border-l-4 border-brand-600 p-4 mb-6 rounded-r-lg">
                <p className="text-sm italic text-slate-700">
                  "Je dors tranquille, Kodfi vend mes forfaits même à 3h du matin"
                </p>
                <p className="text-xs text-slate-500 mt-2">— Nicanor B., Gérant WiFi Zone à Abomey-Calavi</p>
              </div>
            </div>

            {/* LE SIMULATEUR (Côté droit) */}
            <div className="flex-1 w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl relative">
              <div className="absolute -top-6 -left-6 bg-brand-600 text-white p-4 rounded-2xl shadow-lg">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-bold mb-6">Simulateur de revenus</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-slate-500 block mb-2">Ventes par jour (estimé)</label>
                  <input
                    type="range"
                    value={dailySales}
                    onChange={(e) => setDailySales(Number(e.target.value))}
                    min="10"
                    max="500"
                    className="w-full accent-brand-600"
                  />

                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-slate-500 text-sm">Gain mensuel potentiel</span>
                  <div className="text-3xl font-black text-brand-600">
                    {monthlyRevenue.toLocaleString('fr-FR')} FCFA
                  </div>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    ✓ Montant net que vous recevez (90% garanti)
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">Basé sur {dailySales} ventes/jour × {avgTicket}FCFA</p>
              </div>
            </div>

          </div>

        </div>

      </section>


      {/* 3. LE COMPARATIF (Douleur vs Solution) */}
      {/* SECTION COMPARATIVE RADICALE */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Pourquoi Kodfi est indétrônable ?
            </h2>
            <p className="text-slate-400 text-lg">
              Plus qu'un simple widget, une infrastructure de niveau bancaire.
            </p>
          </div>

          {/* Grid 2×2 au lieu de 1×4 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Box 1: Automatisation */}
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:border-brand-500 transition-colors group">
              <Zap className="text-brand-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-4">Zéro Gestion de Stock</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Contrairement aux autres, Kodfi pilote votre MikroTik. Le système crée
                lui-même les codes quand le stock baisse. Vous ne touchez plus à Winbox.
              </p>
            </div>

            {/* Box 2: ARCEP */}
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:border-emerald-500 transition-colors group">
              <ShieldCheck className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-4">Bouclier Légal ARCEP</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Chaque connexion enregistre l'adresse MAC et le numéro de téléphone.
                En cas d'incident, vous fournissez les preuves en 1 clic. Dormez l'esprit tranquille.
              </p>
            </div>

            {/* Box 3: UX */}
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:border-blue-500 transition-colors group">
              <Smartphone className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-4">Expérience "Sans Couture"</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pas de redirection lente vers un autre site. Le paiement se fait sur votre
                portail. Le client valide son code secret et il est connecté automatiquement.
              </p>
            </div>

            {/* Box 4: Pricing */}
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 hover:border-green-500 transition-colors group">
              <DollarSign className="text-green-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-4">Pricing Transparent</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                10% de commission, point final. Pas de frais cachés, pas de surprise.
                Tous les frais techniques sont à notre charge. Vous recevez toujours
                exactement 90% de vos ventes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMMENT ÇA MARCHE (Step by Step) */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Simple comme bonjour</h2>
            <p className="text-gray-500 mt-2">Installation en 15 minutes chrono.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>

            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-blue-200">
                1
              </div>
              <h3 className="text-lg font-bold mb-3">Créez vos offres</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Inscrivez-vous sur Kodfi et configurez vos tarifs directement sur la plateforme
                (ex: 1H = 100F, Jour = 500F, Semaine = 1000F). Kodfi génère automatiquement
                les codes sur votre MikroTik.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-brand-200">
                2
              </div>
              <h3 className="text-lg font-bold mb-3">Installez le script</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Téléchargez le script Kodfi et ajoutez-le à votre MikroTik.
                Puis intégrez le widget de paiement sur votre portail captif en copiant
                1 ligne de code. Tout est automatisé !
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg shadow-green-200">
                3
              </div>
              <h3 className="text-lg font-bold mb-3">Vos clients paient, vous encaissez</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Vos clients se connectent au WiFi, paient par MoMo/Flooz directement
                sur votre portail, et reçoivent leur code instantanément.
                Vous recevez 90% de chaque vente. 24h/24, sans intervention.
              </p>
            </div>
          </div>

          {/* Bonus : Visual flow pour desktop */}
          <div className="mt-16 hidden lg:block">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200">
              <h3 className="text-center font-bold text-xl text-gray-900 mb-8">
                Le parcours de votre client (en 30 secondes)
              </h3>

              <div className="flex items-center justify-between gap-4">
                {/* Étape 1 */}
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wifi size={24} className="text-brand-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Se connecte au WiFi</p>
                  <p className="text-xs text-gray-500 mt-1">Portail captif s'affiche</p>
                </div>

                <ArrowRight className="text-gray-300 flex-shrink-0" size={24} />

                {/* Étape 2 */}
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Choisit son forfait</p>
                  <p className="text-xs text-gray-500 mt-1">1H, Jour, Semaine...</p>
                </div>

                <ArrowRight className="text-gray-300 flex-shrink-0" size={24} />

                {/* Étape 3 */}
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Smartphone size={24} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Paie par MoMo/Flooz</p>
                  <p className="text-xs text-gray-500 mt-1">Paiement sécurisé</p>
                </div>

                <ArrowRight className="text-gray-300 flex-shrink-0" size={24} />

                {/* Étape 4 */}
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Reçoit son code</p>
                  <p className="text-xs text-gray-500 mt-1">Connexion automatique</p>
                </div>
              </div>

              <div className="mt-8 bg-brand-50 p-4 rounded-lg border border-brand-200 text-center">
                <p className="text-sm text-brand-900">
                  <strong>⚡ Temps total : moins de 30 secondes</strong> •
                  Aucune intervention de votre part
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FONCTIONNALITÉS CLÉS */}
      <KodfiInAction />

      {/* 6. FAQ (Confiance) */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Des questions ?</h2>
            <p className="text-gray-600">Tout ce que vous devez savoir pour lancer votre business.</p>
          </div>

          <div className="space-y-4 mb-20">
            <FAQItem
              question="Est-ce compatible avec mon MikroTik ?"
              answer={<p>Oui, 100% compatible avec <strong>RouterOS v6 et v7</strong>. Kodfi automatise la création de codes et la gestion des stocks. Vous ne touchez plus à Winbox.</p>}
            />
            <FAQItem
              question="Comment je reçois mon argent ?"
              answer={<p>L'argent est collecté via FedaPay et stocké sur votre compte Kodfi. Vous pouvez retirer vos fonds <strong>instantanément vers votre numéro MoMo ou Flooz</strong> dès que vous atteignez 5 000 FCFA.</p>}
            />
            <FAQItem
              question="Quels sont les frais ?"
              answer={<p>Kodfi prélève une commission unique de <strong>10% par vente</strong>. Cela couvre les frais de transaction MoMo, la maintenance du serveur et le support technique. Pas de vente = 0 frais.</p>}
            />
          </div>

          {/* BLOC CONTACT PRÉCIS */}
          <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-gray-200 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Smartphone size={120} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Besoin d'une démo ou d'aide ?</h3>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Notre équipe technique au Bénin vous accompagne gratuitement pour votre première installation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/22966325353" className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition shadow-lg shadow-green-200">
                <Phone size={20} /> WhatsApp Support
              </a>
              <a href="mailto:contact@kodfi.bj" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition shadow-lg">
                <HelpCircle size={20} /> Email Express
              </a>
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