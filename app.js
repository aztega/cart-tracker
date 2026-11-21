//create carts as objects (one per cart) to store information about carts and their status (database)
const defaultCarts = [
  { id: 1, 
    status: "use", 
    owner: "Kevlvine", 
    location: "Floor 9" },
  {
    id: 2,
    status: "spare",
    owner: "Joseph",
    location: "Floor 17",
  },
  { id: 3, 
    status: "vacant", 
    owner: "Junior", 
    location: "Floor 16" },

    { id: 4, 
    status: "vacant", 
    owner: "", 
    location: "Floor 16" },

     { id: 5, 
    status: "use", 
    owner: "Ella", 
    location: "Floor 16" },

     { id: 6, 
    status: "vacant", 
    owner: "", 
    location: "Floor 16" },
];

function loadCarts(){
    const saved = localStorage.getItem('carts');
    if(saved){
        return JSON.parse(saved);
    } return defaultCarts;
}

function saveCarts(){
    localStorage.setItem('carts', JSON.stringify(carts));
}
const carts = loadCarts();

let currentLocation = "";

const searchInput = document.getElementById('searchInput');
const locationSelect = document.getElementById('locationSelect');

let currentFilter = 'all';
let editingCart = null;

//get the element(whole) by its id and store it in a variable grid
const grid = document.getElementById('grid');
const filters = document.getElementById('filters');
const editor = document.getElementById('editor');


//loops through the list and builds one HTML block per cart
function render(){
    renderSummary();
    renderLocations();

    const text = searchInput.value.toLowerCase().trim();

    const shown = carts.filter(function(cart){
        const matchesStatus = currentFilter === "all"|| cartstatus === currentFilter;
        const matchesLocation = !currentLocation || cart.location === currentLocation;
        const matchesText = !text ||
        (cart.id + " " + cart.owner + " " + cart.location).toLowerCase().includes(text);
        return matchesStatus && matchesLocation && matchesText;
        // return currentFilter === 'all' || cart.status === currentFilter;
    });

    grid.innerHTML = shown.length ? "" : `<p class="empty">No carts match.</p>`;
    for (const cart of shown){
        grid.innerHTML += `
        <div class="tile ${cart.status}" data-id="${cart.id}">
        <b>Cart Number: ${cart.id}</b>
        <p>Status: ${cart.status}</p>
        <p>${cart.owner} Floor Number: ${cart.location}</p>
        </div>`;
    }
}

function openEditor(cart){
    editingCart = cart;
    document.getElementById('editorTitle').textContent = `Cart # ${cart.id}`;
    document.getElementById('statusInput').value = cart.status;
    document.getElementById('ownerInput').value = cart.owner;
    document.getElementById('locationInput').value = cart.location;
    editor.showModal();
}

filters.addEventListener("click", function (event){
    const button = event.target.closest('button');
    if(!button) return;
    currentFilter = button.dataset.filter;
    render();
});

grid.addEventListener('click', function (event){
    const tile = event.target.closest('.tile');
    if(!tile) return;
    const id = Number(tile.dataset.id);
    openEditor(carts.find(function (c) {return c.id === id;}));
});

document.getElementById('addBtn').addEventListener('click', function (){
    const nextId = carts.length ? Math.max(...carts.map(c => c.id)) + 1 : 1;
    openEditor({id: nextId, status: "Spare", owner: '', location: ''});
});

document.getElementById('saveBtn').addEventListener('click', function (){
    editingCart.status = document.getElementById('statusInput').value;
    editingCart.owner = document.getElementById('ownerInput').value;
    editingCart.location = document.getElementById('locationInput').value;
    if(!carts.includes(editingCart)) carts.push(editingCart);
    saveCarts();
    editor.close();
    render();
});

document.getElementById('cancelBtn').addEventListener('click', function(){
    editor.close();
});

document.getElementById('deleteBtn').addEventListener('click', function (){
    if(!carts.includes(editingCart)){
        editor.close();
        return;
    }
if(confirm(`Delete cart # ${editingCart.id}?`)){
    carts.splice(carts.indexOf(editingCart), 1);
    saveCarts();
    editor.close();
    render();
};
})

function renderSummary(){
    const inUse = carts.filter(c => c.status === 'use').length;
    const onVacation = carts.filter(c => c.status === 'vacant').length;
    const spare = carts.filter(c => c.status === 'spare').length;
    const ready = onVacation + spare;

    document.getElementById('summary').innerHTML = `<div class="stat big"><b>${ready}</b><span>Total Carts Available</span></div>
    <div class="stat"><b class="summaryNum">${inUse}</b><span>in use</span></div>
    <div class="stat"><b class="summaryNum">${onVacation}</b><span>Iddle</span></div>
    <div class="stat"><b class="summaryNum">${spare}</b><span>spare</span></div>`
};

function renderLocations(){
    const locations = [...new Set(carts.map(c => c.location).filter(Boolean))].sort();
    if(currentLocation && !locations.includes(currentLocation)){
        currentLocation = "";
    }

    locationSelect.innerHTML = `<option value="">All locations</option>` +
    locations.map(l => `<option value="${l}">${l}</option>`).join("");
    locationSelect.value = currentLocation;
};

searchInput.addEventListener('input', render);

locationSelect.addEventListener('chang', function (){
    currentLocation = locationSelect.value;
    render();
});

//when the data changes call render again
render();