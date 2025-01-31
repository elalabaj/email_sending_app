const inputFrom = document.getElementById('from');
const inputTo = document.getElementById('to');
const inputSubject = document.getElementById('subject');
const textAreaMessage = document.getElementById('message');
const inputFiles = document.getElementById('files');
const buttonSend = document.getElementById('send');

const baseURL = 'http://127.0.0.1:8000'

getFromUsername();
buttonSend.addEventListener('click', sendEmail);

async function getFromUsername() {
    const res = await fetch(baseURL + '/from', { method: 'GET' });
    const data = await res.json();
    const username = data.username;
    inputFrom.value = username;
};

async function sendEmail() {
    if (inputTo.value == '') {
        window.alert('Please enter recipents email adress');
        return;
    }

    const formData = new FormData();
    formData.append('from', inputFrom.value);
    formData.append('to', inputTo.value);
    formData.append('subject', inputSubject.value);
    formData.append('message', textAreaMessage.value);
    for (const file of inputFiles.files) formData.append('files', file);

    inputTo.value = '';
    inputSubject.value = '';
    textAreaMessage.value = '';
    inputFiles.value = '';

    try {
        const res = await fetch(baseURL, {method: 'POST', body: formData});
        const info = await res.json();
        if (!res.ok) throw new Error(info);
        window.alert(info);
    }
    catch(err) {
        window.alert(err);
    }
};