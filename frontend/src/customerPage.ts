document.addEventListener('DOMContentLoaded', () => {
    const csvFileInput = document.getElementById('upload-customer') as HTMLInputElement;
    const tableBody = document.getElementById('tableBody'); 

    csvFileInput.addEventListener('change', handleFileUpload);

    function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            parseCSV(file);
        }
    }

    function parseCSV(file: File) {
        const reader = new FileReader();

        reader.onload = async function (e) {
            const contents = e.target?.result as string;
            const rows = contents.split('\n').map(row => row.split(','));

            console.log('Parsed CSV Rows:', rows);
            const jsonData = csvToJson(contents);
            console.log(jsonData)
            await sendToServer(jsonData);
        };

        reader.readAsText(file);
        
    }

    function csvToJson(csvData: string) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
    
        const customers = [];
    
        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',');
    
            const customer = {
                intnr: currentLine[0],
                type: currentLine[1],
                contact_persons: [
                    {
                        first_name: currentLine[2],
                        last_name: currentLine[3],
                        email: currentLine[4],
                        mobile_phone: currentLine[5],
                        birth_date: currentLine[6]
                    }
                ],
                addresses: [
                    {
                        company_name: currentLine[7],
                        country: currentLine[8],
                        city: currentLine[9],
                        zip: currentLine[10],
                        fax: currentLine[11],
                        phone: currentLine[12],
                        street: currentLine[13],
                        email: currentLine[14]
                    }
                ]
            };
    
            customers.push(customer);
        }
    
        return { customers };
    }

    async function sendToServer(data: any) {
        const apiUrl = 'http://localhost:3000/customers-page/customers';
    
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (response.ok) {
                console.log('Data successfully sent to the server');
            } else {
                console.error('Error sending data to the server');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function displayTable(rows: string[][]) {
        if (tableBody) {
            tableBody.innerHTML = '';
            for (let i = 1; i < rows.length; i++) {
                const row = document.createElement('tr');

                rows[i].forEach((cell, index) => {
                    const td = document.createElement('td');
                    td.textContent = cell;

                    row.appendChild(td);
                });

                const actionTd = document.createElement('td');

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';

                actionTd.appendChild(deleteButton);

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                actionTd.appendChild(editButton);

                row.appendChild(actionTd);

                tableBody.appendChild(row);
            }
        }
    }
});
