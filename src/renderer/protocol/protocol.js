const { ipcRenderer } = require('electron');

let wait = 5;
let timer = null;
let fetchDataReceive = null;

var $btnAgree = document.getElementById('btnAgree');
var $btnDisagree = document.getElementById('btnDisagree');

ipcRenderer.on('show-protocol', (event, fetchData) => {
	fetchDataReceive = fetchData;
});

(function (wait) {
	timer = setInterval(() => {
		if (wait === 1) {
			$btnAgree.removeAttribute('disabled');
			$btnAgree.innerHTML = '已阅读且同意';
			clearInterval(timer);
			timer = null;
		} else {
			wait--;
			$btnAgree.innerHTML = `已阅读且同意 (${wait})`;
		}
	}, 1000);
})(wait);

$btnAgree.addEventListener('click', (e) => {
	ipcRenderer.send('protocol-read', fetchDataReceive, true);
    fetchDataReceive = null;
});

$btnDisagree.addEventListener('click', (e) => {
	ipcRenderer.send('protocol-read', fetchDataReceive, false);
    fetchDataReceive = null;
});
