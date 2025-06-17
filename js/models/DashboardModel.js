// DashboardModel.js - Model for dashboard data and statistics

import { loadFromLocalStorage } from './ModelHelpers.js';

export class DashboardModel {
    constructor() {
        this.users = [];
        this.newsletter = [];
        this.destinos = [];
        this.loadData();
    }

    loadData() {
        loadFromLocalStorage('user', this.users);
        loadFromLocalStorage('newsletter', this.newsletter);
        loadFromLocalStorage('destinos', this.destinos);
    }

    // Graph 1: Newsletter subscription ratio
    getNewsletterStats() {
        const registeredSubscribed = this.users.filter(user => 
            user.preferences && user.preferences.newsletter === true
        ).length;

        const unregisteredSubscribed = this.newsletter.filter(sub => 
            !sub.username || sub.username === undefined
        ).length;

        const totalSubscribed = registeredSubscribed + unregisteredSubscribed;
        
        return {
            registered: registeredSubscribed,
            unregistered: unregisteredSubscribed,
            total: totalSubscribed,
            registeredPercentage: totalSubscribed > 0 ? Math.round((registeredSubscribed / totalSubscribed) * 100) : 0,
            unregisteredPercentage: totalSubscribed > 0 ? Math.round((unregisteredSubscribed / totalSubscribed) * 100) : 0
        };
    }

    // Graph 2: Types of reservations made
    getReservationStats() {
        const reservationTypes = {
            'Apenas Voo': 0,
            'Voo + Hotel': 0,
            'Voo + Carro': 0,
            'Voo + Seguro': 0,
            'Pacote Completo': 0
        };

        this.users.forEach(user => {
            if (user.reservas && Array.isArray(user.reservas)) {
                user.reservas.forEach(reserva => {
                    const hasHotel = reserva.hotel && Object.keys(reserva.hotel).length > 0;
                    const hasCar = reserva.car && Object.keys(reserva.car).length > 0;
                    const hasSeguro = reserva.seguro === true;

                    if (hasHotel && hasCar && hasSeguro) {
                        reservationTypes['Pacote Completo']++;
                    } else if (hasHotel && hasCar) {
                        reservationTypes['Voo + Hotel']++; // Assuming hotel is more important
                    } else if (hasHotel && hasSeguro) {
                        reservationTypes['Voo + Hotel']++;
                    } else if (hasCar && hasSeguro) {
                        reservationTypes['Voo + Carro']++;
                    } else if (hasHotel) {
                        reservationTypes['Voo + Hotel']++;
                    } else if (hasCar) {
                        reservationTypes['Voo + Carro']++;
                    } else if (hasSeguro) {
                        reservationTypes['Voo + Seguro']++;
                    } else {
                        reservationTypes['Apenas Voo']++;
                    }
                });
            }
        });

        return reservationTypes;
    }

    // Graph 3: Top 5 most liked destinations
    getTopDestinations() {
        const destinationCount = {};

        // Count favorites from users
        this.users.forEach(user => {
            if (user.favoritos && Array.isArray(user.favoritos)) {
                user.favoritos.forEach(favorito => {
                    const destino = favorito.destino;
                    if (destino) {
                        destinationCount[destino] = (destinationCount[destino] || 0) + 1;
                    }
                });
            }
        });

        // Convert to array and sort by count
        const sortedDestinations = Object.entries(destinationCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([destination, count]) => ({
                destination,
                count
            }));

        return sortedDestinations;
    }

    // Get all dashboard statistics
    getAllStats() {
        return {
            newsletter: this.getNewsletterStats(),
            reservations: this.getReservationStats(),
            topDestinations: this.getTopDestinations()
        };
    }
}
