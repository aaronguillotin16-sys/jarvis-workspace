'use client';

import { useState, useRef, useEffect } from 'react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

/* ─── DATA ───────────────────────────────────────────────────── */
const services = [
  { id: '01', name: 'Coupe simple', priceSurPlace: '15€', priceDeplacement: '20€', duration: '30 min' },
  { id: '02', name: 'Coupe + Barbe', priceSurPlace: '20€', priceDeplacement: '25€', duration: '1h' },
  { id: '03', name: 'Barbe', priceSurPlace: '7€', priceDeplacement: '10€', duration: '20 min' },
  { id: '04', name: 'Contour', priceSurPlace: '7€', priceDeplacement: '10€', duration: '15 min' },
];

const initialReviews = [
  { name: 'Kevin R.', rating: 5, text: "Franchement top. Il se déplace direct à la maison, la coupe était nickel. Bien mieux que d'attendre en salon.", photo: '/photos/IMG_3928.jpeg' },
  { name: 'Maxime D.', rating: 5, text: "Service impeccable. À l'heure, pro, et la coupe vraiment soignée. Le concept de barbier à domicile c'est une vraie bonne idée.", photo: '/photos/IMG_3929.jpeg' },
  { name: 'Samir T.', rating: 5, text: "J'ai pris le dégradé + barbe. Résultat au niveau d'un bon salon, pour moins cher et sans me déplacer. Je reviendrai.", photo: '/photos/IMG_3922.jpeg' },
];

const galleryPhotos = [
  '/photos/F8BB55D5-7870-487C-AE63-2B71F83A1A94.png',
  '/photos/IMG_3934.jpeg',
  '/photos/IMG_3929.jpeg',
  '/photos/IMG_3928.jpeg',
  '/photos/IMG_3922.jpeg',
  '/photos/IMG_3923.jpeg',
];

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const TIME_SLOTS = ['9:00','9:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];
const UNAVAILABLE_SLOTS: string[] = [];

/* ─── BOOKING MODAL ──────────────────────────────────────────── */
function BookingModal({ service, onClose, userId }: { service: (typeof services)[0]; onClose: () => void; userId: string | null }) {
  const today = new Date();
  const [step, setStep] = useState<'deplacement' | 'calendar' | 'info'>('deplacement');
  const [deplacementBarber, setDeplacementBarber] = useState<boolean | null>(null);
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [departement, setDepartement] = useState('');
  const adresseComplete = adresse && ville ? `${adresse}, ${ville}${departement ? ` (${departement})` : ''}` : '';
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [tel, setTel] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const isAvailable = (date: Date) => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < todayStart) return false;
    const diff = (date.getTime() - todayStart.getTime()) / 86400000;
    if (diff > 30) return false;
    return date.getDay() !== 0;
  };

  const isPastSlot = (slot: string) => {
    const [h, m] = slot.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);
    return slotTime <= new Date();
  };

  const formatDate = (d: Date) =>
    `${DAYS[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

  const days = getDaysInMonth(currentMonth);

  if (confirmed && selectedDate && selectedTime) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center md:justify-center" onClick={onClose}>
        <div className="w-full md:max-w-md bg-white md:rounded-2xl rounded-t-2xl p-10 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-black mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>C&apos;est confirmé{nom ? `, ${nom.split(' ')[0]}` : ''} !</h3>
          <p className="text-neutral-500 mb-1 text-sm">{service.name} · {deplacementBarber ? service.priceDeplacement : service.priceSurPlace}</p>
          {deplacementBarber ? (
            <div className="mb-6">
              <p className="text-neutral-500 text-xs">Le barber se déplace chez toi</p>
              <p className="text-neutral-800 text-sm font-medium mt-0.5">{adresseComplete}</p>
            </div>
          ) : (
            <p className="text-neutral-400 text-xs mb-6">Tu te déplaces chez le barber</p>
          )}
          <div className="border-t border-b border-neutral-100 py-4 mb-6">
            <p className="font-semibold text-black">{formatDate(selectedDate)}</p>
            <p className="text-neutral-500 text-sm">à {selectedTime}</p>
          </div>
          <p className="text-xs text-neutral-400 mb-8">Nomad Barber te contactera pour confirmer les détails.</p>
          <button onClick={onClose} className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-medium tracking-wide">Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center md:justify-center" onClick={onClose}>
      <div className="w-full md:max-w-md bg-white md:rounded-2xl rounded-t-2xl overflow-hidden" style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-neutral-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-7 pt-7 pb-6 flex justify-between items-start border-b border-neutral-100">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-black leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{service.name}</h3>
            <p className="text-neutral-400 text-sm">{service.duration}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors mt-0.5 flex-shrink-0">×</button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>

          {/* ÉTAPE 1 : Déplacement */}
          {step === 'deplacement' && (
            <div className="px-7 py-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-5">Étape 1 / 2</p>
              <h4 className="text-2xl font-bold text-black mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                Le barber se déplace ?
              </h4>
              <p className="text-sm text-neutral-400 mb-8 leading-relaxed">Choisis comment tu veux te faire coiffer.</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setDeplacementBarber(true)}
                  className={`w-full px-6 py-5 rounded-2xl border-2 text-left transition-all ${deplacementBarber === true ? 'border-black bg-black text-white' : 'border-neutral-100 bg-neutral-50 text-black outline-none'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-[15px] leading-snug">Oui, le barber vient chez moi</p>
                      <p className={`text-xs leading-relaxed ${deplacementBarber === true ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        Il se déplace · <span className="font-semibold">{service.priceDeplacement}</span>
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${deplacementBarber === true ? 'border-white bg-white' : 'border-neutral-300'}`}>
                      {deplacementBarber === true && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                  </div>
                </button>

                {deplacementBarber === true && (
                  <div className="px-1 flex flex-col gap-2">
                    <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-1 block">
                      Adresse de la prestation
                    </label>
                    <input
                      type="text"
                      placeholder="Numéro et rue"
                      value={adresse}
                      onChange={e => setAdresse(e.target.value)}
                      onKeyDown={e => e.stopPropagation()}
                      className="w-full border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-300 transition-colors bg-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ville"
                        value={ville}
                        onChange={e => setVille(e.target.value)}
                        className="flex-1 border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-300 transition-colors bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Département (ex: 44)"
                        value={departement}
                        onChange={e => setDepartement(e.target.value)}
                        className="w-32 border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3 text-sm text-black placeholder:text-neutral-300 transition-colors bg-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setDeplacementBarber(false)}
                  className={`w-full px-6 py-5 rounded-2xl border-2 text-left transition-all ${deplacementBarber === false ? 'border-black bg-black text-white' : 'border-neutral-100 bg-neutral-50 text-black outline-none'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-[15px] leading-snug">Non, je me déplace</p>
                      <p className={`text-xs leading-relaxed ${deplacementBarber === false ? 'text-neutral-400' : 'text-neutral-400'}`}>
                        Tu viens au barber · <span className="font-semibold">{service.priceSurPlace}</span>
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${deplacementBarber === false ? 'border-white bg-white' : 'border-neutral-300'}`}>
                      {deplacementBarber === false && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                    </div>
                  </div>
                </button>
              </div>

              <button
                disabled={deplacementBarber === null || (deplacementBarber === true && adresse.trim() === '')}
                onClick={() => setStep('calendar')}
                className="w-full mt-8 bg-black text-white py-3.5 rounded-xl text-sm font-medium tracking-wide disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                Continuer →
              </button>
            </div>
          )}

          {/* ÉTAPE 2 : Calendrier */}
          {step === 'calendar' && (
            <>
              <div className="px-6 pt-5">
                <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-5">Étape 2 / 3 · Choisis ta date</p>
                <div className="flex justify-between items-center mb-5">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-black transition-colors text-lg">‹</button>
                  <span className="font-medium text-black text-sm">{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-black transition-colors text-lg">›</button>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => <div key={d} className="text-center text-[11px] font-medium text-neutral-400 py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mb-5">
                  {days.map((date, i) => {
                    if (!date) return <div key={i} />;
                    const avail = isAvailable(date);
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isToday = date.toDateString() === today.toDateString();
                    return (
                      <button key={i} disabled={!avail} onClick={async () => {
                          setSelectedDate(date); setSelectedTime(null);
                          setLoadingSlots(true);
                          const dateStr = `${DAYS[(date.getDay() + 6) % 7]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
                          const { data } = await supabase.from('bookings').select('time').eq('date', dateStr);
                          setBookedSlots(data ? data.map((b: { time: string }) => b.time) : []);
                          setLoadingSlots(false);
                        }}
                        className={`aspect-square rounded-full flex items-center justify-center text-sm transition-all
                          ${isSelected ? 'bg-black text-white font-medium' : ''}
                          ${!isSelected && isToday ? 'text-black font-bold underline underline-offset-2' : ''}
                          ${!isSelected && avail && !isToday ? 'hover:bg-neutral-100 text-black' : ''}
                          ${!avail ? 'text-neutral-300 cursor-not-allowed' : ''}
                        `}
                      >{date.getDate()}</button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="px-6 pb-6">
                  <p className="text-[11px] font-semibold text-neutral-400 tracking-widest uppercase mb-3">{formatDate(selectedDate)}</p>
                  {loadingSlots ? (
                    <p className="text-sm text-neutral-400 text-center py-4">Chargement des créneaux...</p>
                  ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(t => {
                      const unavail = bookedSlots.includes(t) || UNAVAILABLE_SLOTS.includes(t) || (selectedDate?.toDateString() === today.toDateString() && isPastSlot(t));
                      const isSelected = selectedTime === t;
                      return (
                        <button key={t} disabled={unavail} onClick={() => setSelectedTime(t)}
                          className={`py-2.5 rounded-lg text-sm font-medium transition-all border
                            ${isSelected ? 'bg-black text-white border-black' : ''}
                            ${!isSelected && !unavail ? 'bg-white text-black border-neutral-200 hover:border-black' : ''}
                            ${unavail ? 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed line-through' : ''}
                          `}
                        >{t}</button>
                      );
                    })}
                  </div>
                  )}
                </div>
              )}

              {selectedDate && selectedTime && (
                <div className="px-6 pb-8">
                  <button onClick={() => setStep('info')} className="w-full bg-black text-white py-3.5 rounded-xl text-sm font-medium tracking-wide">
                    Continuer →
                  </button>
                </div>
              )}
            </>
          )}

          {/* ÉTAPE 3 : Infos personnelles */}
          {step === 'info' && (
            <div className="px-7 py-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-5">Étape 3 / 3</p>
              <h4 className="text-2xl font-bold text-black mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                Tes informations
              </h4>
              <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
                {selectedDate && selectedTime && `${formatDate(selectedDate)} à ${selectedTime} · `}
                {deplacementBarber ? service.priceDeplacement : service.priceSurPlace}
              </p>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-2 block">Nom *</label>
                  <input
                    type="text"
                    placeholder="Ton prénom et nom"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    onKeyDown={e => e.stopPropagation()}
                    className="w-full border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3.5 text-sm text-black placeholder:text-neutral-300 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-2 block">E-mail *</label>
                  <input
                    type="text"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    className={`w-full border-2 outline-none rounded-xl px-4 py-3.5 text-sm text-black placeholder:text-neutral-300 transition-colors ${emailTouched && !isValidEmail(email) && email ? 'border-red-400 focus:border-red-400' : 'border-neutral-200 focus:border-black'}`}
                  />
                  {emailTouched && !isValidEmail(email) && email && (
                    <p className="text-red-400 text-xs mt-1.5">Adresse email invalide.</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-2 block">Téléphone</label>
                  <div className="flex items-center border-2 border-neutral-200 focus-within:border-black rounded-xl overflow-hidden transition-colors">
                    <span className="px-4 py-3.5 text-sm text-neutral-400 border-r border-neutral-200 bg-neutral-50">🇫🇷 +33</span>
                    <input
                      type="tel"
                      placeholder="6 00 00 00 00"
                      value={tel}
                      onChange={e => setTel(e.target.value)}
                      className="flex-1 px-4 py-3.5 text-sm text-black placeholder:text-neutral-300 outline-none bg-white"
                    />
                  </div>
                </div>

                {deplacementBarber && (
                  <div>
                    <label className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-2 block">Adresse du rendez-vous *</label>
                    <input
                      type="text"
                      placeholder="12 rue des Lilas, Saint-Nazaire"
                      value={adresse}
                      onChange={e => setAdresse(e.target.value)}
                      onKeyDown={e => e.stopPropagation()}
                    className="w-full border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3.5 text-sm text-black placeholder:text-neutral-300 transition-colors"
                    />
                  </div>
                )}
              </div>

              <button
                disabled={!nom.trim() || !email.trim() || !isValidEmail(email) || (deplacementBarber === true && (!adresse.trim() || !ville.trim()))}
                onClick={async () => {
                  if (selectedDate && selectedTime) {
                    const bookingData = {
                      user_id: userId || null,
                      service: service.name,
                      price: deplacementBarber ? service.priceDeplacement : service.priceSurPlace,
                      date: formatDate(selectedDate),
                      time: selectedTime,
                      deplacement: deplacementBarber ?? false,
                      adresse: adresseComplete || null,
                      client_email: email,
                      client_nom: nom,
                    };
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase.from('bookings') as any).insert(bookingData);

                    // Notifier le barber
                    fetch('/api/notify-barber', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        barberEmail: process.env.NEXT_PUBLIC_BARBER_EMAIL || 'email_du_barber_ici',
                        clientNom: nom,
                        clientEmail: email,
                        clientTel: tel || null,
                        service: service.name,
                        price: bookingData.price,
                        date: bookingData.date,
                        time: selectedTime,
                        deplacement: deplacementBarber ?? false,
                        adresse: adresseComplete || null,
                      }),
                    });
                  }
                  setConfirmed(true);
                }}
                className="w-full mt-8 bg-black text-white py-3.5 rounded-xl text-sm font-medium tracking-wide disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                Confirmer le rendez-vous
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── CARD DECK GALLERY ──────────────────────────────────────── */
function CardDeckGallery() {
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef(0);
  const isAnimating = useRef(false);
  const total = galleryPhotos.length;

  const triggerExit = (dir: 'left' | 'right') => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setExiting(dir);
    setDragOffset(0);
    setTimeout(() => {
      setIndex(i => dir === 'left' ? (i + 1) % total : (i - 1 + total) % total);
      setExiting(null);
      isAnimating.current = false;
    }, 350);
  };

  const onDragStart = (x: number) => {
    if (isAnimating.current) return;
    isDragging.current = true;
    dragStart.current = x;
  };

  const onDragMove = (x: number) => {
    if (!isDragging.current || isAnimating.current) return;
    setDragOffset(x - dragStart.current);
  };

  const onDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragOffset < -80) triggerExit('left');
    else if (dragOffset > 80) triggerExit('right');
    else setDragOffset(0);
  };

  const getCard = (offset: number) => galleryPhotos[(index + offset) % total];

  const topTransform = () => {
    if (exiting === 'left') return `translateX(-130%) rotate(-18deg)`;
    if (exiting === 'right') return `translateX(130%) rotate(18deg)`;
    return `translateX(${dragOffset}px) rotate(${dragOffset * 0.035}deg)`;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative select-none" style={{ width: 300, height: 420 }}>

        {/* Carte 3 */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-md"
          style={{ transform: 'scale(0.88) translateY(18px) rotate(-5deg)', zIndex: 1, transition: 'transform 0.35s ease' }}>
          <Image src={getCard(2)} alt="Photo" width={600} height={840}
            className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} draggable={false} />
          <div className="absolute inset-0 bg-white/25" />
        </div>

        {/* Carte 2 */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl"
          style={{ transform: 'scale(0.94) translateY(9px) rotate(3deg)', zIndex: 2, transition: 'transform 0.35s ease' }}>
          <Image src={getCard(1)} alt="Photo" width={600} height={840}
            className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} draggable={false} />
          <div className="absolute inset-0 bg-white/10" />
        </div>

        {/* Carte 1 (top) */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
          style={{
            transform: topTransform(),
            zIndex: 3,
            transition: isDragging.current ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
          onMouseDown={e => onDragStart(e.clientX)}
          onMouseMove={e => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={() => { if (isDragging.current) onDragEnd(); }}
          onTouchStart={e => onDragStart(e.touches[0].clientX)}
          onTouchMove={e => { e.preventDefault(); onDragMove(e.touches[0].clientX); }}
          onTouchEnd={onDragEnd}
        >
          <Image src={getCard(0)} alt="Photo" width={600} height={840}
            className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: 'center 30%' }} draggable={false} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          {galleryPhotos.map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${i === index ? 'w-4 h-1.5 bg-black' : 'w-1.5 h-1.5 bg-neutral-300'}`} />
          ))}
        </div>
        <p className="text-xs text-neutral-400">Glisse pour voir la suite</p>
      </div>
    </div>
  );
}

/* ─── SECTIONS COMMUNES ──────────────────────────────────────── */
function Sections({ onBook }: { onBook: (s: (typeof services)[0]) => void }) {
  type Review = { name: string; rating: number; text: string; photo: string };
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const avgStr = avgRating.toFixed(2);
  const [intPart, decPart] = avgStr.split('.');

  const submitReview = () => {
    if (!newName.trim() || !newText.trim()) return;
    setReviews(prev => [...prev, { name: newName, rating: newRating, text: newText, photo: '' }]);
    setNewName(''); setNewText(''); setNewRating(5);
    setShowForm(false);
  };

  return (
    <>
      {/* TARIFS */}
      <section id="tarifs" className="w-full bg-white py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-3">Prestations</p>
            <h2 className="text-5xl md:text-6xl font-bold text-black leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              Nos tarifs.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(s => (
              <button
                key={s.id}
                onClick={() => onBook(s)}
                className="group w-full text-left border border-neutral-200 rounded-2xl p-7 hover:border-black hover:shadow-lg transition-all duration-200 bg-white"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">{s.duration}</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-black block" style={{ fontFamily: 'var(--font-playfair)' }}>{s.priceSurPlace}</span>
                    <span className="text-xs text-neutral-400">/ {s.priceDeplacement} déplacement</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-black mb-6 leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{s.name}</h3>
                <div className="flex items-center justify-between pt-5 border-t border-neutral-100">
                  <span className="text-xs text-neutral-400">Réserver ce soin</span>
                  <span className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-black flex items-center justify-center transition-colors">
                    <svg className="text-black group-hover:text-white transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-400 mt-6">Prix indicatifs, à confirmer avec le barber.</p>
        </div>
      </section>

      {/* GALERIE */}
      <section id="galerie" className="w-full bg-neutral-50 py-24">
        <div className="max-w-2xl mx-auto px-6 mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-3">Galerie</p>
          <h2 className="text-5xl md:text-6xl font-bold text-black leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Mes réalisations.
          </h2>
        </div>
        <div className="flex flex-col items-center px-6">
          <CardDeckGallery />
          <a href="https://www.tiktok.com/@nomadbarber44" target="_blank" rel="noopener noreferrer"
            className="text-[13px] font-medium text-black underline underline-offset-4 mt-4">
            Voir plus sur TikTok →
          </a>
        </div>
      </section>

      {/* AVIS */}
      <section id="avis" className="w-full bg-white py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400 mb-3">Avis clients</p>
              <h2 className="text-5xl md:text-6xl font-bold text-black leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                Ce qu&apos;ils disent.
              </h2>
            </div>
            {/* Note + bouton avis */}
            <div className="flex flex-col items-end gap-3 pb-1">
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-xs font-semibold tracking-wide text-black border border-black rounded-full px-4 py-1.5 hover:bg-black hover:text-white transition-all"
                >
                  + Laisser un avis
                </button>
              )}
              <div className="flex items-end gap-1.5">
                <span className="text-5xl font-bold text-black leading-none" style={{ fontFamily: 'var(--font-playfair)' }}>{intPart}</span>
                <span className="text-xl font-semibold text-neutral-400 leading-none mb-1">.{decPart}</span>
                <span className="text-2xl text-yellow-400 leading-none mb-0.5">★</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {reviews.map((r, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center">
                  {r.photo ? (
                    <Image src={r.photo} alt={r.name} width={44} height={44} className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} />
                  ) : (
                    <span className="text-sm font-bold text-neutral-400">{r.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 border-b border-neutral-100 pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] font-semibold text-black">{r.name}</span>
                    <span className="text-[12px] text-yellow-400 tracking-wider">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-[14px] text-neutral-500 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire ajout avis */}
          {showForm && (
            <div className="mt-10 border-2 border-neutral-100 rounded-2xl p-6 flex flex-col gap-4">
              <h4 className="font-bold text-black text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>Ton avis</h4>
              <input type="text" placeholder="Ton prénom" value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3 text-sm placeholder:text-neutral-300 transition-colors" />
              {/* Étoiles interactives */}
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewRating(star)}
                    className="text-2xl transition-transform hover:scale-110"
                    style={{ color: star <= (hoverRating || newRating) ? '#facc15' : '#e5e7eb' }}
                  >★</button>
                ))}
              </div>
              <textarea placeholder="Ton commentaire..." value={newText} onChange={e => setNewText(e.target.value)}
                rows={3}
                className="w-full border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3 text-sm placeholder:text-neutral-300 transition-colors resize-none" />
              <div className="flex gap-3">
                <button onClick={submitReview} disabled={!newName.trim() || !newText.trim()}
                  className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-medium disabled:opacity-30 transition-opacity">
                  Publier
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-5 py-3 border-2 border-neutral-200 rounded-xl text-sm font-medium text-neutral-500 hover:border-neutral-400 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-black py-12 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-white text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>Nomad Barber</span>
          <div className="flex gap-6">
            <a href="https://www.instagram.com/nomadbarber44" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors text-sm">Instagram</a>
            <a href="https://www.tiktok.com/@nomadbarber44" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors text-sm">TikTok</a>
            <a href="https://www.snapchat.com/add/nomadbarber44" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors text-sm">Snapchat</a>
          </div>
          <p className="text-neutral-600 text-xs">© 2025 Nomad Barber · Loire-Atlantique</p>
        </div>
      </footer>
    </>
  );
}

/* ─── ACCOUNT MODAL ──────────────────────────────────────────── */
function translateError(msg: string): string {
  if (msg.includes('after 3 seconds')) return 'Attends 3 secondes avant de réessayer.';
  if (msg.includes('already registered')) return 'Cet email est déjà utilisé.';
  if (msg.includes('Invalid login')) return 'Email ou mot de passe incorrect.';
  if (msg.includes('Email not confirmed')) return 'Confirme ton email avant de te connecter.';
  if (msg.includes('Password should be')) return 'Le mot de passe doit faire au moins 6 caractères.';
  if (msg.includes('rate limit')) return 'Trop de tentatives, réessaie dans quelques minutes.';
  return 'Une erreur est survenue, réessaie.';
}
type Booking = { id: string; service: string; price: string; date: string; time: string; deplacement: boolean; adresse?: string; created_at: string };

function AccountModal({ onClose, user, onUserChange }: { onClose: () => void; user: User | null; onUserChange: (u: User | null) => void }) {
  const [tab, setTab] = useState<'signup' | 'login'>('signup');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [view, setView] = useState<'form' | 'profile'>('form');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (user) {
      setView('profile');
      supabase.from('bookings').select('*').order('created_at', { ascending: false }).then(({ data }) => {
        if (data) setBookings(data as Booking[]);
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    if (tab === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { prenom } },
      });
      if (err) { setError(translateError(err.message)); setLoading(false); return; }
      if (data.user) { onUserChange(data.user); setView('profile'); }
    } else {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError('Email ou mot de passe incorrect.'); setLoading(false); return; }
      if (data.user) { onUserChange(data.user); setView('profile'); }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onUserChange(null);
    onClose();
  };

  const userPrenom = user?.user_metadata?.prenom || user?.email?.split('@')[0] || 'toi';

  if (view === 'profile' && user) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
        <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="px-7 pt-7 pb-6 border-b border-neutral-100 flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-black" style={{ fontFamily: 'var(--font-playfair)' }}>Bonjour, {userPrenom} !</h3>
              <p className="text-neutral-400 text-sm mt-1">{user.email}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors">×</button>
          </div>

          <div className="px-7 py-6 max-h-80 overflow-y-auto">
            <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">Mes rendez-vous</p>
            {bookings.length === 0 ? (
              <p className="text-sm text-neutral-400">Aucun RDV pour l&apos;instant.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {bookings.map(b => (
                  <div key={b.id} className="border border-neutral-100 rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-black">{b.service}</span>
                      <span className="text-sm font-bold text-black">{b.price}</span>
                    </div>
                    <p className="text-xs text-neutral-400">{b.date} à {b.time}</p>
                    {b.deplacement && b.adresse && <p className="text-xs text-neutral-400 mt-0.5">📍 {b.adresse}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-7 pb-7">
            <button onClick={handleLogout} className="w-full border-2 border-neutral-200 text-neutral-600 py-3 rounded-xl text-sm font-medium hover:border-black hover:text-black transition-colors">
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-7 pt-7 pb-6 border-b border-neutral-100 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-black" style={{ fontFamily: 'var(--font-playfair)' }}>
              {tab === 'signup' ? 'Créer un compte' : 'Se connecter'}
            </h3>
            <p className="text-neutral-400 text-sm mt-1.5">Nomad Barber</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors">×</button>
        </div>

        <div className="mx-7 mt-6 bg-neutral-100 rounded-2xl p-1 relative flex">
          <div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm"
            style={{ transform: tab === 'signup' ? 'translateX(0)' : 'translateX(calc(100% + 8px))', transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
          <button onClick={() => { setTab('signup'); setError(''); }}
            className="relative flex-1 py-2.5 rounded-xl text-sm font-medium z-10 transition-colors duration-300"
            style={{ color: tab === 'signup' ? '#000' : '#a3a3a3' }}>Créer un compte</button>
          <button onClick={() => { setTab('login'); setError(''); }}
            className="relative flex-1 py-2.5 rounded-xl text-sm font-medium z-10 transition-colors duration-300"
            style={{ color: tab === 'login' ? '#000' : '#a3a3a3' }}>Se connecter</button>
        </div>

        <div className="px-7 py-6 flex flex-col gap-4 overflow-hidden">
          <div style={{ maxHeight: tab === 'signup' ? '90px' : '0px', opacity: tab === 'signup' ? 1 : 0, transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease', overflow: 'hidden' }}>
            <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-2 block">Prénom *</label>
            <input type="text" placeholder="Ton prénom" value={prenom} onChange={e => setPrenom(e.target.value)}
              className="w-full border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3.5 text-sm placeholder:text-neutral-300 transition-colors" />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-2 block">E-mail *</label>
            <input type="text" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
              onBlur={() => {
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                if (!isValid && email) setError('Adresse email invalide.');
                else setError('');
              }}
              className="w-full border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3.5 text-sm placeholder:text-neutral-300 transition-colors" />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-2 block">Mot de passe *</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border-2 border-neutral-200 focus:border-black outline-none rounded-xl px-4 py-3.5 text-sm placeholder:text-neutral-300 transition-colors" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button onClick={handleSubmit} disabled={loading || (tab === 'signup' ? (!prenom.trim() || !email.trim() || !password.trim()) : (!email.trim() || !password.trim()))}
            className="w-full mt-2 bg-black text-white py-3.5 rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-opacity">
            {loading ? '...' : tab === 'signup' ? 'Créer mon compte' : 'Me connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────── */
export default function Home() {
  const [activeService, setActiveService] = useState<(typeof services)[0] | null>(null);
  const [showAccount, setShowAccount] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const userPrenom = user?.user_metadata?.prenom || user?.email?.split('@')[0] || '';

  return (
    <main className="bg-white">
      {activeService && (
        <BookingModal service={activeService} onClose={() => setActiveService(null)} userId={user?.id ?? null} />
      )}
      {showAccount && (
        <AccountModal onClose={() => setShowAccount(false)} user={user} onUserChange={setUser} />
      )}

      {/* Bouton compte fixe */}
      <button
        onClick={() => setShowAccount(true)}
        className="fixed top-5 right-5 z-40 h-12 bg-white rounded-full shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform border border-neutral-100 px-4"
        aria-label="Mon compte"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        {userPrenom && <span className="text-sm font-medium text-black">{userPrenom}</span>}
      </button>

      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/photos/F8BB55D5-7870-487C-AE63-2B71F83A1A94.png"
        bgImageSrc="/photos/F8BB55D5-7870-487C-AE63-2B71F83A1A94.png"
        title="NOMAD BARBER"
        textBlend={false}
      >
        <Sections onBook={setActiveService} />
      </ScrollExpandMedia>
    </main>
  );
}
