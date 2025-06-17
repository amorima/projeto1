// ActivityModel.js - Model for managing activities

import { loadFromLocalStorage, saveToLocalStorage, getNextId } from './ModelHelpers.js';

const activities = [];
const STORAGE_KEY = 'atividades';

// Load activities from localStorage on module initialization
loadFromLocalStorage(STORAGE_KEY, activities);

export const ActivityModel = {
    // Get all activities
    getAll() {
        loadFromLocalStorage(STORAGE_KEY, activities);
        return [...activities];
    },

    // Get activity by ID
    getById(id) {
        loadFromLocalStorage(STORAGE_KEY, activities);
        return activities.find(activity => activity.id === parseInt(id));
    },

    // Search activities
    search(searchTerm) {
        loadFromLocalStorage(STORAGE_KEY, activities);
        if (!searchTerm || searchTerm.trim() === '') {
            return [...activities];
        }
        
        const term = searchTerm.toLowerCase().trim();
        return activities.filter(activity => 
            activity.nome.toLowerCase().includes(term) ||
            activity.descricao.toLowerCase().includes(term) ||
            activity.tipoTurismo.toLowerCase().includes(term) ||
            (activity.acessibilidade && activity.acessibilidade.some(acc => 
                acc.toLowerCase().includes(term)
            ))
        );
    },

    // Sort activities
    sort(activitiesList, field, ascending = true) {
        const sorted = [...activitiesList].sort((a, b) => {
            let aVal = '';
            let bVal = '';

            switch (field) {
                case 'act_name':
                    aVal = a.nome || '';
                    bVal = b.nome || '';
                    break;
                case 'act_turism':
                    aVal = a.tipoTurismo || '';
                    bVal = b.tipoTurismo || '';
                    break;
                case 'act_description':
                    aVal = a.descricao || '';
                    bVal = b.descricao || '';
                    break;
                case 'act_destinoId':
                    aVal = a.destinoId || 0;
                    bVal = b.destinoId || 0;
                    break;
                case 'act_acess':
                    aVal = Array.isArray(a.acessibilidade) ? a.acessibilidade.join(', ') : '';
                    bVal = Array.isArray(b.acessibilidade) ? b.acessibilidade.join(', ') : '';
                    break;
                default:
                    aVal = a.nome || '';
                    bVal = b.nome || '';
            }

            if (typeof aVal === 'string') {
                return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                return ascending ? aVal - bVal : bVal - aVal;
            }
        });

        return sorted;
    },

    // Add new activity
    add(activityData) {
        try {
            // Validate required fields
            if (!activityData.nome || !activityData.destinoId || !activityData.tipoTurismo) {
                throw new Error('Nome, destino e tipo de turismo são obrigatórios');
            }

            loadFromLocalStorage(STORAGE_KEY, activities);

            // Check if activity already exists
            const existing = activities.find(activity => 
                activity.nome.toLowerCase() === activityData.nome.toLowerCase() &&
                activity.destinoId === parseInt(activityData.destinoId)
            );

            if (existing) {
                throw new Error('Esta atividade já existe para este destino');
            }

            // Create new activity
            const newActivity = {
                id: getNextId(activities),
                destinoId: parseInt(activityData.destinoId),
                tipoTurismo: activityData.tipoTurismo.trim(),
                nome: activityData.nome.trim(),
                foto: activityData.foto || `https://placehold.co/600x400/A0522D/FFFFFF?text=${encodeURIComponent(activityData.nome)}`,
                descricao: activityData.descricao ? activityData.descricao.trim() : '',
                acessibilidade: Array.isArray(activityData.acessibilidade) ? activityData.acessibilidade : [activityData.acessibilidade || 'Não especificado']
            };

            activities.push(newActivity);
            saveToLocalStorage(STORAGE_KEY, activities);

            return { success: true, data: newActivity };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Update activity
    update(id, activityData) {
        try {
            loadFromLocalStorage(STORAGE_KEY, activities);
            
            const index = activities.findIndex(activity => activity.id === parseInt(id));
            if (index === -1) {
                throw new Error('Atividade não encontrada');
            }

            // Validate required fields
            if (!activityData.nome || !activityData.destinoId || !activityData.tipoTurismo) {
                throw new Error('Nome, destino e tipo de turismo são obrigatórios');
            }

            // Check if updated name conflicts with another activity (excluding current one)
            const existing = activities.find(activity => 
                activity.id !== parseInt(id) &&
                activity.nome.toLowerCase() === activityData.nome.toLowerCase() &&
                activity.destinoId === parseInt(activityData.destinoId)
            );

            if (existing) {
                throw new Error('Esta atividade já existe para este destino');
            }

            // Update activity
            activities[index] = {
                ...activities[index],
                destinoId: parseInt(activityData.destinoId),
                tipoTurismo: activityData.tipoTurismo.trim(),
                nome: activityData.nome.trim(),
                foto: activityData.foto || activities[index].foto,
                descricao: activityData.descricao ? activityData.descricao.trim() : '',
                acessibilidade: Array.isArray(activityData.acessibilidade) ? activityData.acessibilidade : [activityData.acessibilidade || 'Não especificado']
            };

            saveToLocalStorage(STORAGE_KEY, activities);

            return { success: true, data: activities[index] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Delete activity
    delete(id) {
        try {
            loadFromLocalStorage(STORAGE_KEY, activities);
            
            const index = activities.findIndex(activity => activity.id === parseInt(id));
            if (index === -1) {
                throw new Error('Atividade não encontrada');
            }

            const deletedActivity = activities[index];
            activities.splice(index, 1);
            saveToLocalStorage(STORAGE_KEY, activities);

            return { success: true, data: deletedActivity };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Get destination name by ID
    getDestinationName(destinoId) {
        try {
            const destinos = JSON.parse(localStorage.getItem('destinos') || '[]');
            const destino = destinos.find(d => d.id === parseInt(destinoId));
            return destino ? `${destino.cidade}, ${destino.pais}` : 'Destino não encontrado';
        } catch {
            return 'Destino não encontrado';
        }
    },

    // Get first activities for dashboard
    getFirst(quantidade = 5) {
        loadFromLocalStorage(STORAGE_KEY, activities);
        return activities.slice(0, quantidade);
    }
};

