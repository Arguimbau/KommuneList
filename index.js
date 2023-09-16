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
        kommuner = await fetch(URLkommuner)
            .then(handleHttpErrors)
        console.log(kommuner)
    } catch (err) {
        if (err.apiError) {
            console.error("Full API error: ", err.apiError)
        }else {
            console.error(err.message)
        }
    }

    makeRows()
}
//Edit & Delete
function handleTableClick(evt) {
    evt.preventDefault()
    evt.stopPropagation()
    const target = evt.target;

    if (target.dataset.idDelete) {
        const idToDelete = Number(target.dataset.idDelete)

        const options = makeOptions("DELETE")
        fetch(`${URLkommuner}/${idToDelete}`, options)
            .then(handleHttpErrors)
            .catch(err =>{
                if (err.apiError){
                    console.error("Full API error: ", err.apiError)

                }else{
                    console.error(err.message)
                }
            })
        kommuner = kommuner.filter(k => k.id !== idToDelete)

        makeRows()
    }

    if (target.dataset.idEdit){
        const idToEdit = Number(target.dataset.idEdit)
        kommuner = kommuner.find(k => k.id === idToEdit)
        showModal(kommuner)
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
    document.getElementById("modal-title").innerText = kommune && kommune.kode ? "Edit Kommuner" : "Add Kommuner";
    document.getElementById("kommuneKode").innerText = kommune && kommune.kode ? kommune.kode : "";
    document.getElementById("input-kode").value = kommune && kommune.kode ? kommune.kode : ""; // Corrected ID
    document.getElementById("input-name").value = kommune && kommune.navn ? kommune.navn : ""; // Corrected ID

    myModal.show();
}


// SAVE
async function saveStudent() {
    let kommune = {}
    kommune.id = Number(document.getElementById("kommuneKode").innerText)
    kommune.name = document.getElementById("input-navn").value
    kommune.bornDate = document.getElementById("input-region").value

    if (kommune.id){ //Edit

        const options = makeOptions("PUT",kommune)
        try {
            kommune = await fetch(`${URLkommune}/${kommune.kode}`,options)
                .then(handleHttpErrors)
        }catch (err){
            if (err.apiError){
                console.error("Full API error: ", err.apiError)
            }else {
                console.error(err.message)
            }
        }

        kommuner = kommuner.map(k => (k.kode === kommune.kode) ? kommune : k)
    } else {
        const options = makeOptions("POST",kommune)
        try {
            kommune = await fetch(URLkommuner,options)
                .then(handleHttpErrors)

        } catch (err){
            if (err.apiError){
                console.log("Full API error: ", err.apiError)
            }else {
                console.log(err.message)
            }
        }
        kommuner.push(kommune)
    }

    makeRows()
}
//Kommune
async function saveKommune() {
    let newKommune = {} // Use a different variable name here
    newKommune.kode = Number(document.getElementById("input-kode").innerText)
    newKommune.navn = document.getElementById("input-navn").value
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
