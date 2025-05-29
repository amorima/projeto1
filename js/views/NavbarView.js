import * as User from '../models/UserModel.js'
import {
  showCookieBanner,
  getFormData,
  showToast,
  closeModal,
  selectOptions,
  updateTable,
  getUserLocation,
  closestAirport,
  openModal,
} from "./ViewHelpers.js";
// Função para carregar HTML de um ficheiro para um elemento
const loadComponent = async (url, placeholderId) => {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Placeholder element with ID "${placeholderId}" not found.`);
        return;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const html = await response.text();
        placeholder.innerHTML = html;
        console.log(`Component ${url} loaded into #${placeholderId}`);

    } catch (error) {
        console.error(`Error loading component ${url}:`, error);
        placeholder.innerHTML = `<p class="text-red-500">Error loading component.</p>`;
    }
};

// Carregar os componentes quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('_header.html', 'header-placeholder').then(()=>{
        LogIn();
    });
    loadComponent('_footer.html', 'footer-placeholder');
    loadComponent('_menu.html', 'menu-placeholder');
});

function LogIn () {
    document.getElementById('profile').addEventListener('click', ()=>{
        console.log("clicked")
        if(User.isLogged()){
            //go to profile
            window.location.href = 'profile.html'; 
        }else{
            openModal('profile-modal')
            document.getElementById('').addEventListener('submit', (e)=>{ //TODO: When modal Ready add o id do form
                e.preventDefault()
                data = getFormData('') //TODO: When modal Ready add o id do form
                username = data.username
                email = data.email
                password = data.password
                User.add(username, password, email)
                User.login(username, password)
                closeModal('')//id modal
                openModal('newletter-modal')
                document.getElementById('').addEventListener('click', () => {//add yes button id
                    //sign for newletter
                    closeModal('newsletter-modal')
                })
                document.getElementById('').addEventListener('click', () => {//add no button id
                    closeModal('newsletter-modal')
                })
            })
        }
    })
}

try {
const theme = localStorage.getItem("theme");
if (theme === "dark") {
    document.documentElement.classList.add("dark");
}
} catch (e) {}