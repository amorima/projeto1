// init.js – ponto de entrada
import StorageModel from './models/StorageModel.js';
import FlightView from './views/FlightView.js';
import DestinationView from './views/DestinationView.js';
import CarView from './views/CarView.js';
import ActivityView from './views/ActivityView.js';
import HotelView from './views/HotelView.js';
import UserView from './views/UserView.js';
import RoomView from './views/RoomView.js';
import AirportView from './views/AirportView.js';


window.addEventListener('DOMContentLoaded', async () => {
  await StorageModel.loadInitialData();
  const path = window.location.pathname;
  if (path.includes('flights_admin.html')) FlightView.init();
  if (path.includes('places_admin.html')) DestinationView.init();
  if (path.includes('cars_admin.html')) CarView.init();
  if (path.includes('activity_admin.html')) ActivityView.init();
  if (path.includes('hotel_admin.html')) HotelView.init();
  if (path.includes('users_admin.html')) UserView.init();
  if (path.includes('room_admin.html')) RoomView.init();
  if (path.includes('airport_admin.html')) AirportView.init();
});
