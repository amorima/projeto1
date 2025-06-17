// DashboardView.js - Dashboard with statistics and charts

import { loadFromLocalStorage } from '../models/ModelHelpers.js';

// Data storage
let users = [];
let newsletter = [];
let destinos = [];

// Load data from localStorage
function loadData() {
    loadFromLocalStorage('user', users);
    loadFromLocalStorage('newsletter', newsletter);
    loadFromLocalStorage('destinos', destinos);
}

// Graph 1: Newsletter subscription ratio
function getNewsletterStats() {
    const registeredSubscribed = users.filter(user => 
        user.preferences && user.preferences.newsletter === true
    ).length;

    const unregisteredSubscribed = newsletter.filter(sub => 
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
function getReservationStats() {
    const reservationTypes = {
        'Apenas Voo': 0,
        'Voo + Hotel': 0,
        'Voo + Carro': 0,
        'Voo + Seguro': 0,
        'Pacote Completo': 0
    };

    users.forEach(user => {
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
function getTopDestinations() {
    const destinationCount = {};

    // Count favorites from users
    users.forEach(user => {
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
function getAllStats() {
    return {
        newsletter: getNewsletterStats(),
        reservations: getReservationStats(),
        topDestinations: getTopDestinations()
    };
}// Chart 1: Newsletter Subscription Gauge
function renderNewsletterGauge(data) {
    const containers = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.gap-6 .w-full.h-96');
    console.log('Newsletter: Trying container index 0');
    const container = containers[0]; // Try first container (index 0)
    if (!container) {
        console.error('Newsletter container not found');
        return;
    }
    console.log('Newsletter: Using container', container);

    const percentage = data.registeredPercentage;
    const strokeDasharray = 2 * Math.PI * 45; // Circle circumference
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
            <h3 class="text-lg font-semibold text-Text-Titles dark:text-gray-100 mb-4">Subscrições Newsletter</h3>
            <div class="relative w-32 h-32">
                <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <!-- Background circle -->
                    <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="10" 
                            fill="transparent" class="text-gray-200 dark:text-gray-700"></circle>
                    <!-- Progress circle -->
                    <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="10" 
                            fill="transparent" stroke-linecap="round"
                            stroke-dasharray="${strokeDasharray}"
                            stroke-dashoffset="${strokeDashoffset}"
                            class="text-Button-Main dark:text-cyan-400 transition-all duration-1000 ease-out"></circle>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-2xl font-bold text-Text-Titles dark:text-gray-100">${percentage}%</span>
                </div>
            </div>
            <div class="mt-4 text-center">
                <div class="text-sm text-Text-Subtitles dark:text-gray-300">
                    <div class="flex items-center justify-center gap-2 mb-1">
                        <div class="w-3 h-3 bg-Button-Main dark:bg-cyan-400 rounded-full"></div>
                        <span>Registados: ${data.registered}</span>
                    </div>
                    <div class="flex items-center justify-center gap-2">
                        <div class="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <span>Não registados: ${data.unregistered}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Chart 2: Reservation Types Bar Chart
function renderReservationsChart(data) {
    const containers = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.gap-6 .w-full.h-96');
    console.log('Reservations: Trying container index 1');
    const container = containers[1]; // Try second container (index 1)
    if (!container) {
        console.error('Reservations container not found');
        return;
    }
    console.log('Reservations: Using container', container);

    const maxValue = Math.max(...Object.values(data));
    const colors = [
        'bg-blue-500 dark:bg-blue-400',
        'bg-green-500 dark:bg-green-400', 
        'bg-yellow-500 dark:bg-yellow-400',
        'bg-purple-500 dark:bg-purple-400',
        'bg-red-500 dark:bg-red-400'
    ];

    const bars = Object.entries(data).map(([type, count], index) => {
        const height = maxValue > 0 ? (count / maxValue) * 100 : 0;
        return `
            <div class="flex flex-col items-center">
                <div class="relative h-32 w-8 bg-gray-200 dark:bg-gray-700 rounded-t flex items-end">
                    <div class="${colors[index]} rounded-t transition-all duration-1000 ease-out w-full" 
                         style="height: ${height}%"></div>
                </div>
                <div class="mt-2 text-xs text-center text-Text-Subtitles dark:text-gray-300 max-w-16">
                    <div class="font-semibold">${count}</div>
                    <div class="text-[10px] leading-tight">${type}</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
            <h3 class="text-lg font-semibold text-Text-Titles dark:text-gray-100 mb-4">Tipos de Reservas</h3>
            <div class="flex items-end justify-center gap-3 h-48">
                ${bars}
            </div>
        </div>
    `;
}

// Chart 3: Top Destinations Horizontal Bar Chart
function renderTopDestinationsChart(data) {
    const containers = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.gap-6 .w-full.h-96');
    console.log('Destinations: Trying container index 2');
    const container = containers[2]; // Try third container (index 2)
    if (!container) {
        console.error('Destinations container not found');
        console.log('Available containers:', containers.length);
        return;
    }
    console.log('Destinations: Using container', container);

    if (data.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full">
                <h3 class="text-lg font-semibold text-Text-Titles dark:text-gray-100 mb-4">Top 5 Destinos Favoritos</h3>
                <div class="text-Text-Subtitles dark:text-gray-300">Nenhum destino favoritado ainda</div>
            </div>
        `;
        return;
    }

    const maxValue = Math.max(...data.map(d => d.count));
    const colors = [
        'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500',
        'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500',
        'bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500',
        'bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500',
        'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500'
    ];

    const bars = data.map((item, index) => {
        const width = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
        return `
            <div class="flex items-center gap-3 mb-3">
                <div class="w-20 text-right text-sm text-Text-Titles dark:text-gray-100 font-medium truncate">
                    ${item.destination}
                </div>
                <div class="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div class="${colors[index]} h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2" 
                         style="width: ${width}%">
                        <span class="text-white text-xs font-semibold">${item.count}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col justify-center h-full px-2">
            <h3 class="text-lg font-semibold text-Text-Titles dark:text-gray-100 mb-6 text-center">Top 5 Destinos Favoritos</h3>
            <div class="space-y-1">
                ${bars}
            </div>
        </div>
    `;
}

// Render all charts
function renderCharts() {
    const stats = getAllStats();
    
    // Debug: Log all containers
    const containers = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.gap-6 .w-full.h-96');
    console.log('Total containers found:', containers.length);
    containers.forEach((container, index) => {
        console.log(`Container ${index}:`, container);
        console.log(`Container ${index} classes:`, container.className);
    });
    
    // Render all three charts
    renderNewsletterGauge(stats.newsletter);
    renderReservationsChart(stats.reservations);
    renderTopDestinationsChart(stats.topDestinations);
}

// Initialize dashboard
function initDashboard() {
    loadData();
    renderCharts();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});