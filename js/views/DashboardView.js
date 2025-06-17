// DashboardView.js - Dashboard admin view management

import { openModal, closeModal } from './ViewHelpers.js';

export class DashboardView {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tourism management button
        const turismoBtn = document.getElementById('turismo-btn');
        if (turismoBtn) {
            turismoBtn.addEventListener('click', () => {
                openModal('modal-adicionar');
            });
        }

        // Add tourism button
        const addTurismBtn = document.getElementById('add-turism-btn');
        if (addTurismBtn) {
            addTurismBtn.addEventListener('click', () => {
                this.createTurismAcess('add_turism_acess');
            });
        }

        // Cancel button
        const cancelTurismBtn = document.getElementById('cancel-turism-btn');
        if (cancelTurismBtn) {
            cancelTurismBtn.addEventListener('click', () => {
                closeModal('modal-adicionar', 'add_turism_acess', 'Turismo');
            });
        }
    }

    createTurismAcess(formId) {
        // This function will be implemented according to your Model structure
        // For now, we'll just log the action
        console.log('Creating tourism/accessibility option from form:', formId);
        
        const form = document.getElementById(formId);
        if (form) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            console.log('Form data:', data);
            
            // Here you would typically call your Model to save the data
            // Example: TurismModel.create(data);
            
            // Close modal after successful creation
            closeModal('modal-adicionar', formId, 'Turismo');
        }
    }
}

// Initialize the view when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.querySelector('#turismo-btn')) {
        new DashboardView();
    }
});
