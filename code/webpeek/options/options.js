// Saves the options to chrome.storage
document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const apiKey = document.querySelector('#apiKey').value;
    const length = document.querySelector('#length').value;
    const format = document.querySelector('#format').value;
    const model = document.querySelector('#model').value;
    const extractiveness = document.querySelector('#extractiveness').value;
    const temperature = parseFloat(document.querySelector('#temperature').value);
    const displayColor = document.querySelector('#displayColor').value;
    const targetLanguage = document.querySelector('#targetLanguage').value;

    chrome.storage.sync.set({
        "apiKey": apiKey,
        "options": {
            "length": length,
            "format": format,
            "model": model,
            "extractiveness": extractiveness,
            "temperature": temperature,
            "displayColor": displayColor,
            "targetLanguage": targetLanguage
        }
    }, () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        status.style.textAlign = 'center';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});

// Load saved options when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(["apiKey", "options"], (data) => {
        document.querySelector('#apiKey').value = data.apiKey || "";
        const options = data.options || {};
        document.querySelector('#length').value = options.length || "auto";
        document.querySelector('#format').value = options.format || "auto";
        document.querySelector('#model').value = options.model || "summarize-xlarge";
        document.querySelector('#extractiveness').value = options.extractiveness || "auto";
        document.querySelector('#temperature').value = options.temperature || 0.1;
        document.querySelector('#displayColor').value = options.displayColor || "#151922";
        document.querySelector('#targetLanguage').value = options.targetLanguage || "en";
    });
});
