// Function to construct the query URL based on user inputs
function buildQueryUrl() {
    let query = 'https://api.scryfall.com/cards/search?q=';

    // Get the input values
    const nameInput = document.getElementById('name').value.trim();
    const typeInput = document.getElementById('type').value.trim();
    const manaCostRangeInput = document.getElementById('manaCostRange').value.trim();
    const convertedManaCostInput = document.getElementById('convertedManaCost').value.trim();
    const descriptionInput = document.getElementById('description').value.trim();

    // Build the query for name (multiple names with "or" logic)
    if (nameInput) {
        const names = nameInput.split(',').map(n => `name:${n.trim()}`).join(' OR ');
        query += `(${names}) `;
    }

    // Build the query for type (multiple types with "or" logic)
    if (typeInput) {
        const types = typeInput.split(',').map(t => `type:${t.trim()}`).join(' OR ');
        query += `(${types}) `;
    }

    // Build the query for mana cost range
    if (manaCostRangeInput) {
        const manaCosts = manaCostRangeInput.split(',').map(mc => `cmc=${mc.trim()}`).join(' OR ');
        query += `(${manaCosts}) `;
    }

    // Add converted mana cost if provided
    if (convertedManaCostInput) {
        query += `cmc=${convertedManaCostInput} `;
    }

    // Build the query for description (multiple words with "or" logic)
    if (descriptionInput) {
        const descriptions = descriptionInput.split(',').map(d => `oracle:${d.trim()}`).join(' OR ');
        query += `(${descriptions}) `;
    }

    return query.trim();
}

// Function to fetch data from the Scryfall API based on user query
async function fetchScryfallData() {
    const url = buildQueryUrl();
    const response = await fetch(url, {
        headers: {
            "User-Agent": "ScryfallApp/1.0",
            "Accept": "application/json"
        }
    });
    const data = await response.json();
    return data.data;  // Return only the card data
}

// Function to display data in the table
function displayTable(cards) {
    const tableBody = document.querySelector('#cardTable tbody');
    tableBody.innerHTML = '';  // Clear any existing rows

    cards.forEach(card => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = card.name;
        row.appendChild(nameCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = card.type_line;
        row.appendChild(typeCell);

        const manaCostCell = document.createElement('td');
        manaCostCell.textContent = card.mana_cost ? card.mana_cost : "N/A";
        row.appendChild(manaCostCell);

        tableBody.appendChild(row);
    });

    // Enable the Download Excel button after table is populated
    document.getElementById('downloadExcel').disabled = false;
}

// Function to convert data to Excel and download using SheetJS
function downloadExcel(cards) {
    const worksheetData = cards.map(card => ({
        Name: card.name,
        Type: card.type_line,
        ManaCost: card.mana_cost ? card.mana_cost : "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cards');

    XLSX.writeFile(workbook, 'scryfall_cards.xlsx');
}

// Button event listener to fetch data and display table
document.getElementById('fetchData').addEventListener('click', async () => {
    const cards = await fetchScryfallData();
    displayTable(cards);
    
    // Store the fetched data for use in the Excel download
    document.getElementById('downloadExcel').addEventListener('click', () => {
        downloadExcel(cards);
    });
});
