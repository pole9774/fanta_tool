# Fanta Tool

## Run the application
- server: npm run dev
- client: npm run dev

## Overview
Applicazione per gestire le proprie aste del fantacalcio. L'utente può creare diverse aste, sia classic che mantra; per ogni asta può creare la sua lista di giocatori acquistabili divisi per ruolo, ordinarli per appetibilità, aggiungere note, e assegnarli al fantallenatore che li acquista; infine, l'utente può visualizzare gli acquisti di ogni fantallenatore, vedendone i crediti spesi e rimasti, e il numero di giocatori acquistabili per ruolo.

L'applicazione è realizzata con Node.js, adottando un'architettura client-server. Il server è realizzato con Express e Cors, mentre il client con Vite e React.

### Come funziona il Fantacalcio
Il Fantacalcio è un gioco in cui più persone (fantallenatori) usano dei crediti virtuali per acquistare in un'asta giocatori del campionato di calcio italiano Serie A. In ogni giornata i fantallenatori schierano una formazione, ricavata dai giocatori acquistati all'asta schierati in un modulo, in una partita contro un altro fantallenatore. Ogni giocatore riceve un punteggio ricavato dalla somma di un voto e dei bonus/malus ricevuti in base ad alcuni fattori (gol, assist, ammonizioni, ecc...) e il fantallenatore i cui giocatori hanno fatto più punti vince la partita.

I giocatori acquistabili sono divisi in ruoli. Esistono 2 tipi di Fantacalcio: **classic** e **mantra**.

- **classic**: nel tipo classic ciascun giocatore ha un solo ruolo. I ruoli sono P (portieri), D (difensori), C (centrocampisti), e A (attaccanti). Ogni fantallenatore dovrà acquistare un numero preciso di giocatori per ciascun ruolo (questo numero è variabile, ma solitamente sono 3 P, 8 D, 8 C e 6 A).

- **mantra**: nel tipo mantra ciascun giocatore può avere da 1 a 3 ruoli. I ruoli sono P (portiere), Dc (difensore centrale), Ds (difensore sx), Dd (difensore dx), E (esterno), M (mediano), C (centrocampista), T (trequartista), W (ala), A (attaccante) e Pc (punta centrale). Ogni fantallenatore ha un numero minimo e massimo di portieri e di giocatori di movimento acquistabili (solitamente da 2 a 4 portieri, e da 22 a 26 giocatori di movimento).

Nel Fantacalcio di fa un'asta iniziale in cui si costruisce l'intera rosa di giocatori, e poi si fanno un certo numero di aste di riparazione intermedie, con un numero limitato di giocatori acquistabili.
