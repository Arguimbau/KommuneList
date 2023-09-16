const URLkommuner = "http://localhost:8080/getkommuner";
let kode = ""
const URLkommune  = `http://localhost:8080/getkommunebykode/${kode}`;
const URLRegioner = "http://localhost:8080/getregioner";

let kommuner = []
//Handlers
function setUpHandlers() {
    document.getElementById("kommune-table-body").onclick = handleTableClick
    document.getElementById("btn-save").onclick = saveKommune
    //document.getElementById("btn-add-kommune").onclick = makeNewKommune
}
setUpHandlers()

//Regioner
async function fetchRegioner() {
    try {
        regioner = await fetch(URLRegioner)
            .then(handleHttpErrors)
        console.log(regioner)
    } catch (err) {
        if (err.apiError) {
            console.error("Full API error: ", err.apiError)
        }else {
            console.error(err.message)
        }
    }

    makeRows()
}
//Table
function makeRows() {
    //make rows from data
    const rows = kommuner.map(k => `
        <tr>
            <td>${k.kode}</td>
            <td>${k.navn}</td>
            <td>${k.region.navn}</td>
            <td><a data-id-delete=${k.id} href="#">Delete</a></td>
            <!-- <td><a data-data-edit='${JSON.stringify(k)}' href="#">Edit</a></td> -->
            <td><a data-id-edit='${k.id}' href="#">Edit</a></td>
        </tr>
        `)
    document.getElementById("kommune-table-body").innerHTML = rows.join("")
}
//Kommuner
fetchRegioner()
fetchKommuner()
async function fetchKommuner() {
    try {
        const response = await fetch(URLkommuner);
        const data = await response.json();
        console.log(data); // Log the response data
        kommuner = data; // Assign the response data to kommuner
        makeRows(); // Update the table rows with the new data
    } catch (err) {
        if (err.apiError) {
            console.error("Full API error: ", err.apiError);
        } else {
            console.error(err.message);
        }
    }
}

//Edit & Delete
async function handleTableClick(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    const target = evt.target;

    if (target.dataset.idDelete) {
        const idToDelete = Number(target.dataset.idDelete);

        const options = makeOptions("DELETE");
        fetch(`${URLkommuner}/${idToDelete}`, options)
            .then(handleHttpErrors)
            .catch(err => {
                if (err.apiError) {
                    console.error("Full API error: ", err.apiError);
                } else {
                    console.error(err.message);
                }
            });

        // Filter out the deleted item from the kommuner array
        kommuner = kommuner.filter(k => k.id !== idToDelete);

        makeRows();
    }

    if (target.dataset.idEdit) {
        const idToEdit = Number(target.dataset.idEdit);

        // Use await to ensure fetchKommuner() completes before proceeding
        await fetchKommuner();

        // Find the kommune object to edit without modifying the kommuner array
        const kommuneToEdit = kommuner.find(k => k.id === idToEdit);

        showModal(kommuneToEdit); // Pass the found kommune object to showModal
    }

}




//Error

async function handleHttpErrors(res) {
    if (!res.ok) {
        const errorResponse = await res.json();
        const error = new Error(errorResponse.message)
        error.apiError = errorResponse
        throw error
    }
    return res.json()
}
//Modal

function showModal(kommune) {
    const myModal = new bootstrap.Modal(document.getElementById('kommune-modal'));
    const kodeInput = document.getElementById("input-kode");
    const nameInput = document.getElementById("input-name");

    // Set the value of the Kode input field to the Kode value and make it readonly
    kodeInput.value = kommune && kommune.kode ? kommune.kode : "NOT FOUND";
    kodeInput.setAttribute("readonly", true);

    // Set the value of the Name input field to the Navn value
    nameInput.value = kommune && kommune.navn ? kommune.navn : "";

    document.getElementById("modal-title").innerText = kommune && kommune.kode ? "Edit Kommuner" : "Add Kommuner";
    document.getElementById("kommuneKode").innerText = kommune && kommune.kode ? kommune.kode : "";

    myModal.show();
}


// SAVE Kommune
async function saveKommune() {
    let newKommune = {}
    newKommune.kode = document.getElementById("input-kode").value; // Corrected ID
    newKommune.navn = document.getElementById("input-name").value; // Corrected ID
    newKommune.region = document.getElementById("input-region").value

    if (newKommune.kode){
        const options = makeOptions("PUT", newKommune)
        try {
            newKommune = await fetch(`${URLkommuner}/${newKommune.kode}`, options)
                .then(handleHttpErrors)
        } catch (err){
            if (err.apiError){
                console.error("Full API error: ", err.apiError)
            } else {
                console.error(err.message)
            }
        }
        kommuner = kommuner.map(k => (k.kode === newKommune.kode) ? newKommune : k)
    } else {
        const options = makeOptions("POST", newKommune)
        try {
            newKommune = await fetch(URLkommuner, options)
                .then(handleHttpErrors)
        } catch (err){
            if (err.apiError){
                console.log("Full API error: ", err.apiError)
            } else {
                console.log(err.message)
            }
        }
        kommuner.push(newKommune)
    }

    makeRows()
}


function makeOptions(method, data) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    return options;
}